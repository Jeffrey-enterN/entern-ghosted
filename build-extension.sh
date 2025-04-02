#!/bin/bash

# Create output directory
mkdir -p dist/extension
mkdir -p dist/extension/icons

# Copy manifest and scripts
cp client/manifest.json dist/extension/
cp client/background.js dist/extension/
cp client/content.js dist/extension/

# Copy icons if they exist
if [ -d "client/icons" ]; then
  cp -r client/icons/* dist/extension/icons/
fi

echo "Extension build complete! Files are in dist/extension/"