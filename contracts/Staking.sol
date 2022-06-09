//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./interfaces/IERC20.sol";

contract MyStaking {
    address private owner; // owner of contract
    address private daoContract; // address of DAO Voting contract
    bool public connected; // is DAO connected to this contract

    uint public freezeTime; // the time after which the user can withdraw lp tokens
    uint public rewardsPercent; // percent of rewards, depending on the number of lp tokens
    IERC20 private mainToken; // combines lp token and reward token from the previous task
    uint public rewardsFrequency; // how often are rewards generated

    struct User {
        uint lpBalance; // needs to count rewards
        uint availableBalance; // balance, available to withdraw
        uint lastStakeTimestamp; // timestamp, when user staked tokens last time
        uint reservedReward; // reward, creating by staking with old LP balance

        uint rewardsBalance; // balance of rewards tokens of user
        uint lastRewardsTime; // needs to recount rewardsBalance if lpBalance changes
    }

    mapping (address => User) private users; // information about users

    event StakeEv(
        address user,
        uint amount
    );

    event ClaimEv(
        address user,
        uint amount
    );

    event UnstakeEv(
        address user,
        uint amount,
        uint remains
    );

    constructor (uint _freezeTime, uint _rewardsPercent, uint _rewardsFrequency, address mainToken_) {
        mainToken = IERC20(mainToken_);
        owner = msg.sender;
        freezeTime = _freezeTime;
        rewardsPercent = _rewardsPercent;
        rewardsFrequency = _rewardsFrequency;
    }

    modifier requireOwner {
        require(msg.sender == owner, "Not an owner");
        _;
    }

    modifier requireDAO {
        require(msg.sender == daoContract, "Not a DAO");
        _;
    }

    modifier countBalances() {
        // adding reserved tokens to available balance
        if (block.timestamp - users[msg.sender].lastStakeTimestamp > freezeTime) {
            users[msg.sender].availableBalance = users[msg.sender].lpBalance;
        }
        // counting rewards tokens
        if (users[msg.sender].lastRewardsTime != 0) {
            uint rewardsPerCycle = users[msg.sender].lpBalance * rewardsPercent / 100;
            uint numberOfCycles = ((block.timestamp - users[msg.sender].lastRewardsTime) / rewardsFrequency);
            
            if (users[msg.sender].reservedReward != 0 && numberOfCycles > 0) {
                numberOfCycles -= 1;
                users[msg.sender].rewardsBalance += (rewardsPerCycle * numberOfCycles);
                users[msg.sender].rewardsBalance += users[msg.sender].reservedReward;
                users[msg.sender].reservedReward = 0;
            }
            else {
                users[msg.sender].rewardsBalance += (rewardsPerCycle * numberOfCycles);
            }
            
        }
        
        users[msg.sender].lastRewardsTime = block.timestamp;
        _;
    }

    // sends tokens to contract for staking
    function stake (uint _amount) external countBalances {
        require(_amount > 0, "You can't send 0 tokens");

        // counting rewards for old LP balance
        uint rewardsPerCycle = users[msg.sender].lpBalance * rewardsPercent / 100;
        users[msg.sender].reservedReward += rewardsPerCycle;

        // before it user should approve tokens to contract
        mainToken.transferFrom(msg.sender, address(this), _amount);
        users[msg.sender].lpBalance += _amount;
        users[msg.sender].lastStakeTimestamp = block.timestamp;
        
        emit StakeEv(msg.sender, _amount);
    }
   
    // sends reward tokens to user
    function claim () external countBalances {
        require(users[msg.sender].rewardsBalance > 0, "You haven't got reward tokens");
        mainToken.transfer(msg.sender, users[msg.sender].rewardsBalance);

        emit ClaimEv(msg.sender, users[msg.sender].rewardsBalance);
        users[msg.sender].rewardsBalance = 0;
    }

    // withdraw lp tokens
    function unstake () external countBalances {
        require(users[msg.sender].lpBalance > 0, "Nothing to unstake");
        require(users[msg.sender].availableBalance > 0, "You can't unstake staked tokens right now");

        mainToken.transfer(msg.sender, users[msg.sender].availableBalance);
        users[msg.sender].lpBalance -= users[msg.sender].availableBalance;

        emit UnstakeEv(
            msg.sender,
            users[msg.sender].availableBalance,
            users[msg.sender].lpBalance
        );

        users[msg.sender].availableBalance = 0;
    }

    // changes settings only by owner
    function changeSettings (uint _freezeTime, uint _rewardsPercent, uint _rewardsFrequency) external requireDAO {
        freezeTime = _freezeTime;
        rewardsPercent = _rewardsPercent;
        rewardsFrequency = _rewardsFrequency;
    }

    // info about this staking contract
    function stakingInfo () external view returns (uint, uint, uint) {
        return (freezeTime, rewardsPercent, rewardsFrequency);
    }

    // info about user
    function userInfo (address user) external view returns (uint, uint) {
        return (users[user].lpBalance, users[user].rewardsBalance);
    }

    // connects this contract to DAO Voting
    function connectDAO(address daoContract_) external requireOwner {
        require(!connected, "DAO already connected");
        daoContract = daoContract_;
        connected = true;
    }
}