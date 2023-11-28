#!/bin/bash
export PATH=$PATH:/home/ubuntu/.nvm/versions/node/v21.2.0/bin

cd /home/ubuntu/CourseWave/apps/backend/server/
git pull origin main
sudo docker-compose down
sudo docker-compose up -d



 
