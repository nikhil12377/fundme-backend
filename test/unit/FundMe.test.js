const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");

describe("FundMe", async () => {
  let fundMe;
  let deployer;
  let sendValue = ethers.utils.parseEther("1");

  beforeEach(async () => {
    // Deploy contract
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture();
    fundMe = await ethers.getContract("FundMe", deployer);
    console.log(network.config.chainId);
  });

  describe("fund", async () => {
    it("Fails if you don't send enough ethers!", async () => {
      await expect(fundMe.fund()).to.be.revertedWith("Send atleast 1 ether");
    });

    it("Update the amount funded data structure", async () => {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.s_addressToAmount(deployer);
      assert.equal(response.toString(), sendValue.toString());
    });

    it("Adding funder to funders array", async () => {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.s_funders(0);
      assert.equal(response, deployer);
    });
  });

  describe("withdraw", async () => {
    beforeEach(async () => {
      await fundMe.fund({ value: sendValue });
    });

    it("Withdraw ETH from one funder", async () => {
      // balance before withdraw
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      // withdraw
      const transaction = await fundMe.withdraw();
      const transactionReceipt = await transaction.wait(1);

      // balance after withdraw
      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasFees = gasUsed.mul(effectiveGasPrice);

      // check if contract balance is zero or not after withdraw
      assert.equal(endingFundMeBalance, 0);
      // check the owner balance after the withdraw
      // is equal to balance of contract and owner before withdraw
      // plus gas fees
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasFees).toString()
      );
    });

    it("Withdraw ETH form multiple funder", async () => {
      const accounts = await ethers.getSigners();
      for (var i = 1; i < 6; i++) {
        const connectedFundMe = await fundMe.connect(accounts[i]);
        await connectedFundMe.fund({ value: sendValue });
      }

      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      const transaction = await fundMe.withdraw();
      const transactionReceipt = await transaction.wait(1);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasFees = gasUsed.mul(effectiveGasPrice);

      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasFees).toString()
      );

      await expect(fundMe.s_funders(0)).to.be.reverted;

      for (var i = 1; i < 6; i++) {
        assert.equal(await fundMe.s_addressToAmount(accounts[i].address), 0);
      }
    });

    it("Only allows owner to withdraw", async () => {
      const accounts = await ethers.getSigners();
      const attacker = accounts[1];
      const attackerFundMe = await fundMe.connect(attacker);
      await expect(attackerFundMe.withdraw()).to.be.reverted;
    });

    it("cheaperWithdraw ETH from one funder", async () => {
      // balance before withdraw
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      // withdraw
      const transaction = await fundMe.cheaperWithdraw();
      const transactionReceipt = await transaction.wait(1);

      // balance after withdraw
      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasFees = gasUsed.mul(effectiveGasPrice);

      // check if contract balance is zero or not after withdraw
      assert.equal(endingFundMeBalance, 0);
      // check the owner balance after the withdraw
      // is equal to balance of contract and owner before withdraw
      // plus gas fees
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasFees).toString()
      );
    });

    it("Cheaper withdraw testing...", async () => {
      const accounts = await ethers.getSigners();
      for (var i = 1; i < 6; i++) {
        const connectedFundMe = await fundMe.connect(accounts[i]);
        await connectedFundMe.fund({ value: sendValue });
      }

      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      const transaction = await fundMe.cheaperWithdraw();
      const transactionReceipt = await transaction.wait(1);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasFees = gasUsed.mul(effectiveGasPrice);

      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasFees).toString()
      );

      await expect(fundMe.s_funders(0)).to.be.reverted;

      for (var i = 1; i < 6; i++) {
        assert.equal(await fundMe.s_addressToAmount(accounts[i].address), 0);
      }
    });
  });
});
