#!/bin/bash

# Update system packages
sudo yum update -y

# Install Node.js and npm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install 18

# Install PM2 globally
npm install -g pm2

# Create app directory
mkdir -p /home/ec2-user/app
cd /home/ec2-user/app

# Copy application files (you'll need to set up your deployment method)
# This could be from S3, GitHub, or other source

# Install dependencies
npm install

# Start the application with PM2
pm2 start server.js --name "backend-app"
pm2 startup
pm2 save

# Set up Nginx (if needed)
sudo yum install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx 