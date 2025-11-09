FROM node:22


ARG GIT_REMOTE="https://github.com/Hirushika2002/my-react-app"
ARG GIT_COMMIT="unknown"
LABEL org.opencontainers.image.source="${GIT_REMOTE}"
LABEL org.opencontainers.image.revision="${GIT_COMMIT}"

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Start the app
CMD ["node", "index.js"]