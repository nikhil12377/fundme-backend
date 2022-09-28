const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const all = await ethers.getSigners();
  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log("Funding...");
  let transaction = await fundMe.fund({
    value: ethers.utils.parseEther("0.1"),
  });
  await transaction.wait(1);
  console.log("Funded");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
