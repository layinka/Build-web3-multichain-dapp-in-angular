// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();
  
  const nft = await hre.ethers.deployContract("NFTToken", 
    [],
    {
        // value: 1,
        // from: deployers[1]
    }
  );

  console.log(`NFT is deployed at ${nft.target}`)

  let tx = await nft.mint('http://localhost:4200/assets/metadata.json');
  await tx.wait();

  tx = await nft.mint('http://localhost:4200/assets/metadata.json');
  await tx.wait();

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
