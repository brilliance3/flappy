#!/bin/bash
# Double-click launcher for the Tap Tap Tap game.
# Starts the Vite dev server and opens it in your default browser.
cd "$(dirname "$0")" || exit 1

echo "=============================="
echo "  TAP TAP TAP — starting up"
echo "=============================="

# Install dependencies the first time only.
if [ ! -d node_modules ]; then
  echo "First run: installing dependencies (this can take a minute)..."
  npm install
fi

# Open the browser a few seconds after the server boots.
( sleep 4; open "http://localhost:5173" ) &

echo "Launching dev server... (close this window or press Ctrl+C to stop)"
npm run dev
