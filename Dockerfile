FROM node:22-slim

# Install Chromium dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    libgtk-3-0 \
    libgbm1 \
    libasound2 \
    libnss3 \
    libxshm1 \
    xvfb \
    --no-install-recommends

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install --omit=dev # Or yarn install --production

# Create the src directory in the container
RUN mkdir src

# Copy the contents of your local src folder to the container's src folder
COPY src ./src

# Define the command to run your application using npm start
CMD ["npm", "start"]