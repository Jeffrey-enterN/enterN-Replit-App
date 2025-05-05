#!/bin/bash

# Script to clean up existing jobseeker profiles and create new ones with updated sliders

echo "Step 1: Cleaning up existing jobseeker profiles..."
npx tsx scripts/clean-up-jobseekers.ts

# Give the database a moment to complete the deletions
sleep 3

echo -e "\nStep 2: Creating new jobseeker profiles with updated sliders..."
npx tsx scripts/add-updated-jobseekers.ts

echo -e "\nJobseeker profile refresh complete!"