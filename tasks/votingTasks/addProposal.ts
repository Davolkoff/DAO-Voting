import { task } from "hardhat/config";
import * as dotenv from "dotenv";
import { jsonAbi, parameters, description } from "../../proposal_params";

dotenv.config();

task("addpr", "Adds new proposal")
.addParam("recipient", "The contract on which the function will be called after the voting is completed")
.setAction(async (args, hre) => {
    
    var iface = new hre.ethers.utils.Interface(jsonAbi);
    var calldata = iface.encodeFunctionData('changeSettings', parameters);

    const daoVoting = await hre.ethers.getContractAt("DAOVoting", process.env.DAO_ADDRESS as string);

    const addProposalResponse = await daoVoting.addProposal(args.recipient, calldata, description);
    const addProposalReceipt = await addProposalResponse.wait();

    console.log("Proposal successfully added");
    console.log(`Proposal ID: ${addProposalReceipt.events[0].args[0]}`);
});