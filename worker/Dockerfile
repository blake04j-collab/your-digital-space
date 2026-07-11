# Playwright's official image ships Chromium + all system libs.
FROM mcr.microsoft.com/playwright:v1.47.0-jammy

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev --ignore-scripts

COPY server.js login.js ./

ENV NODE_ENV=production
ENV PORT=8787
ENV SESSION_PATH=/data/x-session.json

EXPOSE 8787
CMD ["node", "server.js"]
