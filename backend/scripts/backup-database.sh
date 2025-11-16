#!/bin/bash

###############################################################################
# Database Backup Script for VaultScout
#
# This script creates a backup of the PostgreSQL database and optionally
# uploads it to cloud storage.
#
# Usage:
#   ./scripts/backup-database.sh [options]
#
# Options:
#   -d, --dir DIR       Backup directory (default: ./backups)
#   -r, --retention N   Keep backups for N days (default: 30)
#   -c, --compress      Compress backup with gzip
#   -v, --verbose       Verbose output
#   -h, --help          Show this help message
#
# Environment Variables:
#   DATABASE_URL        PostgreSQL connection string (required)
#   BACKUP_DIR          Default backup directory
#   RETENTION_DAYS      Default retention period
#
# Examples:
#   # Basic backup
#   ./scripts/backup-database.sh
#
#   # Compressed backup with custom directory
#   ./scripts/backup-database.sh -c -d /backups/vaultscout
#
#   # Keep backups for 7 days
#   ./scripts/backup-database.sh -r 7
#
###############################################################################

set -e  # Exit on error

# Default configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
COMPRESS=false
VERBOSE=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -d|--dir)
      BACKUP_DIR="$2"
      shift 2
      ;;
    -r|--retention)
      RETENTION_DAYS="$2"
      shift 2
      ;;
    -c|--compress)
      COMPRESS=true
      shift
      ;;
    -v|--verbose)
      VERBOSE=true
      shift
      ;;
    -h|--help)
      grep "^#" "$0" | grep -v "#!/bin/bash" | sed 's/^# //'
      exit 0
      ;;
    *)
      echo -e "${RED}Error: Unknown option $1${NC}"
      echo "Use -h or --help for usage information"
      exit 1
      ;;
  esac
done

# Function to log messages
log() {
  if [ "$VERBOSE" = true ]; then
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
  fi
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1" >&2
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  log_error "DATABASE_URL environment variable is not set"
  echo "Please set DATABASE_URL or create a .env.local file"
  exit 1
fi

# Load environment variables from .env.local if it exists
if [ -f ".env.local" ]; then
  log "Loading environment variables from .env.local"
  export $(grep -v '^#' .env.local | xargs)
fi

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
  log "Creating backup directory: $BACKUP_DIR"
  mkdir -p "$BACKUP_DIR"
fi

# Generate backup filename with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/vaultscout_$TIMESTAMP.sql"

log "Starting database backup..."
log "Backup file: $BACKUP_FILE"

# Create backup using pg_dump
if pg_dump "$DATABASE_URL" > "$BACKUP_FILE" 2>/dev/null; then
  BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  log_success "Backup created successfully: $BACKUP_FILE ($BACKUP_SIZE)"
else
  log_error "Failed to create backup"
  rm -f "$BACKUP_FILE"
  exit 1
fi

# Compress backup if requested
if [ "$COMPRESS" = true ]; then
  log "Compressing backup..."
  if gzip "$BACKUP_FILE"; then
    BACKUP_FILE="${BACKUP_FILE}.gz"
    COMPRESSED_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log_success "Backup compressed: $BACKUP_FILE ($COMPRESSED_SIZE)"
  else
    log_warning "Failed to compress backup, keeping uncompressed version"
  fi
fi

# Remove old backups based on retention policy
log "Cleaning up old backups (retention: $RETENTION_DAYS days)..."

if [ "$COMPRESS" = true ]; then
  PATTERN="*.sql.gz"
else
  PATTERN="*.sql"
fi

DELETED_COUNT=0
while IFS= read -r old_backup; do
  if [ -n "$old_backup" ]; then
    log "Deleting old backup: $old_backup"
    rm -f "$old_backup"
    ((DELETED_COUNT++))
  fi
done < <(find "$BACKUP_DIR" -name "$PATTERN" -type f -mtime +$RETENTION_DAYS)

if [ $DELETED_COUNT -gt 0 ]; then
  log_success "Deleted $DELETED_COUNT old backup(s)"
else
  log "No old backups to delete"
fi

# List current backups
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "vaultscout_*.sql*" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

log_success "Backup completed successfully!"
echo ""
echo "Backup Summary:"
echo "  File: $BACKUP_FILE"
echo "  Total backups: $BACKUP_COUNT"
echo "  Total size: $TOTAL_SIZE"
echo "  Retention: $RETENTION_DAYS days"
echo ""

# Optional: Upload to cloud storage (uncomment and configure as needed)
# if [ -n "$AWS_S3_BUCKET" ]; then
#   log "Uploading backup to S3..."
#   aws s3 cp "$BACKUP_FILE" "s3://$AWS_S3_BUCKET/backups/"
#   log_success "Backup uploaded to S3"
# fi

exit 0
