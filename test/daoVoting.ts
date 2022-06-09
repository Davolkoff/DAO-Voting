import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers, network } from "hardhat";

describe("DAO Voting", function () {
  let voteToken: Contract; // vote token
  let votingContract: Contract; // DAO voting contract
  let stakingContract: Contract; // staking contract

  let chairPerson: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  
  describe("Deploying", async function () {
    it("Should deploy vote token", async function () {
      [chairPerson, addr1, addr2] = await ethers.getSigners();

      const VT = await ethers.getContractFactory("VoteToken");
      
      voteToken = await VT.deploy("VToken", "VT", 18);
      await voteToken.deployed();

      await voteToken.mint(chairPerson.address, 1000);
      await voteToken.mint(addr1.address, 1000);
      await voteToken.mint(addr2.address, 1000);
    });

    it("Should deploy voting contract", async function () {
      const VC = await ethers.getContractFactory("DAOVoting");
      
      votingContract = await VC.deploy(chairPerson.address, voteToken.address, 90, 3600);
      await votingContract.deployed();
      await voteToken.connectVc(votingContract.address);

      const info = await votingContract.settingsInfo();
      expect(info[0]).to.equal(90);
      expect(info[1]).to.equal(3600);
    });

    it("Should deploy staking contract (for tests)", async function () {
      const SC = await ethers.getContractFactory("MyStaking");
      
      stakingContract = await SC.deploy(1200, 1, 600, voteToken.address);
      await stakingContract.deployed();
      await stakingContract.connectDAO(votingContract.address);
    });
  });

  describe("Contract functions", async function () {
    it("Should allow you to deposit tokens", async function () {
      await voteToken.approve(votingContract.address, 100);
      await votingContract.deposit(100);
      await voteToken.connect(addr1).approve(votingContract.address, 50);
      await votingContract.connect(addr1).deposit(50);
      expect(await voteToken.balanceOf(votingContract.address)).to.equal(150);
      expect(await votingContract.balanceOf(chairPerson.address)).to.equal(100);
      expect(await votingContract.balanceOf(addr1.address)).to.equal(50);
    });

    it("Should allow chair person to add new proposal", async function () {
      var jsonAbi = [{
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_freezeTime",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_rewardsPercent",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_rewardsFrequency",
            "type": "uint256"
          }
        ],
        "name": "changeSettings",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }];

      var description = "Changing settings in staking contract";
      // for testing situations with correct signature
      var iface = new ethers.utils.Interface(jsonAbi);
      var calldata = iface.encodeFunctionData('changeSettings', [100, 10, 10]);

      // I created two proposals to test different situations (here I work with external contract)
      await votingContract.addProposal(stakingContract.address, calldata, description);
      await votingContract.addProposal(stakingContract.address, calldata, description);
      
      // expectations
      const info = await votingContract.votingInfo(0);

      expect(info[0]).to.equal(description);
      expect(info[1]).to.equal("0");
      expect(info[2]).to.equal("0");
      expect(info[3]).to.equal(false);
      await expect(
        votingContract.connect(addr1).addProposal(stakingContract.address, calldata, description)
        ).to.be.revertedWith("Not a chair person");

      // here I work with chainging settings inside voting contract
      jsonAbi = [{
        "inputs": [
          {
            "internalType": "uint256",
            "name": "minimumQuorum_",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "debatingPeriodDuration_",
            "type": "uint256"
          }
        ],
        "name": "changeSettings",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }];
      description = "Changing settings of voting contract"
      iface = new ethers.utils.Interface(jsonAbi);
      calldata = iface.encodeFunctionData('changeSettings', [20, 1200]);
      await votingContract.addProposal(votingContract.address, calldata, description);

    });

    it("Should allow you to vote in the voting", async function () {
      // first voting (proposal accepted by users)
      await votingContract.vote(0, 1);
      await votingContract.connect(addr1).vote(0, 0);
      var info = await votingContract.votingInfo(0);
      expect(info[1]).to.equal("100");
      expect(info[2]).to.equal("50");
      //second voting (proposal rejected by users)
      await votingContract.vote(1, 0);
      info = await votingContract.votingInfo(1);
      expect(info[1]).to.equal("0");
      expect(info[2]).to.equal("100");
      // third voting (chainging settings in voting contract)
      await votingContract.vote(2, 1);
      info = await votingContract.votingInfo(2);
      expect(info[1]).to.equal("100");
      expect(info[2]).to.equal("0");
    });

    it("Should allow you to vote just once", async function () {
      await expect(votingContract.vote(0, 0)).to.be.revertedWith("You have already voted");
    });

    it("Shouldn't allow you to vote if your balance is 0", async function () {
      await expect(votingContract.connect(addr2).vote(0, 0)).to.be.revertedWith("You haven't got vote tokens");
    });

    it("Shouldn't allow you to finish voting, if not enough time has passed", async function () {
      await expect(votingContract.finishProposal(0)).to.be.revertedWith("Too early");
    });

    it("Shouldn't allow you to vote after expiration time", async function () {
      await voteToken.connect(addr2).approve(votingContract.address, 200);
      await votingContract.connect(addr2).deposit(200);

      await network.provider.send("evm_increaseTime", [3600]);
      await network.provider.send("evm_mine");

      await expect(votingContract.connect(addr2).vote(0, 0)).to.be.revertedWith("Too late");
    });

    it("Should allow you to finish voting", async function () {
      await votingContract.finishProposal(0);

      const info = await stakingContract.stakingInfo();
      expect(info[0]).to.equal(100);
      expect(info[1]).to.equal(10);
      expect(info[2]).to.equal(10);
    });

    it("Should change contract settings", async function () {
      await votingContract.finishProposal(2);
      
      const info = await votingContract.settingsInfo();
      expect(info[0]).to.equal(20);
      expect(info[1]).to.equal(1200);
    });

    it("Should change settings only by DAO voting", async function () {
      await expect(votingContract.changeSettings(20,1200)).to.be.revertedWith("Function can't be called by user");
    });

    it("Shouldn't allow you to withdraw tokens, if you have active votings", async function () {
      await expect(votingContract.withdraw("90")).to.be.revertedWith("You are taking part in the voting");
    })
    
    it("Should allow you to withdraw your tokens", async function () {
      await votingContract.finishProposal(1);
      await votingContract.withdraw("90");
      
      expect(await voteToken.balanceOf(chairPerson.address)).to.equal("990");
      expect(await voteToken.balanceOf(votingContract.address)).to.equal("260");
    });

    it("Shouldn't allow you to withdraw tokens, if you have not enough tokens", async function () {
      await expect(votingContract.withdraw("1000")).to.be.revertedWith("You have not enough tokens");
    });
  });
});
