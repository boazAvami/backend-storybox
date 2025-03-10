# Step 1: Build the server with TypeScript
FROM node:18 AS build

# Set the working directory inside the container
WORKDIR /app

# Install dependencies (from package.json)
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the server's source code into the container
COPY . ./

# Build the TypeScript code
RUN npm run build:prod

# Step 2: Prepare to run the server using PM2
FROM node:18 AS production

# Set the working directory for the production stage
WORKDIR /app

# Install PM2 globally
RUN npm install pm2 -g

# Copy the built server from the build stage
COPY --from=build /app/dist /app/dist

# Expose port 3000 (change this to whatever port your server listens to)
EXPOSE 3000

# Default command: Use pm2-runtime to start the server and keep it alive
CMD ["pm2-runtime", "dist/app.js", "--name", "StoryBox-Server"]

# Instructions to build and run the Docker image:

# 1. Build the Docker image:
#    docker build -t storybox-server .

# 2. To run the Docker container with an external .env file:
#    docker run -d -p 3000:3000 -v /path/to/your/.envprod:/app/.env storybox-server
#    (Replace /path/to/your/.envprod with the actual path to your .envprod file)

# 3. If you don't want to mount the .envprod file and instead use the default .envprod inside the container:
#    docker run -d -p 3000:3000 storybox-server

# 4. To stop the running container:
#    docker stop <container-id>
#    docker rm <container-id>

# 5. To check if your app is running, visit:
#    http://your-server-ip or http://your-domain.com (if DNS is set up)
