FROM node:14.17.5
WORKDIR /usr/src/app
EXPOSE 7777
EXPOSE 8888
COPY . .
RUN npm install
RUN npm run start
