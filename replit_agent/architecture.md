# Architecture Overview

## 1. Overview

enterN is a recruiting platform that connects early career jobseekers with employers through a preference-based matching system. The application features:

- Separate interfaces for jobseekers and employers
- Profile creation and management for both user types
- Match feed functionality similar to dating apps
- Company profile management for employers
- Job posting management

The application follows a modern full-stack JavaScript architecture with a clear separation between client and server components.

## 2. System Architecture

The application follows a client-server architecture with:

- **Frontend**: React-based single-page application (SPA)
- **Backend**: Node.js Express server
- **Database**: PostgreSQL database using Neon's serverless PostgreSQL solution
- **ORM**: Drizzle ORM for database interactions

### High-Level Architecture Diagram

```
┌─────────────────┐           ┌─────────────────┐           ┌─────────────────┐
│                 │           │                 │           │                 │
│  React Client   │◄─────────►│  Express Server │◄─────────►│  PostgreSQL DB  │
│  (Vite/SPA)     │   HTTP    │  (Node.js)      │  Drizzle  │  (Neon)         │
│                 │   API     │                 │   ORM     │                 │
└─────────────────┘           └─────────────────┘           └─────────────────┘
```

## 3. Key Components

### 3.1 Frontend Architecture

The frontend is built with React and uses:

- **Build System**: Vite
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: React Query for server state, Context API for application state
- **Form Handling**: React Hook Form with Zod validation
- **UI Framework**: Custom UI components using shadcn/ui (based on Radix UI primitives)
- **Styling**: Tailwind CSS with a custom design system

The frontend follows a feature-based organization with:

- `/client/src/pages`: Page components organized by user type
- `/client/src/components`: Reusable UI components
- `/client/src/context`: React context providers
- `/client/src/hooks`: Custom React hooks
- `/client/src/lib`: Utility functions and constants

### 3.2 Backend Architecture

The backend is an Express.js application with:

- **API Layer**: RESTful endpoints defined in `server/routes.ts`
- **Authentication**: Passport.js with local strategy
- **Database Access**: Drizzle ORM
- **Session Management**: Express-session with options for memory store or PostgreSQL store

The backend follows a modular structure:

- `/server/routes.ts`: API route definitions
- `/server/auth.ts`: Authentication setup and logic
- `/server/db.ts`: Database connection and configuration
- `/server/storage.ts`: Data access layer
- `/server/middleware`: Custom middleware functions
- `/server/utils`: Utility functions

### 3.3 Database Schema

The database schema is defined in `shared/schema.ts` using Drizzle ORM syntax. Key entities include:

- **Users**: Authentication info and user type (jobseeker/employer)
- **Companies**: Company profiles and information
- **JobseekerProfiles**: Detailed profiles for jobseekers
- **EmployerProfiles**: Detailed profiles for employers
- **JobPostings**: Job listings created by employers
- **Matches**: Connections between jobseekers and employers/jobs
- **Swipes**: Record of user interactions with potential matches

### 3.4 Authentication System

The application uses:

- **Session-based Authentication**: Express-session with Passport.js
- **Password Handling**: Secure password hashing with scrypt
- **Role-based Authorization**: Different access patterns for jobseekers and employers
- **Permission Middleware**: Custom middleware to protect routes based on user type and role

## 4. Data Flow

### 4.1 Authentication Flow

1. User registers with email and password
2. Password is hashed using scrypt
3. User data is stored in the database
4. On login, provided credentials are verified against stored data
5. Authenticated user receives a session cookie
6. Subsequent requests include the session cookie for authentication

### 4.2 Profile Creation Flow

#### Jobseeker Profile
1. User enters education details, locations, work arrangements
2. User sets preference values using sliders
3. Profile data is stored in the database
4. Profile can be updated at any time

#### Employer/Company Profile
1. Company details are entered including name, industry, size
2. Company culture and values are defined
3. Company admins can invite team members with specific roles
4. Company profile is made available for matching

### 4.3 Matching Flow

1. Users are presented with potential matches in a card-based interface
2. Users can swipe/select to indicate interest or pass
3. When both parties express interest, a match is created
4. Matched users can communicate and proceed with the hiring process

## 5. External Dependencies

### 5.1 Key Frontend Libraries

- **@radix-ui/***: UI component primitives
- **@tanstack/react-query**: Data fetching and cache management
- **react-hook-form**: Form handling
- **zod**: Schema validation
- **tailwindcss**: Utility-first CSS framework

### 5.2 Key Backend Libraries

- **express**: Web server framework
- **passport**: Authentication middleware
- **@neondatabase/serverless**: Serverless PostgreSQL client
- **drizzle-orm**: TypeScript ORM
- **express-session**: Session management

### 5.3 External Services

- **SendGrid**: Email delivery service for notifications and communication
- **Neon**: Serverless PostgreSQL database

## 6. Deployment Strategy

The application is configured for deployment on:

- **Development**: Local development with Vite dev server
- **Production**: Deployed as a single application with server-rendered pages

### 6.1 Build Process

1. Client code is built using Vite (`vite build`)
2. Server code is bundled using esbuild
3. Static assets are served from the `dist/public` directory
4. Server runs from the `dist/index.js` entry point

### 6.2 Environment Configuration

Environment variables control:
- Database connection string
- Session secret
- Email service API keys
- Other service-specific configuration

The application supports different environments through the `NODE_ENV` variable:
- `development`: Enhanced logging, error details, development conveniences
- `production`: Optimized for performance and security

### 6.3 Replit Deployment

The repository includes configuration for Replit:
- `.replit` file defines run commands and port configuration
- Replit-specific plugins for error reporting and debugging

## 7. Development Workflow

### 7.1 Code Organization

- **Shared Code**: `/shared` directory contains schema definitions and types used by both client and server
- **Server Code**: `/server` contains the Express application and API endpoints
- **Client Code**: `/client` contains the React application and UI components
- **Scripts**: Utility scripts for database operations and development tasks

### 7.2 Database Migrations

Database schema changes are managed using Drizzle Kit:
- `drizzle.config.ts` configures the migration system
- `/migrations` directory contains SQL migration files
- `npm run db:push` applies schema changes to the database

## 8. Security Considerations

- **Password Security**: Passwords are hashed using scrypt with unique salts
- **Session Management**: Secure session configuration with proper cookie settings
- **Input Validation**: Strong validation of user inputs using Zod schemas
- **Authorization**: Permission-based access control for sensitive operations