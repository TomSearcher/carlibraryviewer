FROM node:12.18-alpine
ENV NODE_ENV=production
ENV REACT_APP_API_URL=https://api.toms-lab.net/gateway/carlibraryapi
ENV REACT_APP_OAUTH_URL=https://authorize.toms-lab.net/carlibraryauth
ENV REACT_APP_OAUTH_CLIENT_ID=dc83392c-9486-4ad6-8339-2c94866ad6b1
ENV REACT_APP_OAUTH_CLIENT_SECRET=ZGM4MzM5MmMtOTQ4Ni00YWQ2LTgzMzktMmM5NDg2NmFkNmIxOmtPTlZoZzJYWVAwUHQ2bkROSUZTMkZzYWMzQW9hLUs0U2NFc2kyRVpNdW8=
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
#RUN npm install --production --silent && mv node_modules ../
RUN npm install --production --silent
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
