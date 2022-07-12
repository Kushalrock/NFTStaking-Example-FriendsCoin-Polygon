import { useAddress, useMetamask, useNFTDrop } from "@thirdweb-dev/react";
import type { NextPage } from "next";
import { useRouter } from "next/router";

const Mint: NextPage = () => {
  const router = useRouter();
  // Get the currently connected wallet's address
  const address = useAddress();

  // Function to connect to the user's Metamask wallet
  const connectWithMetamask = useMetamask();

  // Get the NFT Collection contract
  const nftDropContract = useNFTDrop(
    "0x98a5CF6F21B00898C97b9448869FB0d708cdE839"
  );

  async function claimNft() {
    try {
      const tx = await nftDropContract?.claim(1);
      console.log(tx);
      alert("NFT Claimed!");
      router.push(`/stake`);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  }

  return (
    <div>
      <h1 className="text-xl">Mint An NFT!</h1>

      <p>
        Here is where we use our <b>NFT Drop</b> contract to allow users to mint
        one of the NFTs that we lazy minted.
      </p>
      <hr />

      {!address ? (
        <button
          
          onClick={connectWithMetamask}
        >
          Connect Wallet
        </button>
      ) : (
        <button
          
          onClick={() => claimNft()}
        >
          Claim An NFT
        </button>
      )}
    </div>
  );
};

export default Mint;