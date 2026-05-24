FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install

COPY . .
RUN bun prisma generate

EXPOSE 8000

CMD ["sh", "-c", "bunx --bun prisma migrate deploy && bun run src/index.ts"]
