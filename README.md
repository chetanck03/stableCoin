# DPG Stablecoin Deployment on Holesky Testnet

This repository contains the smart contract for deploying stablecoins and governance tokens on the Holesky Testnet.

---

## Contract Addresses

1. **DPG Stablecoin**
   - Symbol: DPG
   - Address: `0xeFc08Bb8803DFDDAf0Eea1448Ef5D56e436Dd4D6`

2. **DAI Stablecoin**
   - Symbol: DAI
   - Address: `0x5e8feD018ad58c413E4C374D02Bf360195554EE9`

3. **DPB Governance Token**
   - Symbol: DPB
   - Address: `0xAA6ddB89021450227bf81d1c744E586Ae77e0A93`

4. **PriceFeed Contract**
   - Address: `0xE5eb6eeB23877366eA8600CB4c3aba8471e91f04`

---

## Contract Location

- **All Contracts**: Place all contract files in the `context` folder for better organization and clarity.

---

## Testing

To test the contracts, use Remix IDE on any testnet (such as Holesky Testnet):

1. Open [Remix IDE](https://remix.ethereum.org/).
2. Upload the contract files from the `context` folder.
3. Configure the Remix environment:
   - Select **Injected Provider** and connect to your wallet.
   - Ensure you are on the desired testnet (e.g., Holesky).
4. Deploy and interact with the contracts directly through the Remix interface.

---

## Contract Address

- **Main Contract**: `0xf0641d4B9a733908EA8Fe1e4d262e2dFf65FA194`

---

## Setup the Project

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd <project-directory>
   ```
3. Install dependencies:
   ```bash
   npm i
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## Notes

- Ensure all smart contracts are organized in the `context` folder for easy access.
- Use Remix IDE for deploying and testing contracts on any testnet (e.g., Holesky).
- Make sure to configure your wallet and environment correctly before interacting with the contracts.
