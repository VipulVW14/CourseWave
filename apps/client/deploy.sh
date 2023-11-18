#!/bin/bash
export PATH=$PATH:home/ubuntu/.nvm/versions/node/v21.2.0/bin

cd /home/ubuntu/CourseWave/apps/client/
git pull origin main
yarn install 
yarn build 
pm2 stop next
pm2 start npm --name "next" -- run "start:next"

 