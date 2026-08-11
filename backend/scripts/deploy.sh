#!/bin/bash

# Deployment script for Youth Computing Backend

set -e

echo "🚀 Starting deployment..."

# Load environment variables
if [ -f .env.production ]; then
  export $(cat .env.production | grep -v '^#' | xargs)
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy

# Build application
echo "🏗️ Building application..."
npm run build

# Copy necessary files
echo "📋 Copying files..."
cp -r prisma dist/
cp -r src/templates dist/src/

# Start the application
echo "▶️ Starting application..."
pm2 start dist/server.js --name youth-computing-backend

echo "✅ Deployment completed successfully!"

# Health check
echo "🏥 Running health check..."
sleep 5
curl -f http://localhost:8000/health || echo "⚠️ Health check failed"