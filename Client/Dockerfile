# Use a base Node.js image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose any required ports (if your app needs to listen on a port)
# EXPOSE 3000

# Define the command to start your application
CMD ["npm", "start"]