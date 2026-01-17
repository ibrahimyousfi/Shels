# Vercel Deployment Instructions

## Detailed Steps

### 1. Setup GitHub Repository

```bash
# In project directory
cd react.wieps

# Add all files
git add .

# Commit
git commit -m "Initial Next.js app setup"

# Connect to GitHub (if not connected)
    git remote add origin https://github.com/ibrahimyousfi/Shels.git

# Push files
git push -u origin main
```

### 2. Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Sign in with GitHub account

### 3. Connect Project

1. In Vercel Dashboard, click **"Add New Project"**
    2. Select GitHub repository: `Shels`
3. Vercel will auto-detect Next.js ✅

### 4. Setup Environment Variables

In project settings page, add:

```
GEMINI_API_KEY = your_gemini_api_key_here
```

(You can add `DATABASE_URL` later if needed)

### 5. Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. ✅ Deployed!

### 6. Get URL

After deployment, you'll get:
    - **Production URL**: `https://shels.vercel.app`
    - **Deployment URL**: `https://shels-git-main.vercel.app`

---

## Automatic Features

✅ **Auto Deploy**: Every new push deploys automatically
✅ **Preview Deployments**: Each branch gets preview URL
✅ **SSL Certificate**: Free and automatic
✅ **CDN**: Global distribution automatic
✅ **Analytics**: Free statistics

---

## Update Project

After any changes:

```bash
git add .
git commit -m "Update description"
git push
```

Vercel will deploy updates automatically! 🚀

---

## Important Notes

1. **Environment Variables**: Make sure to add them in Vercel Dashboard
2. **Build Settings**: Vercel detects them automatically (no need to modify)
3. **Custom Domain**: You can add custom domain later
4. **Free Tier**: Completely sufficient for hackathon

---

## Troubleshooting

### If build fails:
- Check `package.json` scripts
- Verify Environment Variables
- Review Build Logs in Vercel

### If API doesn't work:
- Check `GEMINI_API_KEY`
- Verify key is correct
- Review Function Logs in Vercel

---

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
