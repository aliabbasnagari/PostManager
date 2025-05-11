# Use Node.js 18 Alpine as the base image for the build stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY package-lock.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the React app for production
RUN npm run build

# Use Nginx to serve the build files in the second stage
FROM nginx:alpine

# Copy the build files from the build stage to Nginx's default directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 (Nginx default port)
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
