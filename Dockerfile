FROM node:20.13.1-alpine

ENV NAME twitter-backend

# Create the application directory
RUN mkdir /${NAME}

WORKDIR /${NAME}

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml (if available) for dependency installation
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN pnpm run build

# Expose the application port
EXPOSE 4747

# Start the application
CMD ["pnpm", "start"]