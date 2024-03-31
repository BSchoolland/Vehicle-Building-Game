#!/bin/bash

# Absolute path to the project root
PROJECT_ROOT="$(pwd)"

# Directory containing SCSS files
SCSS_DIR="$PROJECT_ROOT/public/css/scss"

# Output directory for CSS files
CSS_DIR="$PROJECT_ROOT/public/css"

echo "SCSS Directory: $SCSS_DIR"
echo "CSS Directory: $CSS_DIR"

# Find and compile .scss files
find "$SCSS_DIR" -iname "*.scss" -type f -exec sh -c '
  # Get a file name without its directory path and extension
  filename=$(basename "{}" .scss)
  
  # Define the output path
  out="'$CSS_DIR'/${filename}.css"
  
  echo "Compiling {} to $out"
  
  # Compile SCSS to CSS
  node-sass "{}" "$out"
' \;
