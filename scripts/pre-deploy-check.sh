#!/bin/bash

# Pre-Deployment Check Script
# Run this before deploying to production

echo "🚀 Evaconfecciones SaaS - Pre-Deployment Check"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# 1. Check if .env exists
echo "📋 Checking environment files..."
if [ -f .env ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
else
    echo -e "${RED}✗${NC} .env file missing!"
    ERRORS=$((ERRORS + 1))
fi

if [ -f .env.example ]; then
    echo -e "${GREEN}✓${NC} .env.example exists"
else
    echo -e "${YELLOW}⚠${NC} .env.example missing (recommended)"
fi

echo ""

# 2. Check if DATABASE_URL is set
echo "🗄️  Checking database configuration..."
if grep -q "DATABASE_URL" .env 2>/dev/null; then
    echo -e "${GREEN}✓${NC} DATABASE_URL is configured"
else
    echo -e "${RED}✗${NC} DATABASE_URL not found in .env!"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# 3. Install dependencies
echo "📦 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules exists"
else
    echo -e "${YELLOW}⚠${NC} Installing dependencies..."
    npm install
fi

echo ""

# 4. Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Prisma Client generated"
else
    echo -e "${RED}✗${NC} Prisma Client generation failed!"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# 5. Run linter
echo "🔍 Running linter..."
npm run lint > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} No linting errors"
else
    echo -e "${YELLOW}⚠${NC} Linting warnings found (check with: npm run lint)"
fi

echo ""

# 6. Test build
echo "🏗️  Testing production build..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Production build successful"
else
    echo -e "${RED}✗${NC} Production build failed!"
    echo "Run 'npm run build' to see errors"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# 7. Check for common secrets in code
echo "🔒 Checking for exposed secrets..."
SECRET_FOUND=0

if grep -r "password.*=.*['\"]" src/ 2>/dev/null | grep -v "placeholder" | grep -v "Password" > /dev/null; then
    echo -e "${RED}✗${NC} Potential password found in source code!"
    SECRET_FOUND=1
fi

if grep -r "api_key.*=.*['\"]" src/ 2>/dev/null > /dev/null; then
    echo -e "${RED}✗${NC} Potential API key found in source code!"
    SECRET_FOUND=1
fi

if [ $SECRET_FOUND -eq 0 ]; then
    echo -e "${GREEN}✓${NC} No obvious secrets in source code"
fi

echo ""

# 8. Check .gitignore
echo "📝 Checking .gitignore..."
if [ -f .gitignore ]; then
    if grep -q ".env" .gitignore && grep -q "node_modules" .gitignore; then
        echo -e "${GREEN}✓${NC} .gitignore properly configured"
    else
        echo -e "${YELLOW}⚠${NC} .gitignore may be incomplete"
    fi
else
    echo -e "${RED}✗${NC} .gitignore missing!"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "=============================================="

# Final summary
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready for deployment.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Push to GitHub: git push origin main"
    echo "2. Deploy on Vercel or your platform of choice"
    echo "3. Set environment variables in production"
    echo "4. Run database migrations: npx prisma migrate deploy"
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(s) found. Please fix before deploying.${NC}"
    exit 1
fi
