/**
 * Run migration to add the swipedBy column to the swipes table
 */

const { addSwipedByColumn } = require('../migrations/add-swiped-by-column');

async function main() {
  try {
    await addSwipedByColumn();
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();