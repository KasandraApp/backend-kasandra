FROM oven/bun:1.1.25-alpine AS base
WORKDIR /app

COPY package.json ./
COPY tsconfig.json ./
COPY src ./src
COPY tests ./tests
COPY .env.example ./.env.example

RUN bun install

RUN bunx tsc --project tsconfig.json

EXPOSE 3000
CMD ["bun", "run", "src/server.ts"]
