import { useEffect, useState, createContext, useContext } from "react";
import { getWeb3State } from "../providers/getWeb3State";
import React from "react";


const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

const Web3Provider = ({ children }) => {
  const [web3State, setWeb3State] = useState({
    contractInstance: null,
    selectedAccount: localStorage.getItem("selectedAccount") || null,
    chainId: localStorage.getItem("chainId") ? parseInt(localStorage.getItem("chainId")) : null,
  });

  const handleWallet = async () => {
    if (!window.ethereum) {
      return;
    }
    try {
      const { contractInstance, selectedAccount, chainId } = await getWeb3State();
      setWeb3State({ contractInstance, selectedAccount, chainId });
      console.log("contractInstance, selectedAccount, chainId :",contractInstance, selectedAccount, chainId )

      // Persist account and chainId
      localStorage.setItem("selectedAccount", selectedAccount);
      localStorage.setItem("chainId", chainId);

    } catch (error) {
      console.log("MetaMask connection failed:", error);
    }
  };

  const disconnectWallet = () => {
    setWeb3State({
      contractInstance: null,
      selectedAccount: null,
      chainId: null,
    });

    localStorage.removeItem("selectedAccount");
    localStorage.removeItem("chainId");

  };

  const handleAccountChange = (accounts) => {
    const selectedAccount = accounts[0];
    setWeb3State((prevState) => ({
      ...prevState,
      selectedAccount,
    }));
    localStorage.setItem("selectedAccount", selectedAccount);
  };

  const handleChainChange = (chainIdHex) => {
    const chainId = parseInt(chainIdHex, 16);
    setWeb3State((prevState) => ({
      ...prevState,
      chainId,
    }));
    localStorage.setItem("chainId", chainId);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountChange);
      window.ethereum.on("chainChanged", handleChainChange);
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountChange);
        window.ethereum.removeListener("chainChanged", handleChainChange);
      };
    }
  }, []);

  return (
    <Web3Context.Provider value={{ ...web3State, handleWallet, disconnectWallet }}>
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Provider;