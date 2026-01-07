# 🎯 Quick Command Reference

## After Cloudflare Pages Deployment

### 1️⃣ Create D1 Database
```bash
npx wrangler d1 create production-process-flowchart-db
```
**→ Copy the `database_id`!**

---

### 2️⃣ Update wrangler.jsonc
Replace the empty `database_id` with the one from step 1:
```jsonc
"database_id": "YOUR_ID_HERE"
```

---

### 3️⃣ Apply Migrations
```bash
npx wrangler d1 migrations apply production-process-flowchart-db --remote
```

---

### 4️⃣ Load Seed Data
```bash
npx wrangler d1 execute production-process-flowchart-db --remote --file=./seed.sql
```

---

### 5️⃣ Verify
```bash
npx wrangler d1 execute production-process-flowchart-db --remote --command="SELECT COUNT(*) FROM process_steps"
```
Should show: **57 steps**

---

### 6️⃣ Bind to Pages (Web UI)
1. Cloudflare Dashboard → Workers & Pages
2. Click your project → Settings → Functions
3. D1 database bindings → Add binding
   - Variable: `DB`
   - Database: `production-process-flowchart-db`
4. Save

---

### 7️⃣ Done! 🎉
Open: `https://production-process-flowchart.pages.dev`

---

## Or Use the Automated Script

```bash
cd /home/user/webapp
./setup-production-db.sh
```

Then manually do step 6 (binding) in the web UI.
