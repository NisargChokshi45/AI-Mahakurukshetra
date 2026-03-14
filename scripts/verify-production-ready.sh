#!/bin/bash
# Production Readiness Verification Script
# Run before deployment to ensure all security and quality checks pass

# Don't exit on error - we want to collect all checks
set +e

echo "🔍 Production Readiness Verification"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNINGS=0

check_pass() {
  echo -e "${GREEN}✓${NC} $1"
  ((PASSED++))
}

check_fail() {
  echo -e "${RED}✗${NC} $1"
  ((FAILED++))
}

check_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
  ((WARNINGS++))
}

echo "1. Environment Variables"
echo "------------------------"

# Check .env.example exists
if [ -f ".env.example" ]; then
  check_pass ".env.example exists"
else
  check_fail ".env.example missing"
fi

# Check no secrets in .env.example
if [ -f ".env.example" ]; then
  if grep -E "(sk_live|sk_test_[a-zA-Z0-9]{32}|supabase_service_role|eyJ)" .env.example > /dev/null 2>&1; then
    check_fail "Real secrets found in .env.example"
  else
    check_pass "No real secrets in .env.example"
  fi
fi

# Check .env is gitignored
if grep -E "^\.env(\*|\.local)?$|^\.env$" .gitignore > /dev/null 2>&1; then
  check_pass ".env is gitignored"
else
  check_fail ".env not in .gitignore"
fi

echo ""
echo "2. Security Checks"
echo "------------------"

# Check for service role key in client code
if grep -r "SUPABASE_SERVICE_ROLE_KEY" apps/web/app/\(dashboard\) apps/web/components 2>/dev/null | grep -v ".test." | grep -v ".spec."; then
  check_fail "Service role key referenced in client code"
else
  check_pass "No service role key in client code"
fi

# Check for hardcoded secrets
if grep -rE "(sk_live|sk_test_[a-zA-Z0-9]{32})" apps/web/app apps/web/lib 2>/dev/null | grep -v ".example" | grep -v "node_modules"; then
  check_fail "Hardcoded Stripe keys found"
else
  check_pass "No hardcoded Stripe keys"
fi

