import { task } from "hardhat/config";
import * as dotenv from "dotenv";

dotenv.config();

task("mint", "Mints fungible tokens on selected account")
.addParam("to", "Receiver of tokens")
.addParam("amount", "Amount of tokens")
.setAction(async (args, hre) => {

    const token = await hre.ethers.getContractAt("VoteToken", process.env.VOTE_TOKEN_ADDRESS as string);
    await token.mint(args.to, args.amount);
    console.log("Tokens successfully minted");
});