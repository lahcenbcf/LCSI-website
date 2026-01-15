#!/bin/sh
# start.sh

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting Next.js app..."
node server.js
