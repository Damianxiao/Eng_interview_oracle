
const hre = require('hardhat')
const dotenv = require('dotenv')
dotenv.config("./.env");

const initialowner = process.env.initialAddress

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const ComputeOracle = await hre.ethers.getContractFactory('ComputeOracle');
    const computeOracle = await ComputeOracle.deploy(deployer.address);
    // deployed() is depredict use waitForDeployment instead
    await computeOracle.waitForDeployment();
    const contractAddress = await computeOracle.getAddress()
    console.log('ComputeOracle deployed to:', contractAddress);
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });