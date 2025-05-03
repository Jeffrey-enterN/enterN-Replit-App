import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users, USER_TYPES } from "@shared/schema";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

// Make sure to load configuration details from oidc provider (Replit Auth)
const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    pool,
    createTableIfMissing: true,
    tableName: "sessions",
    ttl: sessionTtl,
  });
  
  return session({
    secret: process.env.SESSION_SECRET || "enterN-secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: "auto",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;

  // Mark iOS clients in session to handle different content types
  const userAgent = user.userAgent;
  if (userAgent && userAgent.includes('iOS')) {
    user.isIOSClient = true;
    console.log("iOS client detected. Session ID: " + user.sessionId + ", User authenticated: " + !!user.id);
  }
}

async function upsertUser(claims: any) {
  if (!claims.sub || !claims.username) {
    console.error("Missing required claims for user creation:", claims);
    throw new Error("Invalid user claims from OAuth provider");
  }

  try {
    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, claims.username));

    if (existingUser) {
      // Update the existing user with new OIDC data
      const [updatedUser] = await db
        .update(users)
        .set({
          firstName: claims.first_name || existingUser.firstName,
          lastName: claims.last_name || existingUser.lastName,
          email: claims.email || existingUser.email,
          updatedAt: new Date()
        })
        .where(eq(users.id, existingUser.id))
        .returning();
      
      return updatedUser;
    } else {
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          username: claims.username,
          password: "replit-auth-" + Math.random().toString(36).substring(2), // Placeholder password for Replit Auth users
          userType: USER_TYPES.JOBSEEKER, // Default to jobseeker, can be changed later
          firstName: claims.first_name || null,
          lastName: claims.last_name || null,
          email: claims.email || null
        })
        .returning();
      
      return newUser;
    }
  } catch (error) {
    console.error("Error upserting user:", error);
    throw error;
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    try {
      const tokenClaims = tokens.claims();
      
      const user: any = {};
      updateUserSession(user, tokens);
      
      // Store user in database
      const dbUser = await upsertUser(tokenClaims);
      
      // Add user ID and other data to session
      user.id = dbUser.id;
      user.username = dbUser.username;
      user.userType = dbUser.userType;

      verified(null, user);
    } catch (error) {
      console.error("Error in verify function:", error);
      verified(error as Error);
    }
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => {
    const sessionUser = {
      id: (user as any).id,
      username: (user as any).username
    };
    cb(null, sessionUser);
  });
  
  passport.deserializeUser((sessionUser: Express.User, cb) => cb(null, sessionUser));

  app.get("/api/login", (req, res, next) => {
    // Store user agent for iOS detection
    (req.session as any).userAgent = req.headers['user-agent'];
    
    const hostname = req.hostname;
    passport.authenticate(`replitauth:${hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    // Pass the user agent to the session
    if (req.session) {
      (req as any).userAgent = (req.session as any).userAgent;
      (req as any).sessionId = req.sessionID;
    }
    
    const hostname = req.hostname;
    passport.authenticate(`replitauth:${hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });

  // Middleware to check for iOS clients
  app.use((req, res, next) => {
    const userAgent = req.headers['user-agent'];
    if (userAgent && userAgent.includes('iOS')) {
      (req.session as any).isIOSClient = true;
      if (req.path === '/api/user') {
        console.log("iOS client detected on /api/user endpoint");
      }
    }
    next();
  });

  // Auth check endpoint
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get complete user data from the database
      const [dbUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (!dbUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Send user data but don't include the password
      const { password, ...userWithoutPassword } = dbUser;
      console.log("User data successfully sent for user ID: " + userId);
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Debug info for authentication issues
  console.log(`/api/user request - Session ID: ${req.sessionID}`);
  console.log(`  isAuthenticated: ${req.isAuthenticated()}`);
  console.log(`  session exists: ${!!req.session}`);
  if (req.session) {
    console.log(`  session cookie settings: ${JSON.stringify(req.session.cookie)}`);
  }

  if (!req.isAuthenticated()) {
    console.log(`Not authenticated - Session ID: ${req.sessionID}, Path: ${req.path}, Method: ${req.method}`);
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Check for existing user in the database
  const user = req.user as any;
  if (!user || !user.id) {
    return res.status(401).json({ message: "Invalid user session" });
  }

  // For token-based authentication, we would check expiration and refresh
  // But with passport session, we are relying on session validity

  return next();
};