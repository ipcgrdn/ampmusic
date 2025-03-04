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

# Create necessary directories and set permissions
RUN mkdir -p /app/uploads/audio /app/uploads/images /app/temp && \
    chmod -R 755 /app/uploads /app/temp

# Set execute permissions for ffmpeg and ffprobe
RUN chmod +x /app/node_modules/@ffmpeg-installer/linux-x64/ffmpeg \
    && chmod +x /app/node_modules/@ffprobe-installer/linux-x64/ffprobe

# Expose port
EXPOSE 4000

# Start the server
CMD ["npm", "run", "start:prod"]