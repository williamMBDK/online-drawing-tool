FROM node:14.17.5
WORKDIR /usr/src/app
EXPOSE 7777
EXPOSE 8888
COPY . .
WORKDIR /usr/src/app/BE
RUN npm install
WORKDIR /usr/src/app/FE
RUN npm install
WORKDIR /usr/src/app
RUN chmod +x ./run
CMD [ "./run" ]
