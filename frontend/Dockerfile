FROM node:22 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:stable-alpine


ARG GIT_REMOTE="https://github.com/Hirushika2002/my-react-app"
ARG GIT_COMMIT="unknown"
LABEL org.opencontainers.image.source="${GIT_REMOTE}"
LABEL org.opencontainers.image.revision="${GIT_COMMIT}"

RUN rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]