const { network, ethers } = require("hardhat");
const verify = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const fundMe = await deploy("FundMe", {
    from: deployer,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
    args: [ethers.utils.parseEther("0.1")],
  });

  log(
    "-------------------------------------------------------------------------------------"
  );
  log(fundMe.address);

  if (process.env.ETHERSCAN_API_KEY && network.config.chainId !== 31337) {
    verify(fundMe.address);
  }
};
