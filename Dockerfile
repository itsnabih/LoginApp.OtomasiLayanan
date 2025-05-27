# ==== build stage ====
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --production        # dependensi prod saja
COPY . .
# ==== runtime image ====
FROM node:20-bookworm-slim
WORKDIR /app
COPY --from=build /app .
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
