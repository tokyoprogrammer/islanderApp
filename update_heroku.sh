#!/bin/bash

cd islander-jeju-app && git config --global user.email "yo1226@gmail.com" && git config --global user.name "Yoseob Kim" && git add * && git commit -am "deploy"

if [ $? -eq 1 ]
then
  echo "Something went wrong while updating heroku."
  echo "Maybe the branch is already up-to-date with origin/master"
fi

exit
