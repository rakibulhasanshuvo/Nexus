<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ab3877a6-8cac-4601-b7dd-02a7723f07da

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key.
3. Configure Supabase locally by adding `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your `.env.local` file.
4. Run the app:
   `npm run dev`

## Deploying on Vercel

When deploying to Vercel, it is crucial that your Supabase environment variables are prefixed exactly as shown below in the Vercel Project Settings (Settings -> Environment Variables). Otherwise, the application will fail to initialize the database connection, resulting in a "Database connection not configured" error.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
