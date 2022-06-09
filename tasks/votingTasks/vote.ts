import { task } from "hardhat/config";
import * as dotenv from "dotenv";

dotenv.config();

task("vote", "Vote for or against the proposal")
.addParam("pid", "Proposal ID")
.addParam("choice", "1 - vote for proposal, 0 - against")
.setAction(async (args, hre) => {

    const daoVoting = await hre.ethers.getContractAt("DAOVoting", process.env.DAO_ADDRESS as string);

    await daoVoting.vote(args.pid, args.choice);

    console.log("You successfully voted");
});