import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers, network } from "hardhat";

describe("Staking contract", function () {
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;
    let dao: SignerWithAddress;
    
    let mainToken: Contract;
    let stakingContract: Contract;

    describe("Deploying", async function () {
        it("Should deploy main token", async function () {
            [owner, addr1, addr2, dao] = await ethers.getSigners();
        
            const MT = await ethers.getContractFactory("VoteToken");
            
            mainToken = await MT.deploy("VToken", "VT", 18);
            await mainToken.deployed();
        
            await mainToken.mint(owner.address, 2000);
            await mainToken.mint(addr1.address, 1000);
            await mainToken.mint(addr2.address, 1000);
        });
        
        it("Should deploy staking contract", async function () {
            const SC = await ethers.getContractFactory("MyStaking");
            
            stakingContract = await SC.deploy(1200, 1, 600, mainToken.address);
            await stakingContract.deployed();
            
            await stakingContract.connectDAO(dao.address);
            await mainToken.mint(stakingContract.address, 100000); // rewards tokens
        });
    });

    describe("Contract functions", async function () {
        it("Should revert connecting DAO not by an owner", async function () {
            await expect(stakingContract.connect(addr1).connectDAO(dao.address)).to.be.revertedWith("Not an owner");  
        });

        it("Should revert connecting DAO second time", async function () {
            await expect(stakingContract.connectDAO(dao.address)).to.be.revertedWith("DAO already connected");  
        });

        it("Should revert changing settings not by DAO", async function () {
            await expect(stakingContract.changeSettings(10,10,10)).to.be.revertedWith("Not a DAO");  
        });

        it("Should stake your tokens", async function() {
            const mainTokenAmount = 1000;

            await mainToken.approve(stakingContract.address, mainTokenAmount);
            await stakingContract.stake(mainTokenAmount);
            expect(await mainToken.balanceOf(stakingContract.address)).to.equal(mainTokenAmount+100000); // + already minted tokens
        });
        
        it("Should revert transaction if you try to send 0 tokens", async function() {
            await expect(stakingContract.stake(0)).to.be.revertedWith("You can't send 0 tokens");
        });

        it("Should revert withdrawing if you haven't got reward tokens", async function() {
            await expect(stakingContract.claim()).to.be.revertedWith("You haven't got reward tokens");
        });

        it("Should withdraw rewards tokens", async function() {
            await network.provider.send("evm_increaseTime", [3000]);
            await network.provider.send("evm_mine");

            await stakingContract.claim();
            expect(Number(await mainToken.balanceOf(owner.address))).to.greaterThan(0);
        });

        it("Should withdraw user's available staked tokens", async function() {
            const unwithdrawableAmount = "500";
            await mainToken.approve(stakingContract.address, unwithdrawableAmount);
            await stakingContract.stake(unwithdrawableAmount);

            await stakingContract.unstake();
            const userInfo = await stakingContract.userInfo(owner.address);
            expect(userInfo[0]).to.equal(unwithdrawableAmount);
        });

        it("Should revert unstaking if you haven't got available staked tokens", async function() {
            const unwithdrawableAmount = "500";
            await mainToken.approve(stakingContract.address, unwithdrawableAmount);
            await stakingContract.stake(unwithdrawableAmount);
            await expect(stakingContract.unstake()).to.be.revertedWith("You can't unstake staked tokens right now");
        });

        it("Should revert unstaking if you haven't staked tokens", async function() {
            await network.provider.send("evm_increaseTime", [1200]);
            await network.provider.send("evm_mine");
            console.log(await stakingContract.userInfo(owner.address))
            await stakingContract.unstake();
            await expect(stakingContract.unstake()).to.be.revertedWith("Nothing to unstake");
        });
    });



});