# --- Stage 1: Build the React Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Setup the Node Express Backend ---
FROM node:20-alpine AS backend-server
WORKDIR /app

# Install production dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --only=production

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend assets to the location expected by the static server
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port and configure environment
EXPOSE 5000
ENV PORT=5000
ENV NODE_ENV=production

WORKDIR /app/backend
CMD ["node", "src/server.js"]
