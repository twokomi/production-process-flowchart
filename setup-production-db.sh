#!/bin/bash
# Production D1 Database Setup Script
# Run this after Cloudflare Pages deployment is complete

echo "🚀 Setting up Production D1 Database..."
echo ""

# Step 1: Create D1 database
echo "📦 Step 1: Creating D1 database..."
echo "Run this command manually and copy the database_id:"
echo "npx wrangler d1 create production-process-flowchart-db"
echo ""
read -p "Enter the database_id from the output: " DB_ID

if [ -z "$DB_ID" ]; then
    echo "❌ Error: database_id is required"
    exit 1
fi

# Step 2: Update wrangler.jsonc
echo ""
echo "📝 Step 2: Updating wrangler.jsonc with database_id..."
cd /home/user/webapp

# Backup original file
cp wrangler.jsonc wrangler.jsonc.backup

# Update database_id in wrangler.jsonc
sed -i "s/\"database_id\": \"\"/\"database_id\": \"$DB_ID\"/" wrangler.jsonc

echo "✅ wrangler.jsonc updated"

# Step 3: Apply migrations
echo ""
echo "🔄 Step 3: Applying migrations to production..."
npx wrangler d1 migrations apply production-process-flowchart-db --remote

if [ $? -ne 0 ]; then
    echo "❌ Error: Migration failed"
    exit 1
fi

echo "✅ Migrations applied"

# Step 4: Load seed data
echo ""
echo "📊 Step 4: Loading seed data..."
npx wrangler d1 execute production-process-flowchart-db --remote --file=./seed.sql

if [ $? -ne 0 ]; then
    echo "❌ Error: Seed data loading failed"
    exit 1
fi

echo "✅ Seed data loaded"

# Step 5: Verify data
echo ""
echo "🔍 Step 5: Verifying data..."
npx wrangler d1 execute production-process-flowchart-db --remote --command="SELECT COUNT(*) as total FROM process_steps"

echo ""
echo "✅ Production D1 Database setup complete!"
echo ""
echo "📌 Next steps:"
echo "1. Go to Cloudflare Pages dashboard"
echo "2. Settings → Functions → D1 database bindings"
echo "3. Add binding: DB → production-process-flowchart-db"
echo "4. Redeploy the site"
echo ""
