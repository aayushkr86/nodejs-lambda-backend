#!/bin/bash
set -e
projname=""
cd ..
cd ..
cd src/lambda/"$1"
pwd
zip -r $1.zip .
mv $1.zip ../../../deploy/src/
cd ../../../deploy/src
# push file to s3 with particular location
# upload it to the aws cli --update-code with link
# s3:///s3.amazonaws.com/bucketname

aws s3 --region eu-central-1 cp $1.zip s3://salestool-nodejs-backend/deploy/src/$1.zip
# name="arn:aws:lambda:eu-central-1:188097494660:function:$projname$1"
# aws lambda update-function-code --function-name $name --s3-bucket salestool-nodejs-backend --s3-key deploy/src/$1.zip --region eu-central-1
