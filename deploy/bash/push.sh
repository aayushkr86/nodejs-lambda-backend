## Now take a folder name 
# take a zip of that folder and mv it to this deply/src folder
# upload it on the s3.
# after upload send it to the aws cli lambda update-code

# take all arguments
# for arg; do
#   printf $arg
#   bash zip.sh $arg
# done

log=$(git log -1 --pretty=%B);
echo $log
for char in `echo $log | fold -s`; do
    echo $char
    bash zip.sh $char
done