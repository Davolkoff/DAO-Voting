import { ethers } from "hardhat";
import * as fs from 'fs'
import * as dotenv from "dotenv"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

dotenv.config();

async function main() {
  let chairPerson: SignerWithAddress;

  [chairPerson] = await ethers.getSigners();

  const DAO = await ethers.getContractFactory("DAOVoting");
  const dao = await DAO.deploy(chairPerson.address, process.env.VOTE_TOKEN_ADDRESS as string, 1000, 86400);

  await dao.deployed();

  console.log("DAO Voting contract address:", dao.address);

  fs.appendFileSync('.env', `\nDAO_ADDRESS=${dao.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });