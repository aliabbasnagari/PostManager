# Use a lightweight Node.js image to build the app
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the source code and build
COPY . .
RUN npm run build

# Use Nginx to serve the built app
FROM nginx:alpine

# Copy the build output to Nginx public directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose the default Nginx port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
