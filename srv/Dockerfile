FROM node

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY / /usr/src/app
RUN npm install

# Bundle app source
COPY . /usr/src/app
 
ENV SERVER_PORT 3000   
ENV BUCKET excuber   
ENV CAUCHBASE_URL couchbase://couchbase
ENV CLIENT_URL http://10.10.10.25:8010  

EXPOSE 3000
CMD [ "node", "index.js" ]
