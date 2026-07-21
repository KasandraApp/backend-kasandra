# ---- Build Stage (Bun) ----
FROM oven/bun:1.1.25-alpine AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src

RUN bun run build

# ---- Production Stage (Node.js) ----
FROM node:22-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Install only production dependencies
RUN npm install --omit=dev

EXPOSE 3000

USER appuser

ENV NODE_ENV=production

CMD ["node", "dist/src/server.js"]
