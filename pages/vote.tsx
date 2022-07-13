import { useEffect, useState } from "react";
import { BigNumber, BigNumberish, ethers } from "ethers";
import type { NextPage } from "next";

import {useContract, useAddress, useMetamask} from "@thirdweb-dev/react";
import { type } from "os";

const votingContractAddress = "0xBC298cf6C26bE40dF09cc8d7Bd27c56b1e71329B";
class Proposal{
    public proposalText: string;
    public yesVotes: string;
    public noVotes: string;
    constructor(proposalText: string, yesVotes: string, noVotes: string) {
        this.proposalText = proposalText;
        this.yesVotes = yesVotes;
        this.noVotes = noVotes;
    }
};
const Vote : NextPage = () =>{
    const address = useAddress();
    const connectWithMetamask = useMetamask();
    const { contract, isLoading } = useContract(votingContractAddress);
    const [votingPower, setVotingPower] = useState<BigNumber>();
    const [value, setValue] = useState('');
    const [proposals, setProposals] = useState<any[]>([]);
    
    useEffect(() => {
        if (!contract) return;
        async function loadVotingPower() {
            const cr = await contract?.call("getVotingPower", address);
            console.log("Loaded claimable rewards", cr);
            setVotingPower(cr);
          }
        loadVotingPower();
    }, [address, contract]);

    useEffect(() => {
        if (!contract) return;
        async function loadProposals() {
            const cr = await contract?.call("getAllProposals");
            const proposals : Proposal[] = await Promise.all(
                cr?.map(
                  async (proposal: { proposalText: string, yesVotes: BigNumberish, noVotes: BigNumberish, }) => {
                    const newOne = new Proposal(proposal.proposalText, proposal.yesVotes.toString(), proposal.noVotes.toString());
                    return newOne;
                  }
                )
              );
            setProposals(proposals);
          }
        loadProposals();
    }, [address, contract]);

    async function submitAProposal(proposalText: string){
        await contract?.call("addProposal", proposalText);
    }

    async function canVoteOnAProposal(proposalIndex: number): Promise<boolean>{
        return await contract?.call("canVote", proposalIndex, address);
    }

    async function castVoteOnAProposal(proposalIndex: number, vote: boolean): Promise<boolean>{
        return await contract?.call("castVote", vote, proposalIndex);
    }
    return(
    <div className="bg-gradient-to-tr from-red-500 to-purple-400 relative h-screen v-screen">
        <div className= "flex flex-col">
            <div className="flex flex-col w-5/6 mx-auto text-center justify-start max-w-xl">
                <h1 className="font-primary font-extrabold text-white text-3xl sm:text-4xl md:text-5xl md:leading-snug">
                    Create Proposal for FriendsLand
                </h1>
                {!address ? (<button className="text-white bg-gradient-to-tr from-blue-400 to-red-600 hover:bg-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-300 font-bold rounded-full text-sm px-5 py-2.5 text-center mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900 mt-5" onClick={connectWithMetamask}>
                    Connect Metamask
                    </button>) : 
                    (<div>
                        <h1 className="font-primary text-lg sm:text-xl md:text-2xl md:leading-snug text-gray-200 mt-5">
                            Connected Wallet Address : {address}
                        </h1>
                        <h3 className="font-primary font-extrabold text-white text-xl sm:text-2xl md:text-3xl md:leading-snug">
                            Voting Power: {votingPower?.toString()}
                        </h3>
                        <input type="text" value={value} onChange={e=>setValue(e.currentTarget.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mt-3" placeholder="Making a dang NFT" required></input>
                        <button className="text-white bg-gradient-to-tr from-blue-400 to-red-600 hover:bg-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-300 font-bold rounded-full text-sm px-5 py-2.5 text-center mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900 mt-5" onClick={() => {submitAProposal(value);}}>
                        Submit a proposal
                        </button>
                        <h3 className="font-primary font-extrabold text-white text-xl sm:text-2xl md:text-3xl md:leading-snug">
                            All Proposals
                        </h3>
                        {proposals?.map((proposal, index) => 
                        (<div key = {index.toString()} >
                            <h2 className="font-primary text-gray-200 ">
                                {proposal.proposalText}
                            </h2>
                            <div className="flex flex-row justify-evenly">
                                <button className="text-white bg-gradient-to-tr from-blue-400 to-red-600  font-bold rounded-full text-sm text-center py-2 px-5" onClick={ async()=> {await canVoteOnAProposal(index) ? castVoteOnAProposal(index, true) : console.log("Vote Casted")}}>Yes</button>
                                <h2 className="font-primary text-gray-200 text-4xl">
                                    {proposal.yesVotes}
                                </h2>
                            </div>
                            <div className="flex flex-row justify-evenly mt-3">
                                <button className="text-white bg-gradient-to-tr from-blue-400 to-red-600  font-bold rounded-full text-sm text-center py-2 px-5" onClick={ async()=> {await canVoteOnAProposal(index) ? castVoteOnAProposal(index, false) : console.log("Vote Casted")}}>No</button>
                                <h2 className="font-primary text-gray-200 text-4xl">
                                    {proposal.noVotes}
                                </h2>
                            </div>
                        </div>))}
                    </div>
                    )}
            </div>
        </div>
    </div>);
}

export default Vote;