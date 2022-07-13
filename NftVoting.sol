// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract FriendsLandVoting is ReentrancyGuard{
    using SafeERC20 for IERC20;

    // Interfaces for ERC20 and ERC721
    IERC20 public immutable rewardsToken;
    IERC721 public immutable nftCollection;

    uint votingPowerPerNFT = 100;
    uint votingPowerPerCoin = 10;

    // Constructor function to set the rewards token and the NFT collection addresses
    constructor(IERC721 _nftCollection, IERC20 _rewardsToken) {
        nftCollection = _nftCollection;
        rewardsToken = _rewardsToken;
    }

    struct Proposal{
        string proposalText;
        uint yesVotes;
        uint noVotes;
        address proposalCreator;
    }

    Proposal[] allProposals;

    mapping(address => uint[]) public hasVoted;
    function addProposal(string memory proposalText) public{
        require(getVotingPower() > 0);
        allProposals.push(Proposal(proposalText, 0, 0, msg.sender));
    }
    function getVotingPower() public view returns(uint){
        return ((rewardsToken.balanceOf(msg.sender) * votingPowerPerCoin)/10**18) + nftCollection.balanceOf(msg.sender) * votingPowerPerNFT;
    }
    function canVote(uint proposalIndex) public view returns(bool){
        for(uint i = 0; i < hasVoted[msg.sender].length; i++){
            if(hasVoted[msg.sender][i] == proposalIndex){
                return false;
            }
        }
        return true;
    }
    function castVote(bool vote, uint proposalIndex) public{
        require(canVote(proposalIndex));
        uint votingPower = getVotingPower();
        vote ? allProposals[proposalIndex].yesVotes += votingPower : allProposals[proposalIndex].noVotes += votingPower;
        hasVoted[msg.sender].push(proposalIndex);
    }
    function getAllProposals() external view returns(Proposal[] memory){
        Proposal[] memory _proposals = new Proposal[](allProposals.length);
        if(allProposals.length == 0){
            return new Proposal[](0);
        }
        for(uint i = 0; i < allProposals.length; i++){
            _proposals[i] = allProposals[i];
        }
        return _proposals;
    }
}