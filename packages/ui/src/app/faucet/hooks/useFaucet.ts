import { useState, useEffect } from "react";
import { PublicKey, Connection, Keypair, clusterApiUrl, Cluster } from "@solana/web3.js";
import { 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccount, 
  mintTo 
} from "@solana/spl-token";
import { toast } from "react-toastify";

// Get mint authority key from environment variable
const getMintAuthorityKey = () => {
  return new Uint8Array(
    process.env.NEXT_PUBLIC_MINT_AUTHORITY_KEY!.split(',').map(num => parseInt(num.trim(), 10))
  );
};

// Get token mint address from environment variable with fallback
const getTokenMintAddress = () => {
  return process.env.NEXT_PUBLIC_TOKEN_MINT_ADDRESS || "3JVVADC6XJ9ddr5mRir9wKfT8cmxisRy8R31vGcGHTDQ";
};

// Get connection based on network
const getConnection = (network: string) => {
  return new Connection(clusterApiUrl(network as Cluster), "confirmed");
};

export const useFaucet = () => {
  const [amount, setAmount] = useState<string>("");
  const [network, setNetwork] = useState<string>("devnet");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tokenMint, setTokenMint] = useState<PublicKey | null>(null);

  // Initialize token mint
  useEffect(() => {
    try {
      // Use the fixed token mint address
      const mintPubkey = new PublicKey(getTokenMintAddress());
      console.log("Using fixed token mint:", mintPubkey.toBase58());
      setTokenMint(mintPubkey);
    } catch (error) {
      console.error("Error initializing token mint:", error);
      toast.error(`Error with token mint: ${error instanceof Error ? error.message : "Unknown error"}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [network]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };
  
  const handleNetworkChange = (value: string) => {
    setNetwork(value);
  };

  const mintTokens = async (recipientPublicKey: PublicKey) => {
    if (!recipientPublicKey || !tokenMint) return;
    
    try {
      setIsLoading(true);
      const connection = getConnection(network);
      
      // Use mint authority keypair
      const mintAuthority = Keypair.fromSecretKey(getMintAuthorityKey());
      
      // Get or create associated token account for the user
      const associatedTokenAddress = await getAssociatedTokenAddress(
        tokenMint,
        recipientPublicKey
      );
      
      // Check if the token account exists
      const tokenAccountInfo = await connection.getAccountInfo(associatedTokenAddress);
      
      // If the token account doesn't exist, create it
      if (!tokenAccountInfo) {
        console.log("Creating token account for user...");
        const createAtaTx = await createAssociatedTokenAccount(
          connection,
          mintAuthority,
          tokenMint,
          recipientPublicKey
        );
        console.log("Created associated token account:", createAtaTx);
      }
      
      // Mint tokens to the user's associated token account
      const amountToMint = parseFloat(amount) * 10**6; // Convert to token units (6 decimals for USDC)
      console.log(`Minting ${amount} tokens to ${associatedTokenAddress.toBase58()}...`);
      
      const mintTx = await mintTo(
        connection,
        mintAuthority,
        tokenMint,
        associatedTokenAddress,
        mintAuthority.publicKey,
        Math.floor(amountToMint)
      );
      
      console.log("Minted tokens:", mintTx);
      toast.success(`${amount} test USDC has been minted to your wallet`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Reset amount after successful mint
      setAmount("");
    } catch (error) {
      console.error("Error minting tokens:", error);
      toast.error(`Error minting tokens: ${error instanceof Error ? error.message : "Unknown error"}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = !amount || parseFloat(amount) <= 0 || isLoading;

  return {
    amount,
    network,
    isLoading,
    tokenMint,
    isButtonDisabled,
    handleAmountChange,
    handleNetworkChange,
    mintTokens
  };
}; 