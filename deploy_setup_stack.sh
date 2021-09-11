#!/bin/bash

aws cloudformation deploy \
  --stack-name cignal-setup \
  --template-file ./setup_stack.yml \
  --capabilities CAPABILITY_IAM