import { task } from "hardhat/config";
import * as dotenv from "dotenv";

dotenv.config();

task("delegate", "Deposits tokens to DAO voting contract")
.addParam("to", "Delegate's address")
.addParam("pid", "Proposal ID")
.setAction(async (args, hre) => {
    
    const daoVoting = await hre.ethers.getContractAt("DAOVoting", process.env.DAO_ADDRESS as string);

    await daoVoting.delegateVote(args.to, args.pid);

    console.log("Vote successfully delegated");
});