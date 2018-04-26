cd ../../
aws s3 sync salestool-nodejs-backend s3://salestool-nodejs-backend --exclude ".git*,node_modules/*,spec/*/node_modules/*"