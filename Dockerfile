# Build client
FROM node:22 AS client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client ./
RUN npm run build

# Build server
FROM node:22 AS server
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server ./

# Copy client build into server
RUN mkdir -p /app/client/dist
COPY --from=client /app/client/dist /app/client/dist

ENV NODE_ENV=production PORT=4000
EXPOSE 4000
CMD ["node", "index.js"]