# Check RLS migrations exist
if ls supabase/migrations/*_rls_*.sql 1> /dev/null 2>&1 || grep -r "enable row level security" supabase/migrations/ 2>/dev/null; then
  check_pass "RLS policies in migrations"
else
  check_warn "No explicit RLS migration files found"
fi

# Check HMAC verification exists
if grep -r "timingSafeEqual\|timingSafeCompare" apps/web/app/api 2>/dev/null; then
  check_pass "HMAC verification implemented"
else
  check_warn "No HMAC verification found"
fi

echo ""
echo "3. Input Validation"
echo "-------------------"

# Check Zod usage in API routes
API_ROUTES=$(find apps/web/app/api -name "route.ts" 2>/dev/null | wc -l)
ZOD_USAGE=$(grep -r "z\." apps/web/app/api 2>/dev/null | wc -l)

if [ "$API_ROUTES" -gt 0 ]; then
  if [ "$ZOD_USAGE" -gt 0 ]; then
    check_pass "Zod validation found in API routes ($ZOD_USAGE usages)"
  else
    check_warn "No Zod validation found in API routes"
  fi
else
  check_warn "No API routes found"
fi

echo ""
echo "4. Logging & Monitoring"
echo "-----------------------"

# Check structured logging
if grep -r "logRequestResponse\|startRequestLog" apps/web/app/api 2>/dev/null; then
  check_pass "Structured HTTP logging implemented"
else
  check_warn "No structured HTTP logging found"
fi

# Check health endpoint exists
if [ -f "apps/web/app/api/health/route.ts" ]; then
  check_pass "/api/health endpoint exists"
else
  check_fail "/api/health endpoint missing"
fi

# Check error boundaries
ERROR_BOUNDARIES=$(find apps/web/app/\(dashboard\) -name "error.tsx" 2>/dev/null | wc -l)
if [ "$ERROR_BOUNDARIES" -gt 0 ]; then
  check_pass "Error boundaries present ($ERROR_BOUNDARIES files)"
else
  check_warn "No error boundaries found"
fi

echo ""
echo "5. Type Safety"
echo "--------------"

# Check for 'any' types (basic check)
ANY_COUNT=$(grep -r ": any" apps/web/app apps/web/lib apps/web/components 2>/dev/null | grep -v "node_modules" | grep -v ".d.ts" | wc -l)
if [ "$ANY_COUNT" -lt 5 ]; then
  check_pass "Minimal 'any' types ($ANY_COUNT occurrences)"
else
  check_warn "High 'any' type usage ($ANY_COUNT occurrences)"
fi

# Check TypeScript config has strict mode
if grep -q '"strict": true' tsconfig.json apps/web/tsconfig.json 2>/dev/null; then
  check_pass "TypeScript strict mode enabled"
else
  check_warn "TypeScript strict mode not explicitly enabled"
fi

echo ""
echo "6. Dependencies"
echo "---------------"

# Check package.json exists
if [ -f "package.json" ]; then
  check_pass "Root package.json exists"
else
  check_fail "Root package.json missing"
fi

# Check for known vulnerable packages (basic check)
if command -v pnpm &> /dev/null; then
  if pnpm audit --audit-level=high 2>&1 | grep -q "0 vulnerabilities"; then
    check_pass "No high-severity vulnerabilities"
  else
    check_warn "Run 'pnpm audit' to check for vulnerabilities"
  fi
else
  check_warn "pnpm not installed, skipping audit"
fi

echo ""
echo "7. Build Verification"
echo "---------------------"

# Check if build artifacts exist (or can be built)
if [ -d "apps/web/.next" ] || [ -f "apps/web/.next/BUILD_ID" ]; then
  check_pass "Build artifacts present"
else
  check_warn "No build artifacts found (run 'pnpm build')"
fi

echo ""
echo "8. API Documentation"
echo "--------------------"

# Check OpenAPI/Swagger endpoint exists
if [ -f "apps/web/app/api/docs/page.tsx" ] || [ -f "apps/web/app/api/openapi/route.ts" ]; then
  check_pass "API documentation endpoint exists"
else
  check_warn "No API docs endpoint found"
fi

echo ""
echo "9. Testing"
echo "----------"

# Check test files exist
TEST_COUNT=$(find apps/web -name "*.test.ts" -o -name "*.spec.ts" 2>/dev/null | wc -l)
if [ "$TEST_COUNT" -gt 0 ]; then
  check_pass "Test files present ($TEST_COUNT files)"
else
  check_warn "No test files found"
fi

# Check E2E tests
E2E_COUNT=$(find tests/e2e -name "*.spec.ts" 2>/dev/null | wc -l)
if [ "$E2E_COUNT" -gt 0 ]; then
  check_pass "E2E tests present ($E2E_COUNT files)"
else
  check_warn "No E2E tests found"
fi

echo ""
echo "10. Git Hygiene"
echo "---------------"

# Check no .env in git
if git ls-files | grep -q "^\.env$"; then
  check_fail ".env file is tracked in git!"
else
  check_pass ".env not tracked in git"
fi

# Check conventional commits (last 5)
RECENT_COMMITS=$(git log --oneline -5 --pretty=format:"%s" 2>/dev/null)
if echo "$RECENT_COMMITS" | grep -qE "^(feat|fix|chore|docs|style|refactor|test|perf|ci|build)(\(.+\))?: "; then
  check_pass "Recent commits follow conventional format"
else
  check_warn "Recent commits may not follow conventional format"
fi

echo ""
echo "===================================="
echo "Summary"
echo "===================================="
echo -e "${GREEN}Passed:${NC} $PASSED"
if [ "$WARNINGS" -gt 0 ]; then
  echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
fi
if [ "$FAILED" -gt 0 ]; then
  echo -e "${RED}Failed:${NC} $FAILED"
fi

echo ""

if [ "$FAILED" -gt 0 ]; then
  echo -e "${RED}❌ Production readiness check FAILED${NC}"
  echo "Fix the issues above before deploying."
  exit 1
elif [ "$WARNINGS" -gt 5 ]; then
  echo -e "${YELLOW}⚠️  Production readiness check passed with warnings${NC}"
  echo "Review warnings before deploying."
  exit 0
else
  echo -e "${GREEN}✅ Production readiness check PASSED${NC}"
  echo "All critical checks passed. Ready for deployment."
  exit 0
fi
