# Railway API Service Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY services/api/package*.json ./services/api/
COPY packages/types/package*.json ./packages/types/
COPY packages/sdk/package*.json ./packages/sdk/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build types package first
RUN npm run build --workspace=@urfmp/types

# Build SDK package
RUN npm run build --workspace=@urfmp/sdk

# Build API package (TypeScript compilation)
RUN npm run build --workspace=@urfmp/api

# Add health check
RUN apk add --no-cache curl

EXPOSE 3001

ENV NODE_ENV=production

# Start the compiled API service
CMD ["npm", "start", "--workspace=@urfmp/api"]