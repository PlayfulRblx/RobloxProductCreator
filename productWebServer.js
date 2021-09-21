const http = require("http")
const fs = require("fs")

class ProductWebServer {
  constructor(client) {
    this.client = client
    this.server = http.createServer(async (req, res) => {
      if (req.headers.authorization != process.env.SERVERAUTH) {
        return res.writeHead(401).end()
      }

      let d = ""

      req.on("data", data => d += data)

      req.on("end", async () => {
        let data = d != "" ? JSON.parse(d) : ""
        if (req.url == "/addProduct" && req.method == "POST") {
          let existingProductId = client.existingProducts[data.price]

          if (existingProductId) {
            res.writeHead(200).write(JSON.stringify({ "productId": existingProductId }))
            return res.end()
          } else {
            await client.noblox.addDeveloperProduct(data.universeId, process.env.PRODUCTNAME.replace("{amount}", data.price), data.price, process.env.PRODUCTDESCRIPTION.replace("{amount}", data.price))
            let allProducts = []
            let lastPage = 1
            while (true) {
              let devProducts = await client.noblox.getDeveloperProducts(data.placeId, lastPage++)
              allProducts = allProducts.concat(devProducts.DeveloperProducts)
              if (devProducts.FinalPage) break
            }
            let product = allProducts.find(p => p.Name == process.env.PRODUCTNAME.replace("{amount}", data.price)).ProductId
            client.existingProducts[data.price] = product
            fs.writeFileSync("./existingProducts.json", JSON.stringify(client.existingProducts, null, 4))
            res.writeHead(200).write(JSON.stringify({ "productId": product }))
            return res.end()
          }
        }
      })

    })
    this.server.listen(process.env.PORT).on("listening", () => {
      console.log("Product server listening on " + process.env.PORT)
    })
  }
}

module.exports = ProductWebServer