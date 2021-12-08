require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

const HARMONY_PRIVATE_KEY = process.env.PrivateKey;

module.exports = {
  solidity: "0.8.4",
  networks: {
    testnet: {
      url: `https://api.s0.b.hmny.io`,
      accounts: [`0x${HARMONY_PRIVATE_KEY}`]
    },
    mainnet: {
      url: `https://api.harmony.one`,
      accounts: [`0x${HARMONY_PRIVATE_KEY}`]
    }
  }
};

