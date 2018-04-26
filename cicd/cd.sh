#!/bin/bash

# usage example (run as jenkins)
# sh ./cd.sh jiankaiwang bites travis-ci-key /home/cdc/bites

# get the parameter and set the directory
userName=""
repoName=""
ciKey=""
cdPath=""
if [ "$#" -ne 4 ] || ! [ -d "$4" ]; then
    echo "Usage: Default Settings"
    userName=jiankaiwang
    repoName=bites
    ciKey=""
    cdPath=/home/cdc/bites
else
    echo "Usage: Assigned Path"
    userName=$1
    repoName=$2
    ciKey=$3
    cdPath=$4
fi

cicdPath=$cdPath/cicd
cdlog=$cdPath/cdlog.txt
ciCheck=$(python ci.py -u $userName -n $repoName -t $ciKey -p $cdPath)
echo $ciCheck

if [ "$ciCheck" = "1" ]; then
    echo "No CD."
fi
if [ "$ciCheck" = "0" ]; then
    cd $cdPath
    originVer=$(git rev-parse HEAD)
    git checkout master
    git pull --rebase
    lastVer=$(git rev-parse HEAD)
    echo "$(date),origin:$originVer,latest:$lastVer,Activate CD." >> $cdlog
fi

exit 0








