FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev
COPY src ./src
COPY scripts ./scripts
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "src/server.js"]