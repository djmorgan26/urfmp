FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY web/package*.json ./web/
COPY packages/types/package*.json ./packages/types/
COPY packages/sdk/package*.json ./packages/sdk/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build types package
RUN npm run build --workspace=@urfmp/types

# Expose port
EXPOSE 3001

# Start the application
WORKDIR /app/web
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "3001"]