//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./interfaces/IERC20.sol";

contract DAOVoting {
    address public _chairPerson; // address of user, who has a possibility to create new proposals
    IERC20 public _voteToken; // token for votings

    uint256 public minimumQuorum; // minimum number of votes for voting
    uint256 public debatingPeriodDuration; // time for which users should vote

    uint256 private proposalId; // variable for creating new proposal ID
    
    struct User {
        uint256 balance; // balance of this user
        mapping(uint256 => uint256) delegatedVotes; // proposalId => amount
        
        uint256 [] userProposals; // I used array, because with mapping we can't understand in which votings user participated
    }

    struct Proposal {
        bytes callData; // calldata of this proposal
        address recipient; // contract, which will be called after finishing voting
        string description; // description of this proposal
        uint256 creationTime; // creation time of this proposal

        uint256 positive; // number of votes for this proposal
        uint256 negative; // number of votes against this proposal
        bool ended; // is voting for this proposal ended or not
    }

    mapping(address => User) private users;
    mapping(uint256 => Proposal) private proposals;

    event ProposalAdded(
        uint256 proposalId, 
        string description,
        bytes callData);
    
    event ProposalFinished(
        uint256 proposalId,
        bool votingResult,
        bool callingResult
    );

    constructor(address chairPerson_, address voteToken_, uint256 minimumQuorum_, uint256 debatingPeriodDuration_) {
        _chairPerson = chairPerson_;
        _voteToken = IERC20(voteToken_);
        minimumQuorum = minimumQuorum_;
        debatingPeriodDuration = debatingPeriodDuration_;
    }

    modifier requireChairPerson {
        require(msg.sender == _chairPerson, "Not a chairperson");
        _;
    }

    modifier requireDAOVoting {
        require(msg.sender == address(this), "Function can't be called by user");
        _;
    }

    // function for adding voting tokens to the contract (before calling this function you should approve your tokens to contract)
    function deposit(uint256 amount_) external {
        _voteToken.transferFrom(msg.sender, address(this), amount_);
        users[msg.sender].balance += amount_;
    }

    // delegate your vote to another user
    function delegateVote(address user_, uint256 proposalId_) external {
        require(!voted(user_, proposalId_), "This user have already voted");
        require(msg.sender != user_, "You can't delegate tokens to yourself");
        require(!voted(msg.sender, proposalId_), "You have already voted");
        require(users[msg.sender].balance > 0, "You haven't got vote tokens");

        users[msg.sender].userProposals.push(proposalId_);
        users[user_].delegatedVotes[proposalId_] += users[msg.sender].balance;
    }

    // adds new proposal (can be called only by chairperson)
    function addProposal(address recipient_, bytes memory callData_, string memory description_) external requireChairPerson {
        proposals[proposalId] = Proposal(callData_, recipient_, description_, block.timestamp, 0,0, false);
        
        emit ProposalAdded(proposalId, description_, callData_);
        proposalId++;
    }

    // function for voting for or against a proposal
    function vote(uint256 proposalId_, bool choice_) external {
        require(block.timestamp - proposals[proposalId_].creationTime < debatingPeriodDuration, "Too late");
        require(users[msg.sender].balance > 0 || users[msg.sender].delegatedVotes[proposalId_] > 0, "You haven't got vote tokens");
        require(!voted(msg.sender, proposalId_), "You have already voted");
        if(choice_){
            proposals[proposalId_].positive += users[msg.sender].balance += users[msg.sender].delegatedVotes[proposalId_];
        }
        else {
            proposals[proposalId_].negative += users[msg.sender].balance += users[msg.sender].delegatedVotes[proposalId_];
        }

        users[msg.sender].userProposals.push(proposalId_);
    }

    // addition to the voting function
    function voted(address user_, uint256 proposalId_) internal view returns (bool) {
        for(uint i=0; i < users[user_].userProposals.length; ++i) {
            if(users[user_].userProposals[i] == proposalId_){
                return true;
            }
        }
        return false;
    }

    // finishes voting 
    function finishProposal(uint proposalId_) external {
        require(block.timestamp - proposals[proposalId_].creationTime > debatingPeriodDuration, "Too early");
        proposals[proposalId_].ended = true;

        if(proposals[proposalId_].positive > proposals[proposalId_].negative && proposals[proposalId_].positive > minimumQuorum) {
            (bool success, ) =  proposals[proposalId_].recipient.call(proposals[proposalId_].callData);
            emit ProposalFinished(proposalId_, true, success);
        }
        else {
            emit ProposalFinished(proposalId_, false, false);
        }
    }

    // withdraws your tokens
    function withdraw(uint256 amount_) external {
        require(users[msg.sender].balance >= amount_, "You have not enough tokens");
        require(!activeVotingsExists(msg.sender), "You are taking part in the voting");
        
        users[msg.sender].balance -= amount_;
        _voteToken.transfer(msg.sender, amount_);
        
        delete users[msg.sender].userProposals;
    }

    // addition to withdrawing function
    function activeVotingsExists(address user_) internal view returns (bool) {
        for(uint i=0; i < users[user_].userProposals.length; ++i) {
            if(!proposals[users[user_].userProposals[i]].ended) {
                return true;
            }
        }
        return false;
    }

    // changes settings of voting contract (can be called only after voting)
    function changeSettings(uint256 minimumQuorum_, uint256 debatingPeriodDuration_) external requireDAOVoting {
        minimumQuorum = minimumQuorum_;
        debatingPeriodDuration = debatingPeriodDuration_;
    }

    // returns information about specific voting
    function votingInfo(uint256 proposalId_) external view returns (string memory, uint256, uint256, bool) {
        return (proposals[proposalId_].description, 
                proposals[proposalId_].positive,
                proposals[proposalId_].negative,
                proposals[proposalId_].ended);
    }

    // returns token balance of selected user
    function balanceOf(address user_) external view returns (uint256) {
        return users[user_].balance;        
    }

    // returns contract settings
    function settingsInfo() external view returns (uint256, uint256) {
        return (minimumQuorum, debatingPeriodDuration);
    }
}