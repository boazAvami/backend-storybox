# Step 1: Build the server with TypeScript
FROM node:18 AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the source code and build
COPY . ./
RUN npm run build:prod

# Step 2: Prepare production stage
FROM node:18 AS production

WORKDIR /app

# Copy built files and dependencies from the build stage
COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json

# Expose port 3000
EXPOSE 3000

# Start the server
CMD ["node", "dist/app.js"]

# Build command:
# docker build -t backend-storybox:1.0.0 -f Dockerfile .
