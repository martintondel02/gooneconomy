FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY packages/shared ./packages/shared
COPY apps/frontend ./apps/frontend

# Install dependencies
RUN npm install

# Build shared and frontend
RUN npm run build -w packages/shared
RUN npm run build -w apps/frontend

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/frontend ./apps/frontend

EXPOSE 28080

CMD ["npm", "run", "dev", "-w", "apps/frontend"]
