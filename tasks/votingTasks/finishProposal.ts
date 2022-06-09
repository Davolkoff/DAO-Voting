import { task } from "hardhat/config";
import * as dotenv from "dotenv";

dotenv.config();

task("finish", "Finishes selected voting")
.addParam("pid", "Proposal ID")
.setAction(async (args, hre) => {

    const daoVoting = await hre.ethers.getContractAt("DAOVoting", process.env.DAO_ADDRESS as string);

    await daoVoting.finishProposal(args.pid);

    console.log("Voting successfully ended");
});