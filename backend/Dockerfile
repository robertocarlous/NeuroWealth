FROM node:20-alpine AS builder

# Alpine ships without OpenSSL; Prisma's engine can't detect a libssl version
# without it and fails with an opaque "Could not parse schema engine
# response" error on prisma generate / migrate deploy.
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runtime

RUN apk add --no-cache openssl && \
    addgroup -S app && adduser -S app -G app

WORKDIR /app

COPY --from=builder --chown=app:app /app/package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder --chown=app:app /app/dist ./dist
COPY --from=builder --chown=app:app /app/prisma ./prisma
COPY --from=builder --chown=app:app /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=app:app /app/node_modules/@prisma ./node_modules/@prisma

USER app

EXPOSE 3001

# Migrations run here rather than at build time — the Dockerfile build
# sandbox can't reach postgres.railway.internal (private networking is only
# available at runtime), and the app user now owns node_modules/@prisma
# (via --chown above) so it can write the engine's runtime cache/lock files.
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
