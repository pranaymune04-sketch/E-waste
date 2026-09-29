# 🚀 Complete Deployment Guide: Render (Backend) & Vercel (Frontend)

This guide provides step-by-step instructions to deploy **RepairHub** to the cloud:
- **Backend API (Node.js/Express)** ➔ Hosted on **Render**
- **Frontend App (React)** ➔ Hosted on **Vercel**
- **Original Data** ➔ 100% preserved in `backend/data/db.json`

---

## 📋 Overview of Deployment Architecture

```
  ┌─────────────────────────────────────────────────────────────┐
  │                    VERCEL (Frontend React)                 │
  │              https://repairhub-frontend.vercel.app          │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                     HTTP Requests (REACT_APP_API_URL)
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                    RENDER (Backend Express)                │
  │              https://repairhub-backend.onrender.com         │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                     Loads Preserved Data
                                 │
                                 ▼
                    `backend/data/db.json` (4,000+ lines)
```

---

## Step 1: Push Code to GitHub

1. Open your terminal in the root project folder:
   ```bash
   git init
   git add .
   git commit -m "Add Render and Vercel deployment configs with intact data"
   ```
2. Create a new repository on GitHub (e.g., `RepairHub-FullStack`).
3. Push your repository to GitHub:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/RepairHub-FullStack.git
   git push -u origin main
   ```

---

## Step 2: Deploy Backend to Render

1. Go to **[Render Dashboard](https://dashboard.render.com)** and log in.
2. Click **New +** ➔ Select **Web Service**.
3. Connect your GitHub repository (`RepairHub-FullStack`).
4. Fill in the service configuration:
   - **Name**: `repairhub-backend` (or your preferred name)
   - **Region**: Choose closest to your users (e.g., Singapore / Frankfurt / Oregon)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`

5. Add **Environment Variables** under the **Environment** section:
   | Key | Value | Description |
   |-----|-------|-------------|
   | `PORT` | `10000` | Render internal port |
   | `NODE_ENV` | `production` | Production mode |
   | `JWT_SECRET` | `repairhub-jwt-secret-production-key-2026` | Secure JWT key |
   | `GEMINI_API_KEY` | *(Your Gemini API key if using AI pricing feature)* | Optional AI key |

6. Click **Create Web Service**.
7. Wait 2-3 minutes for deployment. Once ready, Render will provide your Backend URL:
   `https://repairhub-backend-xxxx.onrender.com`

---

## Step 3: Deploy Frontend to Vercel

1. Go to **[Vercel Dashboard](https://vercel.com/dashboard)** and log in.
2. Click **Add New...** ➔ Select **Project**.
3. Import your GitHub repository (`RepairHub-FullStack`).
4. In the Project Configuration:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: Click Edit ➔ Select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Under **Environment Variables**, add:
   | Name | Value |
   |------|-------|
   | `REACT_APP_API_URL` | `https://repairhub-backend-xxxx.onrender.com/api` |
   *(Replace with your actual Render backend URL from Step 2, appending `/api` at the end)*

6. Click **Deploy**.
7. Vercel will build and launch your application. When complete, Vercel will provide your live website URL:
   `https://repairhub-frontend-xxxx.vercel.app`

---

## 🔒 Preserved Original Demo Accounts & Data

Once both services are live, you can log in immediately with all existing demo data intact:

### 👤 Customer Login
- **Email**: `customer@example.com`
- **Password**: `password123`

### 🔧 Technician Login
- **Email**: `tech@example.com`
- **Password**: `password123`

### ♻️ Scrap Buyer Login
- **Email**: `buyer@example.com`
- **Password**: `password123`

---

## 🧪 Testing Your Live Deployment

1. Open your Vercel URL in your browser.
2. Log in with any demo account above.
3. Try searching technicians, requesting a repair, or viewing e-waste listings.
4. Open browser DevTools Network tab to confirm requests are calling `https://<your-render-app>.onrender.com/api`.
