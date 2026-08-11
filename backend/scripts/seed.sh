#!/bin/bash

# Database seeding script

set -e

echo "🌱 Starting database seeding..."

# Load environment
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Run seed
npm run prisma:seed

echo "✅ Seeding completed successfully!"