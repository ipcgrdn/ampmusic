# Base image
FROM node:18-alpine

# Working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Set execute permissions for ffmpeg and ffprobe
RUN chmod +x /app/node_modules/@ffmpeg-installer/linux-x64/ffmpeg \
    && chmod +x /app/node_modules/@ffprobe-installer/linux-x64/ffprobe

# Create temp directory and set permissions
RUN mkdir -p /app/temp && \
    chown -R node:node /app/temp && \
    chmod 755 /app/temp

# Switch to non-root user
USER node

# Expose port
EXPOSE 4000

# Start the server
CMD ["npm", "run", "start:prod"]