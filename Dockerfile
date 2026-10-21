# Static SPA image for Coolify.
# Build pack: Dockerfile. Exposed port: 80.

FROM node:22-alpine AS build

WORKDIR /app

# Yarn 1 matches yarn.lock (lockfile v1). The official Node image ships npm, not Yarn.
RUN npm install -g yarn@1.22.22

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
