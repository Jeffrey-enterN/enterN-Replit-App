import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User, User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

// Properly extend the session interface for TypeScript
declare module 'express-session' {
  interface SessionData {
    isIOSClient?: boolean;
    passport?: any;
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Get session security configuration based on environment
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Detect if we're running on Replit (which provides HTTPS even in dev)
  const isReplit = process.env.REPL_ID !== undefined;
  
  // A more robust session configuration
  const sessionSettings: session.SessionOptions = {
    // In a production environment, use a strong secret set via environment variable
    secret: process.env.SESSION_SECRET || "enterN-secret-key-please-change-in-production",
    // Resave session to ensure it's saved even if not modified
    resave: true,
    // Save uninitialized sessions to ensure cookie is set on first visit
    saveUninitialized: true,
    // Use our configured store
    store: storage.sessionStore,
    // Rolling session - reset maxAge on every response (extends session lifetime with activity)
    rolling: true,
    // Name the cookie specifically for our app to avoid conflicts
    name: "enterN.sid",
    cookie: {
      // Set cookie security appropriate for the environment
      // Note: Replit provides HTTPS even in development
      secure: isProduction || isReplit,
      // Prevent client JavaScript from accessing the cookie
      httpOnly: true,
      // SameSite=None requires Secure, so we set based on environment
      // If we're in development and not on Replit, use 'lax' instead
      sameSite: isProduction || isReplit ? 'none' : 'lax',
      // Keep cookie for 30 days (in milliseconds)
      maxAge: 30 * 24 * 60 * 60 * 1000,
      // Allow cookie to be sent to all paths
      path: '/',
      // Domain lock to the current domain (automatically set)
      domain: undefined
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Middleware to detect iOS clients and adjust session handling
  // Must be added after session middleware
  // Debug middleware to log session status on every request
  app.use((req, res, next) => {
    // Detect iOS clients
    const userAgent = req.headers['user-agent'] || '';
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    
    if (isIOS) {
      if (req.session) {
        // Mark this as an iOS client and cast session to allow property assignment
        const session = req.session as any;
        session.isIOSClient = true;
        
        // Log session details for debugging
        console.log(`iOS client detected. Session ID: ${req.sessionID}, User authenticated: ${req.isAuthenticated()}`);
        
        // Set up a hook to save session data after response is sent
        const oldEnd = res.end;
        res.end = function(...args: any[]) {
          req.session.save(() => {
            // @ts-ignore
            oldEnd.apply(res, args);
          });
          return res;
        };
      }
    }
    
    // For all requests (iOS or not), log auth issues
    if (!req.isAuthenticated() && req.session) {
      if (req.method !== 'GET' || req.path.includes('/api/')) {
        console.log(`Not authenticated - Session ID: ${req.sessionID}, Path: ${req.path}, Method: ${req.method}`);
      }
    }
    
    next();
  });

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      // If user not found, return done with null user instead of throwing an error
      if (!user) {
        console.log(`User with ID ${id} not found during session deserialization`);
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      console.error('Error deserializing user:', error);
      return done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("Registration request received:", req.body);
      
      const { 
        username, 
        password, 
        userType, 
        email
      } = req.body;
      
      // Validate required fields
      if (!username || !password || !userType) {
        console.log("Validation failed: Missing required fields");
        return res.status(400).json({ message: "Username, password, and user type are required" });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        console.log("Validation failed: Username already exists");
        return res.status(400).json({ message: "Username already exists" });
      }

      // Detect iOS clients and mobile browsers
      const userAgent = req.headers['user-agent'] || '';
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isMobile = /Mobile|Android/.test(userAgent);
      
      // Mobile browsers may need special handling
      if ((isIOS || isMobile) && req.session && req.session.cookie) {
        // Get environment detection from outside scope
        const isProduction = process.env.NODE_ENV === 'production';
        const isReplit = process.env.REPL_ID !== undefined;
        
        console.log(`Mobile browser detected during registration. Optimizing session cookies.`);
        
        // Use appropriate settings for mobile browsers
        // Secure must be true when sameSite is 'none', except in some test environments
        req.session.cookie.secure = isProduction || isReplit; 
        req.session.cookie.sameSite = isProduction || isReplit ? 'none' : 'lax';
        
        // Ensure session doesn't expire too quickly
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      }

      const hashedPassword = await hashPassword(password);
      
      // Create user with minimal data - contact details will be added later
      console.log("Creating user with data:", { 
        username, 
        userType, 
        email: email || username
      });
      
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        userType,
        email: email || username, // Use the username (email) if email not explicitly provided
        firstName: null,
        lastName: null,
        companyName: null,
        phone: null,
      });

      // Remove password from the response
      const { password: _, ...userWithoutPassword } = user;

      req.login(user, (err) => {
        if (err) return next(err);
        
        // Force session save to ensure session persists immediately
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Error saving session after registration:", saveErr);
            return next(saveErr);
          }
          
          // Log session ID for debugging
          console.log(`User registered and authenticated. Session ID: ${req.sessionID}`);
          console.log(`Registration session cookie settings:`, {
            secure: req.session.cookie.secure,
            httpOnly: req.session.cookie.httpOnly,
            sameSite: req.session.cookie.sameSite,
            path: req.session.cookie.path,
            maxAge: req.session.cookie.maxAge
          });
          
          // Add additional headers to help preserve session
          res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
          res.set('Expires', '-1');
          res.set('Pragma', 'no-cache');
          
          res.status(201).json({
            ...userWithoutPassword,
            _meta: {
              authenticated: true,
              sessionID: req.sessionID,
              timestamp: new Date().toISOString(),
              isIOS
            }
          });
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "An unknown error occurred during registration" });
      }
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: any, info: { message: string } | undefined) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid username or password" });
      
      // Detect iOS clients and mobile browsers
      const userAgent = req.headers['user-agent'] || '';
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isMobile = /Mobile|Android/.test(userAgent);
      
      // Mobile browsers may need special handling
      if ((isIOS || isMobile) && req.session && req.session.cookie) {
        // Get environment detection from outside scope
        const isProduction = process.env.NODE_ENV === 'production';
        const isReplit = process.env.REPL_ID !== undefined;
        
        console.log(`Mobile browser detected during login. Optimizing session cookies.`);
        
        // Use appropriate settings for mobile browsers
        // Secure must be true when sameSite is 'none', except in some test environments
        req.session.cookie.secure = isProduction || isReplit; 
        req.session.cookie.sameSite = isProduction || isReplit ? 'none' : 'lax';
        
        // Ensure session doesn't expire too quickly
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        
        // Force session save to ensure session persists immediately
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Error saving session after login:", saveErr);
            return next(saveErr);
          }
          
          // Log successful login for debugging
          console.log(`User logged in and authenticated. Session ID: ${req.sessionID}, User ID: ${user.id}`);
          console.log(`Session cookie settings:`, {
            secure: req.session.cookie.secure,
            httpOnly: req.session.cookie.httpOnly,
            sameSite: req.session.cookie.sameSite,
            path: req.session.cookie.path,
            maxAge: req.session.cookie.maxAge
          });
          
          // Remove password from the response
          const { password: _, ...userWithoutPassword } = user;
          
          // Add additional headers to help preserve session
          res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
          res.set('Expires', '-1');
          res.set('Pragma', 'no-cache');
          
          return res.status(200).json({
            ...userWithoutPassword,
            _meta: {
              authenticated: true,
              sessionID: req.sessionID,
              timestamp: new Date().toISOString(),
              isIOS
            }
          });
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    // Log detailed debugging info for the user endpoint
    console.log(`/api/user request - Session ID: ${req.sessionID}`);
    console.log(`  isAuthenticated: ${req.isAuthenticated()}`);
    console.log(`  session exists: ${!!req.session}`);
    
    if (req.session) {
      console.log(`  session cookie settings:`, {
        secure: req.session.cookie.secure,
        httpOnly: req.session.cookie.httpOnly,
        sameSite: req.session.cookie.sameSite,
        maxAge: req.session.cookie.maxAge
      });
      
      // Detect iOS clients and mobile browsers
      const userAgent = req.headers['user-agent'] || '';
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isMobile = /Mobile|Android/.test(userAgent);
      
      // Mobile browsers may need special handling
      if ((isIOS || isMobile) && req.session) {
        // Get environment detection from outside scope
        const isProduction = process.env.NODE_ENV === 'production';
        const isReplit = process.env.REPL_ID !== undefined;
        
        console.log(`Mobile browser detected on /api/user endpoint. Optimizing session cookies.`);
        
        // Mark as mobile client and trace session
        const session = req.session as any;
        session.isMobileClient = true;
        
        // Use appropriate settings for mobile browsers
        if (req.session.cookie) {
          // Secure must be true when sameSite is 'none', except in some test environments
          req.session.cookie.secure = isProduction || isReplit; 
          req.session.cookie.sameSite = isProduction || isReplit ? 'none' : 'lax';
          
          // Ensure session doesn't expire too quickly
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        }
        
        // Force session save to persist mobile sessions
        req.session.touch();
        req.session.save();
      }
    }
    
    if (!req.isAuthenticated()) {
      console.log(`User not authenticated for /api/user - Status 401`);
      return res.sendStatus(401);
    }
    
    // Remove password from the response
    const { password: _, ...userWithoutPassword } = req.user;
    
    // Set the cache headers to prevent caching
    res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.set('Expires', '-1');
    res.set('Pragma', 'no-cache');
    
    console.log(`User data successfully sent for user ID: ${req.user.id}`);
    res.json(userWithoutPassword);
  });

  // Endpoint for updating user profile with contact details
  app.post("/api/user/profile", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to update your profile" });
      }

      const userId = req.user.id;
      const userType = req.user.userType;
      
      console.log("Profile update received:", req.body);
      
      // Validate required fields based on user type
      if (userType === 'jobseeker') {
        const { firstName, lastName, phone } = req.body;
        if (!firstName || !lastName || !phone) {
          return res.status(400).json({ message: "First name, last name, and phone are required for jobseekers" });
        }
        
        // Update the user record
        const updatedUser = await storage.updateUser(userId, {
          firstName,
          lastName,
          phone
        });
        
        // Remove password from the response
        const { password: _, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
      } 
      else if (userType === 'employer') {
        const { companyName, contactName, phone } = req.body;
        if (!companyName || !contactName || !phone) {
          return res.status(400).json({ message: "Company name, contact name, and phone are required for employers" });
        }
        
        // Update the user record
        const updatedUser = await storage.updateUser(userId, {
          companyName,
          firstName: contactName, // Using firstName field for contact name
          phone
        });
        
        // Remove password from the response
        const { password: _, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
      }
      else {
        return res.status(400).json({ message: "Invalid user type" });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "An unknown error occurred during profile update" });
      }
    }
  });
}
