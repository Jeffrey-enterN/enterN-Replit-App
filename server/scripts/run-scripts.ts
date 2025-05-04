// Add script imports here

async function main() {
  const scriptName = process.argv[2];
  
  if (!scriptName) {
    console.error('Please provide a script name to run');
    process.exit(1);
  }
  
  console.log(`Running script: ${scriptName}`);
  
  switch (scriptName) {
    case 'add-peoria-employers':
      await import('./add-peoria-employers');
      break;
    
    // Add other scripts here
    
    default:
      console.error(`Unknown script: ${scriptName}`);
      process.exit(1);
  }
}

main()
  .then(() => {
    console.log('Script execution completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });