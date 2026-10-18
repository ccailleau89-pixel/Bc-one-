const { ethers } = require("hardhat");

async function main() {
  if (network.name !== "baseSepolia") {
    throw new Error(`Refusing deployment on "${network.name}". Use --network baseSepolia.`);
  }
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Network:", network.name, "(chain ID 84532)");
  console.log("Deployer:", deployer.address);
  console.log("Deployer ETH balance:", ethers.formatEther(balance));
  if (balance === 0n) throw new Error("Deployer has no test ETH. Fund it before deployment.");

  const Factory = await ethers.getContractFactory("BurgerCoin");
  const token = await Factory.deploy();
  await token.waitForDeployment();
  console.log("BurgerCoin deployed at:", await token.getAddress());
  console.log("Initial supply:", ethers.formatUnits(await token.totalSupply(), 18), "BCONE");
  console.log("Verify the address and test transfers on Base Sepolia before any mainnet launch.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
