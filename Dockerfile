# Stage 1: Base build stage
FROM node:22-alpine AS base

WORKDIR /app

# Copy root package.json and package-lock.json
COPY package*.json ./
COPY tsconfig.json ./

# Copy the files from each directory below apps and packages
COPY apps ./apps
COPY packages ./packages

# Install dependencies
RUN npm install

# Compile the TypeScript code
RUN npm run build

# Create tarballs for utils and core packages
WORKDIR /app/packages/utils
RUN npm pack

WORKDIR /app/packages/core
RUN npm pack


# Stage 2a: Create final image for Server
FROM node:22-alpine AS server

WORKDIR /server

# Copy built files from build-app1 stage
COPY --from=base /app/apps/server/build ./build

# Copy package.json and install production dependencies
COPY apps/server/package.json ./package.json

RUN npm install --omit=dev

# Install the utils and core packages
COPY --from=base /app/packages/utils/quiz-lib*.tgz ./packages/utils/
COPY --from=base /app/packages/core/quiz-lib*.tgz ./packages/core/

RUN npm install --omit=dev $(ls -1 ./packages/utils/quiz-lib*.tgz)
RUN npm install --omit=dev $(ls -1 ./packages/core/quiz-lib*.tgz)

ENV PORT=8081

CMD ["node", "build/index.js"]


# Stage 2b: Create final image for CLI Client
FROM node:22-alpine AS cli-client

WORKDIR /cli-client

# Copy built files from build-app1 stage
COPY --from=base /app/apps/cli-client/build ./build

# Copy package.json and install production dependencies
COPY apps/cli-client/package.json ./package.json

RUN npm install --omit=dev

# Install the utils and core packages
COPY --from=base /app/packages/utils/quiz-lib*.tgz ./packages/utils/
COPY --from=base /app/packages/core/quiz-lib*.tgz ./packages/core/

RUN npm install --omit=dev $(ls -1 ./packages/utils/quiz-lib*.tgz)
RUN npm install --omit=dev $(ls -1 ./packages/core/quiz-lib*.tgz)

ENV HOST=server
ENV PORT=8081

CMD ["node", "build/index.js"]
