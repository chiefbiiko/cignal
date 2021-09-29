# cignal

get 📧 4 when it's ⌚ 2 🛒 ur fav crypto <sub>unofficially powered by [`coingecko`](https://www.coingecko.com/api/documentations/v3)</sub>

## usage

deploy the stack parameterized to ur needs

## drops

specifyin' price drops, cfn param `Drops`, looks like this:

```
KSM-30%,MOVR
```

when no drop percentage is specified, it defaults to -20%

## all deployment params

```bash
aws cloudformation deploy \
  --stack-name=cignal \
  --template-file=./stack.yml \
  --parameter-overrides \
    Drops="DOT-25%,KSM-20%,MOVR-20%" \
    Recipients="x@y.z,a@b.c" \
    LambdaBundleBucketName=my-lambda-bundle-bucket \
    LambdaBundleFilename=lambda.zip \
    LambdaMemorySizeMb=128 \
    LambdaTimeoutSeconds=5 \
    LambdaSchedule="rate(5 minutes)" \
    LambdaLogRetentionDays=1 \
  --capabilities=CAPABILITY_IAM \
  --no-fail-on-empty-changeset
```

happy shoppin' 🛒📦📦

## license

[MIT](./LICENSE)