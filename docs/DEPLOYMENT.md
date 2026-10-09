# VoiceShield AI — Public HTTPS Deployment Guide

This guide details zero-cost, free-tier compatible deployment architectures with automated SSL/TLS public HTTPS.

---

## 1. Free-Tier Compatible Hosting Strategies

### Strategy A: Unified Docker Deployment (Render / Railway / Fly.io)
Deploy the full application using Docker Compose or single-container multi-process configuration.
- **Backend (Python FastAPI + PyTorch CPU):** Requires ~512 MB to 1 GB RAM. PyTorch CPU inference on a single audio clip consumes under 150 MB RAM.
- **Frontend (Nginx static):** Consumes under 30 MB RAM.

### Strategy B: Decoupled Free Tier (Vercel Frontend + Render Backend)
- **Frontend:** Deploy static Vite bundle to **Vercel** or **Cloudflare Pages** (Free, instant global CDN, automatic HTTPS).
- **Backend:** Deploy FastAPI to **Render** or **Railway** (Free tier Web Service, automatic HTTPS at `https://voiceshield-api.onrender.com`).
- **CORS Configuration:** Set `CORS_ORIGINS=https://your-frontend.vercel.app` on the backend.

---

## 2. Environment Variables Specification

| Variable Name | Default Value | Description |
|---|---|---|
| `HOST` | `0.0.0.0` | Bind IP address for Uvicorn |
| `PORT` | `8000` | Port for the backend service |
| `ENVIRONMENT` | `production` | Set to production to hide debug logs |
| `DEBUG` | `false` | Disable traceback outputs |
| `CORS_ORIGINS` | `https://your-domain.com` | Comma-separated allowed frontend origins |
| `ENABLE_AUDIO_RETENTION` | `false` | Strict zero-retention mode |
| `MODEL_DEVICE` | `cpu` | Device for PyTorch model (`cpu` or `cuda`) |
| `MODEL_CHECKPOINT_PATH` | `backend/data/models/voiceshield_best.pt` | Path to weights |

---

## 3. Step-by-Step Deployment on Render

1. **Create Web Service for Backend:**
   - Connect your GitHub repository.
   - Root Directory: Leave blank or set to `./`.
   - Runtime: `Docker`.
   - Health Check Path: `/health`.
   - Environment Variables:
     - `PORT=8000`
     - `ENVIRONMENT=production`
     - `CORS_ORIGINS=https://your-frontend-app.onrender.com`

2. **Create Static Site for Frontend:**
   - Root Directory: `frontend`.
   - Build Command: `npm install && npm run build`.
   - Publish Directory: `dist`.
   - Environment Variable:
     - `VITE_API_BASE_URL=https://your-backend-app.onrender.com`

3. **Verify HTTPS:**
   - Test `curl -I https://your-backend-app.onrender.com/health` (returns `HTTP/2 200`).
   - Test frontend in browser: `https://your-frontend-app.onrender.com`.
