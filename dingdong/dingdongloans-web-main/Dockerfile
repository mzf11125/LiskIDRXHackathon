# Stage 1: Bu# Enable standalone output
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build && npm prune --production --force the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --force

# Copy application code
COPY . .

# Enable standalone output
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build && npm prune --production --force

# Stage 2: Create the production image
FROM node:20-alpine

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy necessary files from the builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Set ownership and permissions
RUN chown -R appuser:appgroup /app
USER appuser

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
