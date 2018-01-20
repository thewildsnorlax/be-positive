#!/bin/bash
echo "$1"
tag="latest"
if [ "$2" ]; then
	tag="$2"
fi
echo "$tag"
git pull
git submodule update --init --recursive
docker build -t $1 -f docker/Dockerfile  .
docker tag $1:latest 229794068154.dkr.ecr.us-east-1.amazonaws.com/$1:$tag
docker push 229794068154.dkr.ecr.us-east-1.amazonaws.com/$1:$tag
