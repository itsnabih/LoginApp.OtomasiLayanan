# ========== build stage ==========
FROM node:20-bookworm-slim AS build

# Set work directory
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy all app source (kecuali yang di .dockerignore)
COPY . .

# ========== runtime stage ==========
FROM node:20-bookworm-slim

# Add a non-root user (for security)
RUN useradd -m -s /bin/bash appuser

WORKDIR /app

# Copy built app from previous stage
COPY --from=build /app .

ENV PORT=3000
EXPOSE 3000

# Use non-root user to run the app
USER appuser

CMD ["node", "server.js"]
