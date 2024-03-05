FROM node:18-alpine

WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .

ENV NODE_ENV=production
ENV PORT=2993
ENV BOT_TOKEN=6845225932:AAGGxhU6REuKcPDlUTKPEiSfcvyLePmMw8k
ENV API_URL=https://jungji-api-stg.ambitiousglacier-614a777f.southeastasia.azurecontainerapps.io/api

RUN yarn build

EXPOSE 2993
CMD ["node", "dist/index.js"]
