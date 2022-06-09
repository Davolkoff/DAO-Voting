import { task } from "hardhat/config";
import * as dotenv from "dotenv";

dotenv.config();

task("balance", "Balance of selected user")
.addParam("user", "Address of user")
.setAction(async (args, hre) => {
    
    const daoVoting = await hre.ethers.getContractAt("DAOVoting", process.env.DAO_ADDRESS as string);
    
    console.log(`Balance: ${await daoVoting.balanceOf(args.user)}`);
});