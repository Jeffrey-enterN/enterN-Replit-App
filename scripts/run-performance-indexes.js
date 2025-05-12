/**
 * Script to run the performance index migration
 * 
 * This script adds important database indexes to improve query performance
 * as the application scales to handle hundreds or thousands of users.
 * 
 * Usage:
 * node scripts/run-performance-indexes.js
 */

import 'dotenv/config';
import { spawn } from 'child_process';

console.log('Running performance indexes migration...');

// Use tsx to run TypeScript migration file
const child = spawn('npx', ['tsx', 'migrations/add-performance-indexes.ts'], {
  stdio: 'inherit'
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('Performance indexes migration completed successfully.');
  } else {
    console.error(`Performance indexes migration failed with code ${code}.`);
    process.exit(1);
  }
});