# Backend image — like a multi-stage `dotnet publish` Dockerfile: build with dev deps, run with dist.
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev && npm install ts-node typescript typeorm --no-save
COPY --from=build /app/dist ./dist
COPY --from=build /app/src ./src
COPY tsconfig.json ./
EXPOSE 3000
# Run migrations, then start the API. Seed is a separate, explicit command (see README).
CMD ["sh", "-c", "npx typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts && node dist/main"]
