require('dotenv').config()
const noblox = require("noblox.js")
const ProductWebServer = require("./productWebServer")
const existingProducts = require("./existingProducts.json")
const client = {existingProducts}

async function main() {
  client.noblox = noblox
  client.nobloxUser = await noblox.setCookie(process.env.COOKIE)
  console.log(`Logged in as ${client.nobloxUser.UserName} [${client.nobloxUser.UserID}]`)
  client.productServer = new ProductWebServer(client)
}

main();