const { https: { get: _get } } = require('follow-redirects');

async function get (url) {
return new Promise((resolve, reject) => {
    _get(url, res => {
        const chunks = []
        res.on('data', chunk => chunks.push(chunk));
        res.on("end", () => resolve(JSON.parse(Buffer.concat(chunks))))
        res.on('error', reject);
      }).on('error', reject);
})
}

module.exports.handler = (e, ctx) => {
  
}