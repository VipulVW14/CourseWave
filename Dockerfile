FROM node:14

WORKDIR /apps/client
COPY . .
RUN npm install
RUN npm run build

CMD ["npm", "start"]

EXPOSE 3000