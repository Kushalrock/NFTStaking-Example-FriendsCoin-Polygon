import { useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";
import type { NextPage } from "next";

import {useContract, useAddress, useMetamask} from "@thirdweb-dev/react";

const votingContractAddress = "0xBC298cf6C26bE40dF09cc8d7Bd27c56b1e71329B";

const Vote : NextPage = () =>{
    const address = useAddress();
    const connectWithMetamask = useMetamask();
    const { contract, isLoading } = useContract(votingContractAddress);
    const [votingPower, setVotingPower] = useState<BigNumber>();
    useEffect(() => {
        if (!contract) return;
        async function loadVotingPower() {
            const cr = await contract?.call("getVotingPower", address);
            console.log("Loaded claimable rewards", cr);
            setVotingPower(cr);
          }
        loadVotingPower();
    }, [address, contract])
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
                    </div>
                    )}
            </div>
        </div>
    </div>);
}

export default Vote;