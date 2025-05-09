import { execSync } from 'child_process';

try {
  console.log('Compiling and running the seed-sample-companies.ts script...');
  execSync('NODE_ENV=development tsx scripts/seed-sample-companies.ts', { stdio: 'inherit' });
  console.log('Sample companies seeding completed successfully!');
} catch (error) {
  console.error('Error running seed script:', error);
  process.exit(1);
}