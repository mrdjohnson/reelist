FROM node:20-alpine as builder
WORKDIR /app

ENV NODE_ENV production

COPY ./public ./public

COPY ./dist/.next ./.next
COPY ./dist/package.json ./package.json

# if anything breaks, remove this next line
COPY ./dist/yarn.lock ./yarn.lock

RUN yarn

FROM node:20-alpine as runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder ./app .

EXPOSE 3000

ENV PORT 3000

CMD yarn next start
