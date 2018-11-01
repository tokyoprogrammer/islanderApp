#!/bin/bash

monaca update --force

if [ $? -eq 1 ]
then 
  echo "Something went wrong while updating monaca."
  echo "Maybe the version is already up-to-date."
fi

exit
