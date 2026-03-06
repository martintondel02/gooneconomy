FROM node:20-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y openssl

COPY package.json ./
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

# Install dependencies
RUN npm install

# Generate Prisma Client
RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma

# Build shared and backend
RUN npm run build -w packages/shared
RUN npm run build -w apps/backend

FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma

EXPOSE 28081

CMD ["npm", "start", "-w", "apps/backend"]
