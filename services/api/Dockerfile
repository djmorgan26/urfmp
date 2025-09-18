FROM node:20-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./
COPY services/api/package*.json ./services/api/
COPY packages/types/package*.json ./packages/types/
COPY packages/sdk/package*.json ./packages/sdk/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build types package
RUN npm run build --workspace=@urfmp/types

# Expose port
EXPOSE 3000

# Start the application
CMD ["npx", "tsx", "watch", "services/api/src/index.ts"]