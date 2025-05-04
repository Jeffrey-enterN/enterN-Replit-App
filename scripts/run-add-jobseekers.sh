#!/bin/bash

# Run the typescript script with tsx
echo "Running script to add jobseeker profiles..."
cd "$(dirname "$0")/.."
npx tsx scripts/add-jobseekers.ts