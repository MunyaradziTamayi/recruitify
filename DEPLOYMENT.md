# Deployment Guide for Recruitify

## Option 1: Build Locally, Deploy Static Files (Recommended)

1. Build the application locally:
   ```bash
   npm install
   npm run build
   ```

2. Deploy the `dist/recruitify/browser/` folder to your web server (Apache, Nginx, etc.)

## Option 2: Build on Server

If you must build on the deployment server:

1. Ensure Node.js and npm are installed
2. Run:
   ```bash
   npm install
   npm run build
   ```
3. Deploy the `dist/recruitify/browser/` folder

## For Cloud Platforms

### Vercel/Netlify
- Use `npm run build` as the build command
- Set the publish directory to `dist/recruitify/browser/`

### Docker
If using Docker, ensure your Dockerfile includes:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```

## Troubleshooting

- If you still get "ng command not found", the `npx` prefix ensures the local Angular CLI is used
- Make sure `node_modules` is properly installed
- For production builds, use `npm run build` (includes `--configuration production`)
