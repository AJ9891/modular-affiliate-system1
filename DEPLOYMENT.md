# Modular Affiliate System - Vercel Deployment

This project is configured for deployment to Vercel.

## Domain

- Production: <https://launchpad4sucess.pro>

## Deploy Steps

1. **Install Vercel CLI** (if not already installed):

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:

   ```bash
   vercel login
   ```

3. **Link to your project**:

   ```bash
   cd apps/web
   vercel link
   ```

   - Select your team/account
   - Link to existing project or create new one
   - Set the domain to: launchpad4sucess.pro

4. **Add Environment Variables** in Vercel Dashboard:
   - Go to: <https://vercel.com/your-project/settings/environment-variables>
   - Add:
     - `NEXT_PUBLIC_SUPABASE_URL` = <https://urwrbjejcozbzgknbuhn.supabase.co>
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your anon key)
     - `NEXT_PUBLIC_APP_URL` = <https://launchpad4sucess.pro>

5. **Deploy**:

   ```bash
   vercel --prod
   ```

## Auto-Deploy from GitHub

The GitHub Actions workflow in `.github/workflows/ci-cd.yml` will automatically deploy on push to main branch once you add these secrets to your GitHub repository:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Get these from: <https://vercel.com/account/tokens>
