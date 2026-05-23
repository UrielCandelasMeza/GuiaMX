FROM oven/bun:latest

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb* ./
RUN bun install

# Copy source code
COPY . .

# Start the application in development mode
CMD ["bun", "run", "dev"]
