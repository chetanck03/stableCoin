import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../providers/Web3Provider";

const Application = () => {
  const { contractInstance, selectedAccount } = useWeb3();

  const [daiPrice, setDaiPrice] = useState(null);
  const [balances, setBalances] = useState({ dpg: 0, dai: 0, dpb: 0 });
  const [marketCaps, setMarketCaps] = useState({ dpg: 0, dai: 0, dpb: 0 });
  const [stakeAmount, setStakeAmount] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [burnAmount, setBurnAmount] = useState("");
  const [epochComplete, setEpochComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bondType, setBondType] = useState("1"); 

  // Fetch token balances
  const fetchBalances = async () => {
    try {
      const balances = await contractInstance.getTokenBalances(selectedAccount);
      const [dpgBalance, daiBalance, dpbBalance] = balances;
      setBalances({
        dpg: ethers.formatEther(dpgBalance),
        dai: ethers.formatEther(daiBalance),
        dpb: ethers.formatEther(dpbBalance),
      });
    } catch (err) {
      console.error("Error fetching balances:", err);
      setError("Failed to fetch token balances.");
    }
  };

  // Fetch DAI price
  const fetchDaiPrice = async () => {
    try {
      const price = await contractInstance.getDAIPrice();
      setDaiPrice(ethers.formatUnits(price, 8));
    } catch (err) {
      console.error("Error fetching DAI price:", err);
      setError("Failed to fetch DAI price.");
    }
  };

  // Check epoch completion
  const checkEpochComplete = async () => {
    try {
      const isComplete = await contractInstance.isEpochComplete();
      setEpochComplete(isComplete);
    } catch (err) {
      console.error("Error checking epoch status:", err);
      setError("Failed to check epoch status.");
    }
  };

  // Handle staking tokens
  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      alert("Please enter a valid stake amount.");
      return;
    }
    try {
      const amountInWei = ethers.parseEther(stakeAmount);
      const tx = await contractInstance.stakeDPG(amountInWei);
      await tx.wait();
      alert("Stake successful!");
      fetchBalances();
    } catch (err) {
      console.error("Error staking tokens:", err);
      setError("Failed to stake tokens.");
    }
  };

  // Handle minting with DAI
  const handleMintDPGWithDAI = async () => {
    if (!mintAmount || parseFloat(mintAmount) <= 0) {
      alert("Please enter a valid mint amount.");
      return;
    }
    try {
      const amountInWei = ethers.parseEther(mintAmount);
      const tx = await contractInstance.mintDPGWithDAI(amountInWei);
      await tx.wait();
      alert("Mint with DAI successful!");
      fetchBalances();
    } catch (err) {
      console.error("Error minting with DAI:", err);
      setError("Failed to mint with DAI.");
    }
  };

  // Handle burning DPG tokens
  const handleBurnDPG = async () => {
    if (!burnAmount || parseFloat(burnAmount) <= 0) {
      alert("Please enter a valid burn amount.");
      return;
    }
    try {
      const amountInWei = ethers.parseEther(burnAmount);
      const tx = await contractInstance.burnDPG(amountInWei);
      await tx.wait();
      alert("Burn DPG successful!");
      fetchBalances();
    } catch (err) {
      console.error("Error burning DPG:", err);
      setError("Failed to burn DPG.");
    }
  };
    // Handle issue bond functionality
    const handleIssueBond = async () => {
      
      try {
        const tx = await contractInstance.issueBond(bondType); // Assuming issueBond is a function in your contract
        await tx.wait();
        alert("Bond issued successfully!");
        fetchBalances();
      } catch (err) {
        console.error("Error issuing bond:", err);
        setError("Failed to issue bond.");
      }
    };

  // Handle minting with ETH
  const handleMintDPGWithETH = async () => {
    if (!mintAmount || parseFloat(mintAmount) <= 0) {
      alert("Please enter a valid mint amount.");
      return;
    }
    try {
      const amountInWei = ethers.parseEther(mintAmount);
      console.log("Mint Amount in Wei:", amountInWei.toString());

      const tx = await contractInstance.mintDPGWithETH({ value: amountInWei });
      await tx.wait();
      alert("Mint with ETH successful!");
      fetchBalances();
    } catch (err) {
      console.error("Error minting with ETH:", err);
      setError("Failed to mint with ETH.");
    }
  };

  // Fetch market caps
  const fetchMarketCaps = async () => {
    try {
      // Fetch market caps for each token separately
      const dpgMarketCap = await contractInstance.getDPGMarketCap();  // Assuming there's a function for DPG
      const daiMarketCap = await contractInstance.getDAIMarketCap();  // Assuming there's a function for DAI
      const dpbMarketCap = await contractInstance.getDPBMarketCap();  // Assuming the function name is correct
  
  
      // Format the market caps correctly using ethers.formatUnits
      setMarketCaps({
        dpg: ethers.formatUnits(dpgMarketCap, 18),
        dai: ethers.formatUnits(daiMarketCap, 18),
        dpb: ethers.formatUnits(dpbMarketCap, 18),
      });
    } catch (err) {
      console.error("Error fetching market caps:", err);
      setError("Failed to fetch market caps.");
    }
  };
  

  // Initial fetch and auto-refresh
  useEffect(() => {
    if (contractInstance) {
      setLoading(true);
      Promise.all([fetchBalances(), fetchDaiPrice(), checkEpochComplete(),fetchMarketCaps()])
        .catch(console.error)
        .finally(() => setLoading(false));

      // Auto-refresh every 10 seconds
      const intervalId = setInterval(() => {
        fetchBalances();
        fetchDaiPrice();
        checkEpochComplete();
        fetchMarketCaps()
      }, 10000);

      return () => clearInterval(intervalId);
    }
  }, [contractInstance]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Market Caps</h2>
        <ul className="list-disc list-inside">
          <li>DPG Market Cap: ${marketCaps.dpg}</li>
          <li>DAI Market Cap: ${marketCaps.dai}</li>
          <li>DPB Market Cap: ${marketCaps.dpb}</li>
        </ul>
      </div>
      <h1 className="text-2xl font-bold mb-4">Pegbreaker Dashboard</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Token Balances */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Token Balances in Account: </h2>
        <ul className="list-disc list-inside">
          <li>DPG Token: {balances.dpg}</li>
          <li>DAI Token: {balances.dai}</li>
          <li>DPB Token: {balances.dpb}</li>
        </ul>
      </div>

      {/* DAI Price */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">DAI Price</h2>
        <p>{daiPrice ? `$${daiPrice}` : "Loading..."}</p>
      </div>

      {/* Stake Tokens */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Stake Tokens DPG</h2>
        <input
          type="text"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          placeholder="Enter amount to stake"
          className="border p-2 rounded w-full mb-2"
        />
        <button
          onClick={handleStake}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Stake
        </button>
      </div>

       {/* Bond Amount Input */}
       <div className="mb-6">
        <h2 className="text-xl font-semibold">Issue Bond with DPG tokens</h2>
        
        {/* Bond Type Selection */}
        <select
          value={bondType}
          onChange={(e) => setBondType(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        >
          <option value="1">1-Year Bond (25% return)</option>
          <option value="2">2-Year Bond (60% return)</option>
        </select>

        <button
          onClick={handleIssueBond}
          className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600"
        >
          Issue Bond
        </button>
      </div>
      {/* Mint with DAI */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">DAI Tokens converts DPG Tokens</h2>
        <input
          type="text"
          value={mintAmount}
          onChange={(e) => setMintAmount(e.target.value)}
          placeholder="Enter amount to mint"
          className="border p-2 rounded w-full mb-2"
        />
        <button
          onClick={handleMintDPGWithDAI}
          className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
        >
          Mint with DAI
        </button>
      </div>

      {/* Burn DPG */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">DPG Tokens converts DAI Tokens</h2>
        <input
          type="text"
          value={burnAmount}
          onChange={(e) => setBurnAmount(e.target.value)}
          placeholder="Enter amount to burn"
          className="border p-2 rounded w-full mb-2"
        />
        <button
          onClick={handleBurnDPG}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Burn DPG
        </button>
      </div>

      {/* Mint with ETH */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Mint DPG with ETH</h2>
        <input
          type="text"
          value={mintAmount}
          onChange={(e) => setMintAmount(e.target.value)}
          placeholder="Enter amount to mint"
          className="border p-2 rounded w-full mb-2"
        />
        <button
          onClick={handleMintDPGWithETH}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          Mint with ETH
        </button>
      </div>

      {/* Epoch Status */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Epoch Status</h2>
        <p>{epochComplete ? "Epoch is complete." : "Epoch is not completed."}</p>
      </div>
    </div>
  );
};

export default Application;
