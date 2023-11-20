#!/bin/bash
export PATH=$PATH:/home/ubuntu/.nvm/versions/node/v21.2.0/bin

. /home/ubuntu/.nvm/nvm.sh
nvm use 21.2.0

echo "Current PATH: $PATH"
node -v

cd /home/ubuntu/CourseWave/ 
git pull origin main
yarn install 
cd /home/ubuntu/CourseWave/apps/client
yarn build 
pm2 stop next
pm2 start npm --name "next" -- run "start:next"

 