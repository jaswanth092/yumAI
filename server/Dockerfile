FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production
ENV API_PORT=8080

COPY index.mjs ./index.mjs

EXPOSE 8080
CMD ["node", "index.mjs"]
