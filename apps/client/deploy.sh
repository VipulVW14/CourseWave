#!/bin/bash
export PATH=$PATH:home/ubuntu/.nvm/versions/node/v21.2.0/bin

cd /home/ubuntu/CourseWave/ 
git pull origin main
/home/ubuntu/.nvm/versions/node/v21.2.0/bin/yarn install 
/home/ubuntu/.nvm/versions/node/v21.2.0/bin/yarn build 
/home/ubuntu/.nvm/versions/node/v21.2.0/bin/pm2 stop next
/home/ubuntu/.nvm/versions/node/v21.2.0/bin/pm2 start npm --name "next" -- run "start:next"

 