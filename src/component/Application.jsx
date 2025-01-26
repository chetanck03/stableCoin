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
      const tx = await contractInstance.issueBond(bondType);
      await tx.wait();
      alert("Bond issued successfully!");
      fetchBalances();
    } catch (err) {
      console.error("Error issuing bond:", err);
      setError("Failed to issue bond.");
    }
  };


  // Fetch market caps
  const fetchMarketCaps = async () => {
    try {
      const dpgMarketCap = await contractInstance.getDPGMarketCap();
      const daiMarketCap = await contractInstance.getDAIMarketCap();
      const dpbMarketCap = await contractInstance.getDPBMarketCap();

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
      Promise.all([fetchBalances(), fetchDaiPrice(), checkEpochComplete(), fetchMarketCaps()])
        .catch(console.error)
        .finally(() => setLoading(false));

      const intervalId = setInterval(() => {
        fetchBalances();
        fetchDaiPrice();
        checkEpochComplete();
        fetchMarketCaps();
      }, 10000);

      return () => clearInterval(intervalId);
    }
  }, [contractInstance]);

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <div className="mb-6 flex flex-col space-y-4">
        <h1 className="text-3xl font-extrabold">Pegbreaker Dashboard</h1>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Market Caps</h2>
            <ul>
              <li>DPG Market Cap: ${marketCaps.dpg}</li>
              <li>DAI Market Cap: ${marketCaps.dai}</li>
              <li>DPB Market Cap: ${marketCaps.dpb}</li>
            </ul>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Token Balances</h2>
            <ul>
              <li>DPG Token: {balances.dpg}</li>
              <li>DAI Token: {balances.dai}</li>
              <li>DPB Token: {balances.dpb}</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">DAI Price</h2>
          <p>{daiPrice ? `$${daiPrice}` : "Loading..."}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Stake DPG Tokens</h2>
          <input
            type="text"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="Enter amount to stake"
            className="border p-2 rounded w-full mb-4 text-white"
          />
          <button
            onClick={handleStake}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full"
          >
            Stake
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Mint DPG with DAI</h2>
          <input
            type="text"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
            placeholder="Enter amount to mint"
            className="border p-2 rounded w-full mb-4 text-white"
          />
          <button
            onClick={handleMintDPGWithDAI}
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 w-full"
          >
            Mint with DAI
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Burn DPG Tokens</h2>
          <input
            type="text"
            value={burnAmount}
            onChange={(e) => setBurnAmount(e.target.value)}
            placeholder="Enter amount to burn"
            className="border p-2 rounded w-full mb-4 text-white"
          />
          <button
            onClick={handleBurnDPG}
            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 w-full"
          >
            Burn DPG
          </button>
        </div>

        {/* Epoch Status */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Epoch Status</h2>
          <p>{epochComplete ? "Epoch is complete." : "Epoch is not completed."}</p>
        </div>
          {/* Bond Amount Input */}
       <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Issue Bond with DPG tokens</h2>
        
        {/* Bond Type Selection */}
        <select
          value={bondType}
          onChange={(e) => setBondType(e.target.value)}
          className="border p-2 rounded text-white bg-gray-800 w-full mb-2"
        >
          <option value="1">1-Year Bond (25% return)</option>
          <option value="2">2-Year Bond (60% return)</option>
        </select>

        <button
          onClick={handleIssueBond}
          className="bg-purple-500 text-white  w-full py-2 px-4 rounded hover:bg-purple-600"
        >
          Issue Bond
        </button>
      </div>
      </div>
    </div>
    
  );
};

export default Application;
