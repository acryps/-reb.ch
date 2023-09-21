FROM node:18-slim

WORKDIR /usr/src/app

COPY . .
RUN cd page && npm install && cd ..

CMD [ "node", "page/index.js" ]