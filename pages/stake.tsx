import {
    ThirdwebNftMedia,
    useAddress,
    useMetamask,
    useNFTDrop,
    useToken,
    useTokenBalance,
    useOwnedNFTs,
    useContract,
  } from "@thirdweb-dev/react";
  import { BigNumber, ethers } from "ethers";
  import type { NextPage } from "next";
    import React from "react";
  import { useEffect, useState } from "react";
  
  const nftDropContractAddress = "0x98a5CF6F21B00898C97b9448869FB0d708cdE839";
  const tokenContractAddress = "0x20Efe24315bBC9C3F4Ccc1986F25f5a740D7557F";
  const stakingContractAddress = "0xAf3463968306Ba20aDB2e4d030619FD625bDC66B";
  
  const Stake: NextPage = () => {
    // Wallet Connection Hooks
    const address = useAddress();
    const connectWithMetamask = useMetamask();
  
    // Contract Hooks
    const nftDropContract = useNFTDrop(nftDropContractAddress);
    const tokenContract = useToken(tokenContractAddress);
  
    const { contract, isLoading } = useContract(stakingContractAddress);
  
    // Load Unstaked NFTs
    const { data: ownedNfts } = useOwnedNFTs(nftDropContract, address);
  
    // Load Balance of Token
    const { data: tokenBalance } = useTokenBalance(tokenContract, address);
  
    ///////////////////////////////////////////////////////////////////////////
    // Custom contract functions
    ///////////////////////////////////////////////////////////////////////////
    const [stakedNfts, setStakedNfts] = useState<any[]>([]);
    const [claimableRewards, setClaimableRewards] = useState<BigNumber>();
  
    useEffect(() => {
      if (!contract) return;
  
      async function loadStakedNfts() {
        const stakedTokens = await contract?.call("getStakedTokens", address);
  
        // For each staked token, fetch it from the sdk
        const stakedNfts = await Promise.all(
          stakedTokens?.map(
            async (stakedToken: { staker: string; tokenId: BigNumber }) => {
              const nft = await nftDropContract?.get(stakedToken.tokenId);
              return nft;
            }
          )
        );
  
        setStakedNfts(stakedNfts);
        console.log("setStakedNfts", stakedNfts);
      }
  
      if (address) {
        loadStakedNfts();
      }
    }, [address, contract, nftDropContract]);
  
    useEffect(() => {
      if (!contract || !address) return;
  
      async function loadClaimableRewards() {
        const cr = await contract?.call("availableRewards", address);
        console.log("Loaded claimable rewards", cr);
        setClaimableRewards(cr);
      }
  
      loadClaimableRewards();
    }, [address, contract]);
  
    ///////////////////////////////////////////////////////////////////////////
    // Write Functions
    ///////////////////////////////////////////////////////////////////////////
    async function stakeNft(id: BigNumber) {
      if (!address) return;
  
      const isApproved = await nftDropContract?.isApproved(
        address,
        stakingContractAddress
      );
      // If not approved, request approval
      if (!isApproved) {
        await nftDropContract?.setApprovalForAll(stakingContractAddress, true);
      }
      const stake = await contract?.call("stake", id);
    }
  
    async function withdraw(id: BigNumber) {
      const withdraw = await contract?.call("withdraw", id);
    }
  
    async function claimRewards() {
      const claim = await contract?.call("claimRewards");
    }
  
    if (isLoading) {
      return <div>Loading</div>;
    }
  
    return (
        <div className="bg-gradient-to-tr from-red-500 to-purple-400">
            <div className= "flex flex-col">
                <div className="flex flex-col w-5/6 mx-auto text-center justify-start max-w-xl">
                <h1 className="font-primary font-extrabold text-white text-3xl sm:text-4xl md:text-5xl md:leading-snug">
                    Stake your Friends NFT
                </h1>
                <h1 className="font-primary text-xl sm:text-2xl md:text-3xl md:leading-snug text-gray-200">
                    Get Friends Coin as staking rewards
                </h1>
                {!address ? (<button className="text-white bg-gradient-to-tr from-blue-400 to-red-600 hover:bg-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-300 font-bold rounded-full text-sm px-5 py-2.5 text-center mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900 mt-5" onClick={connectWithMetamask}>
                    Connect Metamask
                    </button>) : 
                    (<div>
                        <h1 className="font-primary text-lg sm:text-xl md:text-2xl md:leading-snug text-gray-200 mt-5">
                            Connected Wallet Address : {address}
                        </h1>
                    </div>
                    )}
                </div>
                <div className="flex flex-col mt-3 px-2 mx-auto">
                    <div className="flex flex-row justify-around mt-3">
                        <h1 className="font-primary font-bold text-white text-2xl sm:text-3xl md:text-4xl md:leading-snug">
                        Claimable Rewards {!claimableRewards
                        ? "Loading..."
                        : ethers.utils.formatUnits(claimableRewards, 18)} {tokenBalance?.symbol}
                        </h1>
                        <h1 className="font-primary font-bold text-white text-2xl sm:text-3xl md:text-4xl md:leading-snug px-6">
                        Token Bal {!tokenBalance
                        ? "Loading..."
                        : tokenBalance.displayValue} {tokenBalance?.symbol}
                        </h1>
                    </div>
                    <div className="flex flex-row justify-center"><button className="text-white bg-gradient-to-tr from-blue-400 to-red-600  font-bold rounded-full text-sm text-center py-2 px-2" onClick={claimRewards}>Claim Rewards</button></div>
                </div>
                <div className="flex flex-col justify-start mt-3 px-2">
                    <h1 className="font-primary font-bold text-white text-2xl sm:text-3xl md:text-4xl md:leading-snug">
                        Your Unstaked NFTs
                    </h1>
                    <div className="flex flex-row justify-start mt-3">
                        {ownedNfts?.map((nft) => 
                        (
                            <div key = {nft.metadata.id.toString()} className="flex flex-col">
                                <ThirdwebNftMedia metadata={nft.metadata} className="max-w-48 max-h-48"/>
                                <h2 className="text-white font-normal text-center text-lg">{nft.metadata.name}</h2>
                                <div className="justify-center items-center flex-row flex mt-2">
                                    <button className="text-white bg-gradient-to-tr from-blue-400 to-red-600  font-bold rounded-full text-sm text-center py-2 px-2" onClick={() => stakeNft(nft.metadata.id)}>
                                        Stake NFT
                                    </button>
                                </div>
                            </div>
                        )
                        )}
                    </div>
                </div>
                
                <div className="flex flex-col justify-start mt-3 px-2">
                    <h1 className="font-primary font-bold text-white text-2xl sm:text-3xl md:text-4xl md:leading-snug">
                        Your Staked NFTs
                    </h1>
                    <div className="flex flex-row justify-start mt-3">
                        {stakedNfts?.map((nft) => 
                        (
                            <div key = {nft.metadata.id.toString()} className="flex flex-col px-3">
                                <ThirdwebNftMedia metadata={nft.metadata} className="max-w-48 max-h-48"/>
                                <h2 className="text-white font-normal text-center text-lg">{nft.metadata.name}</h2>
                                <div className="justify-center items-center flex-row flex mt-2">
                                    <button className="text-white bg-gradient-to-tr from-blue-400 to-red-600  font-bold rounded-full text-sm text-center py-2 px-2" onClick={() => withdraw(nft.metadata.id)}>
                                        Withdraw
                                    </button>
                                </div>
                            </div>
                        )
                        )}
                    </div>
                </div>
          </div>
        </div>
      )
  };
  
  export default Stake;