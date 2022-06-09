import { task } from "hardhat/config";
import * as dotenv from "dotenv";

dotenv.config();

task("sinfo", "Information about settings of the DAO Voting contract")
.setAction(async (args, hre) => {
    
    const daoVoting = await hre.ethers.getContractAt("DAOVoting", process.env.DAO_ADDRESS as string);
    const info = await daoVoting.settingsInfo();

    console.log(`\nMinimum number of votes: ${info[0]}`);
    console.log(`Expiration time for votings: ${info[1]}`);
});