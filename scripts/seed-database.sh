#!/bin/bash

# Seed Database Script
# Applies seed.sql to the remote Supabase database

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌱 Seeding Supabase Database${NC}\n"

# Load environment variables
if [ -f .env ]; then
  source .env
else
  echo -e "${RED}❌ Error: .env file not found${NC}"
  exit 1
fi

# Extract project reference from Supabase URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's/https:\/\///' | sed 's/.supabase.co//')
DB_HOST="db.${PROJECT_REF}.supabase.co"

echo -e "${YELLOW}📊 Applying seed data...${NC}"

# Apply seed file using psql
PGPASSWORD="${SUPABASE_DB_PASSWORD}" psql \
  -h "${DB_HOST}" \
  -U postgres \
  -d postgres \
  -f supabase/seed.sql \
  -q

echo -e "\n${GREEN}✅ Seed data applied successfully!${NC}\n"

# Verify suppliers were created
echo -e "${YELLOW}📈 Verifying data...${NC}"
PGPASSWORD="${SUPABASE_DB_PASSWORD}" psql \
  -h "${DB_HOST}" \
  -U postgres \
  -d postgres \
  -c "SELECT COUNT(*) as supplier_count, organization_id FROM suppliers GROUP BY organization_id;"

echo -e "\n${GREEN}✨ Database seeding complete!${NC}"
