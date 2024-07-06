require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
    },
    // local: {
    //   url: [process.env.RPC],
    //   accounts: [process.env.PRIVATE_KEY]
    // }
  },
};
