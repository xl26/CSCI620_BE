FROM node:10.19.0-alpine
#copy entire folder
COPY . .
#clean install
RUN npm ci
EXPOSE 2000
CMD ["npm" , "start"]
