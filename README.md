# cignal

get 📧 4 when it's ⌚ 2 🛒 ur fav crypto <sub>unofficially powered by [`coingecko`](https://www.coingecko.com/api/documentations/v3)</sub>

## usage

deploy the stack parameterized to your needs

> at a minimum you would want to set your drop list and receipient email address(es)

## params

specifyin' price drops 2 look out 4 looks like this:

```
DOT:-25%,KSM:-20%,MOVR:-20%
```

when no drop percentage is specified, it defaults to -15%

such a string must be set as cfn param `Drops` as shown in below command

```bash
aws cloudformation deploy \
  --stack-name=cignal \
  --template-file=./stack.yml \
  --parameter-overrides \
    Drops="DOT:-25%,KSM:-20%,MOVR:-20%" \
    RecipientEmailAddresses="x@y.z,a@b.c" \
    LambdaBundleBucketName=my-lambda-bundle-bucket \
    LambdaBundleFilename=lambda.zip \
    LambdaMemorySize=128 \
    LambdaTimeout=3 \
    LambdaSchedule="0/5 * * * *" \
    LambdaLogRetentionDays=7 \
  --capabilities=CAPABILITY_IAM \
  --no-fail-on-empty-changeset
```

happy shoppin' 🛒💱💰