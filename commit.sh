#!/bin/bash

if [ -z "$1" ]
  then
    echo "No argument supplied"
  else
    #echo $1
    git add .
    git commit -m "$1"
    git push origin master
fi

#git add .
#git commit -m 