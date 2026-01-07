# 🚀 Cloudflare Pages Deployment Guide

## Current Status
- ✅ GitHub Repository: https://github.com/twokomi/production-process-flowchart
- ✅ Code pushed and ready
- ⏳ Cloudflare Pages: Waiting for connection
- ⏳ D1 Production Database: Not created yet

---

## Part 1: Connect GitHub to Cloudflare Pages (You're doing this now)

### Step 1: Access Cloudflare Dashboard
1. Go to https://dash.cloudflare.com
2. Click **"Workers & Pages"** in left sidebar

### Step 2: Create New Pages Project
1. Click **"Create application"** (blue button, top right)
2. Select **"Pages"** tab
3. Click **"Connect to Git"**

### Step 3: Authorize GitHub Repository
If `production-process-flowchart` is NOT in the list:
1. Click **"+ Add account"** or **"Configure GitHub App"**
2. You'll be redirected to GitHub
3. Or manually go to: https://github.com/settings/installations
4. Find **"Cloudflare Pages"** → Click **"Configure"**
5. Under **"Repository access"**: Select **"Only select repositories"**
6. Click **"Select repositories"** dropdown
7. Check ✅ `production-process-flowchart`
8. Click **"Save"**

### Step 4: Select Repository
1. Return to Cloudflare tab
2. Refresh page (F5)
3. Click on `production-process-flowchart`

### Step 5: Configure Build Settings
Enter these EXACT values:

| Setting | Value |
|---------|-------|
| **Project name** | `production-process-flowchart` |
| **Production branch** | `main` |
| **Framework preset** | `None` (or `Vite`) |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (leave default) |

### Step 6: Deploy!
1. Click **"Save and Deploy"**
2. Wait 2-3 minutes
3. You'll get a URL like: `https://production-process-flowchart.pages.dev`

**⚠️ Note:** The site will show "Loading data..." because D1 database is not set up yet. That's normal!

---

## Part 2: Set Up D1 Production Database (After deployment succeeds)

### Option A: Using Web UI (Recommended if no API key)

#### 1. Create D1 Database via Dashboard
1. Go to Cloudflare Dashboard
2. Click **"Workers & Pages"** → **"D1 SQL Database"**
3. Click **"Create database"**
4. Name: `production-process-flowchart-db`
5. Click **"Create"**
6. **Copy the Database ID** (you'll need this!)

#### 2. Bind Database to Pages Project
1. Go to **"Workers & Pages"**
2. Click on your `production-process-flowchart` project
3. Go to **"Settings"** → **"Functions"** → **"D1 database bindings"**
4. Click **"Add binding"**
   - Variable name: `DB`
   - D1 database: Select `production-process-flowchart-db`
5. Click **"Save"**

#### 3. Run Migrations (Need API Key or CLI)
Unfortunately, migrations can only be applied via CLI. You'll need to:
1. Go to Deploy tab in GenSpark
2. Set up Cloudflare API key
3. Run the commands below

---

### Option B: Using CLI (After API key is configured)

Once you've set up the API key in the Deploy tab, run:

```bash
cd /home/user/webapp
./setup-production-db.sh
```

Or manually:

#### 1. Create D1 Database
```bash
npx wrangler d1 create production-process-flowchart-db
```
**Copy the `database_id` from the output!**

#### 2. Update wrangler.jsonc
Open `wrangler.jsonc` and add the database_id:
```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "production-process-flowchart-db",
      "database_id": "YOUR_DATABASE_ID_HERE"  // Paste here
    }
  ]
}
```

#### 3. Apply Migrations
```bash
npx wrangler d1 migrations apply production-process-flowchart-db --remote
```

#### 4. Load Seed Data
```bash
npx wrangler d1 execute production-process-flowchart-db --remote --file=./seed.sql
```

#### 5. Verify Data
```bash
npx wrangler d1 execute production-process-flowchart-db --remote --command="SELECT COUNT(*) as total FROM process_steps"
```
Should return: `total: 57`

#### 6. Redeploy Pages
```bash
npx wrangler pages deploy dist --project-name production-process-flowchart
```

---

## Part 3: Verify Everything Works

### Check the Live Site
1. Open: `https://production-process-flowchart.pages.dev`
2. You should see:
   - ✅ 5 category cards (CT, BT, WT, IM, GT)
   - ✅ Progress indicators
   - ✅ Step-by-step navigation

### Test the Flow
1. Click on **CT** category
2. You should see the first step: "Preliminary Project Review"
3. Click **YES**
4. Next step should appear: "Material Sourcing"
5. Click **"View Criteria"** to see judgment criteria

---

## 🔧 Troubleshooting

### Issue 1: "Loading data..." doesn't go away
**Cause:** D1 database not connected or empty

**Solution:**
1. Check D1 database exists in Cloudflare Dashboard
2. Verify binding is set: Settings → Functions → D1 database bindings
3. Check migrations were applied
4. Verify seed data: `wrangler d1 execute ... --command="SELECT COUNT(*) FROM process_steps"`

### Issue 2: Build fails on Cloudflare
**Cause:** Missing dependencies or wrong build settings

**Solution:**
1. Check `package.json` has all dependencies
2. Verify build command is exactly: `npm run build`
3. Verify output directory is: `dist`
4. Check build logs in Cloudflare dashboard

### Issue 3: API returns 500 errors
**Cause:** Database binding not configured or database empty

**Solution:**
1. Check D1 binding in Settings → Functions
2. Verify migrations and seed data were applied
3. Check Cloudflare Pages logs for errors

---

## 📊 Expected Results

After complete setup:

- **Total Steps:** 57
- **Categories:** 5 (CT, BT, WT, IM, GT)
- **Criteria:** 27
- **Documents:** 16
- **Flow Connections:** 71

---

## 🎯 Next Steps After Deployment

1. **Test on mobile devices** (iOS/Android)
2. **Add real work instructions and quality specs**
3. **Configure custom domain** (if needed)
4. **Set up monitoring** and error tracking
5. **Train workers** on how to use the app

---

## 📞 Need Help?

If you get stuck at any step:
1. Take a screenshot
2. Copy any error messages
3. Share them in the chat

Good luck! 🚀
