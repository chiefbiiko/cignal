const { S3, SNS } = require("aws-sdk")
const {
  https: { get: _get }
} = require("follow-redirects")

if (!process.env.MEM_BUCKET_NAME) throw Error("env var MEM_BUCKET_NAME unset")
if (!process.env.TOPIC_ARN) throw Error("env var TOPIC_ARN unset")

console.log("process.env.DROPS", process.env.DROPS)

const drops = process.env.DROPS.split(",").map(drop => {
  const [symbol, perc = "-20%"] = drop.split(/\b(?=-)/)
  if (!perc.startsWith("-")) throw Error("non-negative price change defined")
  return {
    symbol: symbol.toLowerCase(),
    minDropPerc: Number(perc.replace("%", ""))
  }
})

console.log("drops", drops)

const symbolToCoinGeckoId = Object.freeze({
  eth: "ethereum",
  btc: "bitcoin",
  movr: "moonriver",
  glmr: "glimmer",
  ksm: "kusama",
  dot: "dot",
  stake: "xdai-stake"
})

const s3 = new S3({ params: { Bucket: process.env.MEM_BUCKET_NAME } })
const sns = new SNS()

module.exports.handler = async () => {
  await Promise.all(
    drops.map(async ({ symbol, minDropPerc }) => {
      const coin = await getCoin(symbol)
      console.log(
        `${symbol} price_change_percentage_24h, minDropPerc`,
        coin.price_change_percentage_24h,
        minDropPerc
      )
      console.log(
        "typeof coin.price_change_percentage_24h, typeof minDropPerc",
        typeof coin.price_change_percentage_24h,
        typeof minDropPerc
      )
      if (coin.price_change_percentage_24h <= minDropPerc) {
        const alreadyNotified = await memoize(symbol)
        console.log("alreadyNotified", alreadyNotified)
        if (!alreadyNotified) {
          const msgTxt = `${symbol.toUpperCase()} dropd ${
            coin.price_change_percentage_24h
          }% within 24hrs`
          const { MessageId: msgId } = await sns
            .publish({
              Message: msgTxt,
              TopicArn: process.env.TOPIC_ARN
            })
            .promise()
          console.log(`just sent msg ${msgId}: "${msgTxt}"`)
        }
      }
    })
  )
}

// Memoizes if not happened for given today-date
// Returns true if an email has been sent about symbol's today drop else false
async function memoize(symbol) {
  const date = new Date().toISOString()
  const objectKey = `${date.slice(0, 10)}/${symbol}`
  try {
    await s3.headObject({ Key: objectKey }).promise()
    return true
  } catch (err) {
    if (err.code === "NotFound") {
      await s3.putObject({ Key: objectKey, Body: "📧" }).promise()
      return false
    } else {
      throw err
    }
  }
}

async function getCoin(symbol) {
  return new Promise((resolve, reject) => {
    _get(
      `https://api.coingecko.com/api/v3/coins/${
        symbolToCoinGeckoId[symbol?.toLowerCase()]
      }?localization=false`,
      res => {
        const chunks = []
        res.on("data", chunk => chunks.push(chunk))
        res.on("end", () => resolve(JSON.parse(Buffer.concat(chunks))))
        res.on("error", reject)
      }
    ).on("error", reject)
  })
}
