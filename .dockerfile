# Step 1: Build the server with TypeScript
FROM node:18 AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --only=production

# Copy the source code and build
COPY . ./
RUN npm run build:prod

# Step 2: Prepare production stage
FROM node:18 AS production

WORKDIR /app

# Install PM2 globally
RUN npm install pm2 -g

# Copy built files and dependencies from the build stage
COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json

# Expose port 3000
EXPOSE 3000

# Start the server
CMD ["pm2-runtime", "dist/app.js", "--name", "StoryBox-Server"]
