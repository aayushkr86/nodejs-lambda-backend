# cp the content of the file lambda and save it on another filename
#!/bin/bash
cd ..
cd src/lambda
echo $1
mkdir -p $1
cp -r ../../offline/sample/* $1
