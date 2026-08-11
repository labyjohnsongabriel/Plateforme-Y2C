#!/bin/bash

# Database backup script

set -e

echo "💾 Starting database backup..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Load environment
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
else
  echo -e "${RED}❌ .env file not found${NC}"
  exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}❌ DATABASE_URL is not set${NC}"
  exit 1
fi

# Create backup directory
BACKUP_DIR=${BACKUP_PATH:-"./backups"}
mkdir -p "$BACKUP_DIR"

# Generate backup filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

echo -e "${YELLOW}📁 Creating backup: $BACKUP_FILE${NC}"

# Extract database connection details
if [[ "$DATABASE_URL" =~ postgresql://([^:]+):([^@]+)@([^:]+):([0-9]+)/(.+) ]]; then
  USER="${BASH_REMATCH[1]}"
  PASSWORD="${BASH_REMATCH[2]}"
  HOST="${BASH_REMATCH[3]}"
  PORT="${BASH_REMATCH[4]}"
  DATABASE="${BASH_REMATCH[5]}"
else
  echo -e "${RED}❌ Invalid DATABASE_URL format${NC}"
  exit 1
fi

# Perform backup
export PGPASSWORD="$PASSWORD"
pg_dump -h "$HOST" -p "$PORT" -U "$USER" -d "$DATABASE" -F p | gzip > "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
  SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo -e "${GREEN}✅ Backup created successfully: $BACKUP_FILE ($SIZE)${NC}"
  
  # Create backup info file
  cat > "$BACKUP_DIR/backup_info_$TIMESTAMP.json" << EOF
{
  "filename": "$BACKUP_FILE",
  "timestamp": "$(date -Iseconds)",
  "size": "$SIZE",
  "database": "$DATABASE",
  "host": "$HOST"
}
EOF
  
  # Cleanup old backups (keep last 30 days)
  echo -e "${YELLOW}🗑️ Cleaning up old backups...${NC}"
  find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +30 -delete
  
  echo -e "${GREEN}✅ Backup completed successfully${NC}"
else
  echo -e "${RED}❌ Backup failed${NC}"
  exit 1
fi