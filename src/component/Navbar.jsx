import React, { useState } from 'react';
import { useWeb3 } from "../providers/Web3Provider";

export default function Navbar() {
  const { selectedAccount, handleWallet, disconnectWallet } = useWeb3();
  const [isConnected, setIsConnected] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleButtonClick = () => {
    if (isConnected) {
      disconnectWallet();
      setIsConnected(false);
    } else {
      handleWallet();
      setIsConnected(true);
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className="bg-gray-800 py-4">
        <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-between">
          <h1 className="text-white text-3xl font-semibold">Pegbreaker</h1>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white md:hidden focus:outline-none"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Desktop Links */}
          <div className="space-x-6 hidden md:flex items-center">
            <a href="#" className="text-gray-400 hover:text-white">DPG Token</a>
            <a href="#" className="text-gray-400 hover:text-white">Stake</a>
            <a href="#" className="text-gray-400 hover:text-white">Bond</a>

            {/* Wallet Button for Desktop */}
            <div className="ml-4">
              {isConnected ? (
                <button
                  className={`px-4 py-2 rounded-md ${isConnected ? 'bg-red-600' : 'bg-blue-600'} text-white`}
                  onClick={handleButtonClick}
                >
                  {selectedAccount ? selectedAccount.slice(0, 6) + "..." + selectedAccount.slice(-4) : "Connected"}
                </button>
              ) : (
                <button
                  className="bg-blue-600 px-4 py-2 rounded-md text-white"
                  onClick={handleButtonClick}
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800 p-4 space-y-4">
          <a href="#" className="block text-gray-400 hover:text-white">DPG Token</a>
          <a href="#" className="block text-gray-400 hover:text-white">Stake</a>
          <a href="#" className="block text-gray-400 hover:text-white">Bond</a>

          {/* Wallet Connection Button in Mobile Menu */}
          <div className="mt-4">
            {isConnected ? (
              <button
                className={`w-full text-white px-4 py-2 rounded-md ${isConnected ? 'bg-red-600' : 'bg-blue-600'}`}
                onClick={handleButtonClick}
              >
                {selectedAccount ? selectedAccount.slice(0, 6) + "..." + selectedAccount.slice(-4) : "Connected"}
              </button>
            ) : (
              <button
                className="w-full text-white bg-blue-600 px-4 py-2 rounded-md"
                onClick={handleButtonClick}
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
