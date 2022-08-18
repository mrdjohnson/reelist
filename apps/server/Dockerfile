FROM node:16-alpine

WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY ./dist/.next ./.next
COPY ./dist/package.json ./package.json

RUN yarn

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD yarn next start
