require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainID: 31337,
      blockConformations: 1,
    },
    goerli: {
      chainID: 5,
      blockConformations: 2,
      url: process.env.GOERLI_RPC_PROVIDER,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  gasReporter: {
    enabled: false,
    currency: "INR",
    coinmarketcap: process.env.COINMARKET_API_KEY || undefined,
    token: "MATIC",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },

  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 0,
    },
  },
};
