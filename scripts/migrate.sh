#!/bin/bash

# Migration Helper Script
# Usage: ./scripts/migrate.sh [command]
# Commands: push, new, status, test

set -e

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Supabase Migration Helper${NC}\n"

case "${1:-push}" in

  push)
    echo -e "${YELLOW}📤 Pushing migrations to production...${NC}"
    npx supabase db push

    echo -e "\n${YELLOW}✅ Verifying connection...${NC}"
    cd apps/web && npx tsx scripts/test-supabase-connection.ts

    echo -e "\n${GREEN}✨ Migrations applied successfully!${NC}"
    ;;

  new)
    if [ -z "$2" ]; then
      echo -e "${RED}❌ Error: Migration name required${NC}"
      echo "Usage: ./scripts/migrate.sh new <migration_name>"
      echo "Example: ./scripts/migrate.sh new add_user_notifications"
      exit 1
    fi

    echo -e "${YELLOW}📝 Creating new migration: $2${NC}"
    npx supabase migration new "$2"

    # Find the most recent migration file
    LATEST=$(ls -t supabase/migrations/*.sql | head -1)
    echo -e "${GREEN}✅ Created: ${LATEST}${NC}"
    echo -e "\n${BLUE}Next steps:${NC}"
    echo "1. Edit the migration file: ${LATEST}"
    echo "2. Run: ./scripts/migrate.sh push"
    ;;

  status)
    echo -e "${YELLOW}📊 Checking migration status...${NC}\n"
    npx supabase db diff
    ;;

  test)
    echo -e "${YELLOW}🧪 Testing Supabase connection...${NC}\n"
    cd apps/web && npx tsx scripts/test-supabase-connection.ts
    ;;

  pull)
    echo -e "${YELLOW}⬇️  Pulling schema from production...${NC}"
    npx supabase db pull
    echo -e "${GREEN}✅ Schema pulled successfully!${NC}"
    ;;

  help|*)
    echo -e "${BLUE}Available commands:${NC}\n"
    echo "  push          - Push all pending migrations to production (default)"
    echo "  new <name>    - Create a new migration file"
    echo "  status        - Check migration status (diff)"
    echo "  test          - Test database connection"
    echo "  pull          - Pull current schema from production"
    echo "  help          - Show this help message"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo "  ./scripts/migrate.sh push"
    echo "  ./scripts/migrate.sh new add_notifications"
    echo "  ./scripts/migrate.sh test"
    ;;
esac
