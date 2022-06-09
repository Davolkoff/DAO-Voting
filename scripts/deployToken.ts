import { ethers } from "hardhat";
import * as fs from 'fs'

async function main() {
  const VT = await ethers.getContractFactory("VoteToken");
  const vToken = await VT.deploy("VToken", "VT", 18);

  await vToken.deployed();

  console.log("Vote token contract address:", vToken.address);

  fs.appendFileSync('.env', `\nVOTE_TOKEN_ADDRESS=${vToken.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });