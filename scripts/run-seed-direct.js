import { execSync } from 'child_process';

try {
  console.log('Running direct seeding approach...');
  execSync('NODE_ENV=development tsx scripts/seed-companies-direct.ts', { stdio: 'inherit' });
  console.log('Seed completed successfully!');
} catch (error) {
  console.error('Error running seed script:', error);
  process.exit(1);
}