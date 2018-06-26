#!/bin/bash
set -e
apiid="ofea0n70ae"

echo $1

# aws apigateway put-rest-api --rest-api-id $apiid --mode $1 --body ../../cloudformation/swagger.json
aws apigateway put-rest-api --rest-api-id $apiid  --mode $1 --body 'file:////home/code5/src/salestool-nodejs-backend/cloudformation/swagger.json'
