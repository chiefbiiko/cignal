const { S3, SNS } = require("aws-sdk")
const { get } = require("https")

function debug(...args) {
  console.log("[DEBUG]", ...args)
}

function parseDrops() {
  return process.env.DROPS.split(",").map(drop => {
    const [symbol, perc = "-20%"] = drop.split(/\b(?=-)/)
    return {
      symbol: symbol.toLowerCase(),
      minDropPerc: Number(perc.replace("%", ""))
    }
  })
}

const DROPS_PATTERN = /^[A-Z-_]+(:?-\d+\%)?(:?,[A-Z-_]+(:?-\d+\%)?)*$/

const symbolToCoinGeckoId = Object.freeze({
  eth: "ethereum",
  btc: "bitcoin",
  movr: "moonriver",
  glmr: "glimmer",
  ksm: "kusama",
  dot: "dot",
  stake: "xdai-stake"
})

if (!process.env.MEM_BUCKET_NAME) throw Error("env var MEM_BUCKET_NAME unset")
if (!process.env.TOPIC_ARN) throw Error("env var TOPIC_ARN unset")
if (!process.env.DROPS) throw Error("env var DROPS unset")
if (!DROPS_PATTERN.test(process.env.DROPS))
  throw Error("env var DROPS malformatted, must be CSV, fx 'DOT,MOVR-30%'")

const drops = parseDrops()

debug("drops", drops)

const s3 = new S3({ params: { Bucket: process.env.MEM_BUCKET_NAME } })
const sns = new SNS()

module.exports.handler = async () => {
  await Promise.all(
    drops.map(async ({ symbol, minDropPerc }) => {
      const coin = await getCoin(symbol)
      debug(
        `${symbol} price_change_percentage_24h, minDropPerc`,
        coin.price_change_percentage_24h,
        minDropPerc
      )
      debug(
        "typeof coin.price_change_percentage_24h, typeof minDropPerc",
        typeof coin.price_change_percentage_24h,
        typeof minDropPerc
      )
      if (coin.price_change_percentage_24h <= minDropPerc) {
        const alreadyNotified = await memoize(symbol)
        debug("alreadyNotified", alreadyNotified)
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
          debug(`just sent msg ${msgId}: "${msgTxt}"`)
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
    get(
      `https://api.coingecko.com/api/v3/coins/${
        symbolToCoinGeckoId[symbol.toLowerCase()]
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
