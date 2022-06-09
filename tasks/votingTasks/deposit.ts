import { task } from "hardhat/config";
import * as dotenv from "dotenv";

dotenv.config();

task("deposit", "Deposits tokens to DAO voting contract")
.addParam("amount", "Amount of tokens")
.setAction(async (args, hre) => {

    const voteToken = await hre.ethers.getContractAt("VoteToken", process.env.VOTE_TOKEN_ADDRESS as string);
    const daoVoting = await hre.ethers.getContractAt("DAOVoting", process.env.DAO_ADDRESS as string);

    await voteToken.approve(process.env.DAO_ADDRESS as string, args.amount);
    await daoVoting.deposit(args.amount);

    console.log("Tokens successfully deposited");
});