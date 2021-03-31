FROM node:14

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ["package.json", "package-lock.json*", "./"]

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 3001

# Run tests
CMD ["npm", "run", "build:test"]
CMD ["npm", "run", "start:test"]

# Run migrations
CMD ["npm", "run", "migrations"]

# Run the servere
CMD ["npm", "run", "develop"]