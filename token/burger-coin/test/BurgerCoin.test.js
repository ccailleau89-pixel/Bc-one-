const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BurgerCoin (BCONE)", function () {
  async function deploy() {
    const [deployer, recipient, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("BurgerCoin");
    const token = await Factory.deploy();
    await token.waitForDeployment();
    return { token, deployer, recipient, other };
  }

  it("has the expected name and symbol", async function () {
    const { token } = await deploy();
    expect(await token.name()).to.equal("Burger Coin");
    expect(await token.symbol()).to.equal("BCONE");
    expect(await token.decimals()).to.equal(18);
  });

  it("mints exactly 100 million tokens to the deployer", async function () {
    const { token, deployer } = await deploy();
    const supply = ethers.parseUnits("100000000", 18);
    expect(await token.totalSupply()).to.equal(supply);
    expect(await token.balanceOf(deployer.address)).to.equal(supply);
  });

  it("supports standard ERC-20 transfers", async function () {
    const { token, recipient } = await deploy();
    const amount = ethers.parseUnits("125", 18);
    await expect(token.transfer(recipient.address, amount))
      .to.changeTokenBalances(token, (await ethers.getSigners()).slice(0, 2), [-amount, amount]);
  });

  it("does not expose a public mint function", async function () {
    const { token } = await deploy();
    expect(token.interface.hasFunction("mint")).to.equal(false);
  });

  it("keeps the total supply fixed after transfers", async function () {
    const { token, recipient } = await deploy();
    const supply = await token.totalSupply();
    await token.transfer(recipient.address, ethers.parseUnits("1", 18));
    expect(await token.totalSupply()).to.equal(supply);
  });
});
