FROM node:14.17.5
WORKDIR /usr/src/app
EXPOSE 8888
COPY . .
RUN npm install --only=prod
CMD cd /usr/src/app && npm run start
