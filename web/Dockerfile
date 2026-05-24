FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install --trusted

COPY . .
RUN bun run build

EXPOSE 3000

CMD ["sh", "-c", "bun run start -- -H 0.0.0.0 -p ${PORT:-3000}"]
