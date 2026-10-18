require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const config = {
  solidity: "0.8.24",
  paths: { sources: "./contracts", tests: "./test", cache: "./cache", artifacts: "./artifacts" },
  networks: {}
};

if (process.env.BASE_SEPOLIA_RPC_URL && process.env.DEPLOYER_PRIVATE_KEY) {
  config.networks.baseSepolia = {
    url: process.env.BASE_SEPOLIA_RPC_URL,
    chainId: 84532,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY]
  };
}

module.exports = config;
