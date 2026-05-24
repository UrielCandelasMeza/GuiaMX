FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lockb* ./

RUN bun install

COPY . .

RUN bun prisma generate

EXPOSE 3000

# Run migrations, generate client and start the application
CMD ["sh", "-c", "bunx --bun prisma migrate dev --name init && bunx --bun prisma generate && bun run scripts/seed-all.ts && bun run dev"]

