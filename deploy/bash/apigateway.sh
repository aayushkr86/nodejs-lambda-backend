#!/bin/bash
set -e
apiid=""

echo $1

aws apigateway put-rest-api --rest-api-id $apiid --mode $1 --body ../../cloudformation/swagger.json
