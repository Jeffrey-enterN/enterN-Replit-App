#!/bin/bash

echo "=== Starting jobseeker profile refresh process ==="
echo ""

echo "Step 1: Randomizing all jobseeker slider values..."
npx tsx randomize-jobseeker-sliders.ts
echo ""

echo "Step 2: Ensuring all profiles meet completion requirements..."
npx tsx ensure-profile-completion.ts
echo ""

echo "=== Profile refresh complete! ==="