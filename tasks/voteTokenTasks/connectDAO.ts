import { task } from "hardhat/config";
import * as dotenv from "dotenv";

dotenv.config();

task("connect", "Connects DAO voting contract to token")
.setAction(async (args, hre) => {
    const token = await hre.ethers.getContractAt("VoteToken", process.env.VOTE_TOKEN_ADDRESS as string);
    await token.connectVc(process.env.DAO_ADDRESS as string);
    console.log("DAO voting successfully connected");
});