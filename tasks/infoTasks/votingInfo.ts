import { task } from "hardhat/config";
import * as dotenv from "dotenv";

dotenv.config();

task("vinfo", "Information about selected voting")
.addParam("pid", "Proposal ID")
.setAction(async (args, hre) => {
    
    const daoVoting = await hre.ethers.getContractAt("DAOVoting", process.env.DAO_ADDRESS as string);
    const info = await daoVoting.votingInfo(args.pid);

    console.log(`Information about voting #${args.pid}`);
    console.log(`\nDescription: ${info[0]}`);
    console.log("\nVotes:");
    console.log(`For: ${info[1]}`);
    console.log(`Against: ${info[2]}`);
    console.log(`\nEnded: ${info[3]}`);
});