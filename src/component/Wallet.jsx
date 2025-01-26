import React, { useState, useEffect } from "react";
import { useWeb3 } from "../providers/Web3Provider";
import { ethers } from "ethers";

const WalletComponent = () => {
  const { selectedAccount, chainId, handleWallet, disconnectWallet } = useWeb3();
  const [balance, setBalance] = useState(null);
  const [chainName, setChainName] = useState("");

  useEffect(() => {
    const fetchBalanceAndChainName = async () => {
      if (selectedAccount) {
        const provider = new ethers.BrowserProvider(window.ethereum);

        const balanceWei = await provider.getBalance(selectedAccount);
        const balanceEth = ethers.formatEther(balanceWei);
        setBalance(parseFloat(balanceEth).toFixed(4)); // Display 4 decimal places

        switch (chainId) {
          case 1:
            setChainName("Ethereum Mainnet");
            break;
          case 5:
            setChainName("Goerli Testnet");
            break;
          case 137:
            setChainName("Polygon Mainnet");
            break;
          case 80001:
            setChainName("Mumbai Testnet");
            break;
          case 17000:
            setChainName("ETH Holysky Testnet");
            break;
          case 11155111:
            setChainName("ETH Sepolia Testnet");
            break;
          default:
            setChainName("Unknown Network");
            break;
        }
      }
    };

    fetchBalanceAndChainName();
  }, [selectedAccount, chainId]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
     

      {/* Main Wallet Component */}
      <div className="flex flex-col items-center justify-center flex-1 p-6">
        <div className="w-full max-w-md p-6 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
          {selectedAccount ? (
            <>
              <h2 className="text-3xl font-semibold text-center text-white mb-4">Wallet Connected</h2>
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <p className="text-sm font-medium text-gray-400">Account Address:</p>
                  <p className="text-sm text-white break-all">{selectedAccount}</p>
                </div>

                <div className="border-b pb-3">
                  <p className="text-sm font-medium text-gray-400">Balance:</p>
                  <p className="text-sm text-white">{balance ? `${balance} ETH` : "Loading..."}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-400">Network:</p>
                  <p className="text-sm text-white">{chainName}</p>
                </div>
              </div>

              <button
                onClick={disconnectWallet}
                className="mt-6 w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
              >
                Disconnect Wallet
              </button>
            </>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-6">Connect your wallet to get started</p>
              <button
                onClick={handleWallet}
                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
              >
                Connect Wallet
              </button>
            </div>
          )}
        </div>
      </div>

    
    </div>
  );
};

export default WalletComponent;
