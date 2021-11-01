const fetch = require('node-fetch')

async function getSupportedTokens() {
  let tokensBasicInfoRequest = await fetch('https://api.kyber.network/currencies');
//   let tokensBasicInfo = await tokensBasicInfoRequest.json();
//   console.log(tokensBasicInfo);
//   return tokensBasicInfo;
}

getSupportedTokens()