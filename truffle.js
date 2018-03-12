// Allows us to use ES6 in our migrations and tests.

module.exports = {
  build: {
    "index.html": "index.html",
    "app.js": ["javascripts/app.js"],
    "app.css": ["stylesheets/app.css"],
    "images/": "images/"
  },
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*', // Match any network id
    }
  },
  rpc: {
    host: "localhost",
    port: 8545,
    gas: 4712
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
}
