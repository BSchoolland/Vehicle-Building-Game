#!/bin/bash

# Shortcut to do everything in one command

echo "Starting all processes..."
sass --watch public/css/globals.scss:public/css/globals.css &
nodemon server.js