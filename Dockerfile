# Stage 1: Build the React Application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
COPY package-lock.json* ./
RUN npm install

# Explicitly copy required source and config files to prevent interference
COPY src ./src
COPY public ./public
COPY tsconfig.json .
# Note: No generic "COPY . ." to avoid hidden file issues

# Build the project
RUN npm run build

# Stage 2: Serve the App with Nginx
FROM nginx:alpine

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Robust Nginx configuration for single-page applications (SPAs)
RUN echo "server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Block 1: Try to serve static files directly first, otherwise serve index.html \
    location / { \
        try_files \$uri \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/loyalty_app.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]