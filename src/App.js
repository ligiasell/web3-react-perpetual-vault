import { ethers } from "ethers";
import { useState } from "react";

import donationLogo from "./assets/donation.png";
import imageBackground from "./assets/hands.jpg";

import "./App.css";
import contractABI from "./GiveForeverABI.json";

const contractAddress = "0x843C1cE2d0fAEe726A33ad13520609D55612f381";
const provider = new ethers.BrowserProvider(window.ethereum); // Provided by Metamask
let signer;
let contract;

function App() {
  const [userAmount, setUserAmount] = useState(0);
  const [donated, setDonated] = useState(0);
  const [connectionStatus, setConnection] = useState("Not Connected");

  const handleInput = (event) => {
    setUserAmount(event.target.value);
  };

  const connect = async () => {
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, contractABI, signer);

    const userAddress = await signer.getAddress();
    const networkData = await provider.getNetwork();
    let networkName = "unknown";
    if (networkData) networkName = networkData.name;
    setConnection(`Connected to ${networkName} ${userAddress}`);
    updateBalances();
  };

  const deposit = async () => {
    try {
      const weiAmount = ethers.parseEther(userAmount);
      const tx = await contract.deposit({ value: weiAmount });
      await tx.wait();
      updateBalances();
    } catch (error) {
      setUserAmount(0);
      if (error.code === 4001) {
        alert("Transaction was rejected by the user.");
      } else {
        console.error("An error occurred during the transaction:", error);
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  const updateBalances = async () => {
    const donated = await contract.donated();
    setDonated(ethers.formatEther(donated));
    setUserAmount(0);
  };

  return (
    <main className="App">
      <div>
        <header className="App-header">
          <h1>
            <span className="Text-blue">Give</span>Forever
          </h1>
          <h2>A perpetual vault for charity donation</h2>
        </header>
        <img
          src={imageBackground}
          alt="Two hands giving the idea of donation"
          className="Image-background"
        />
      </div>
      <section className="App-content">
        <div className="App-balances">
          <img src={donationLogo} alt="" className="Image-donation" />
          <div className="App-balances-texts">
            <p>Donated:</p>
            <p>
              {donated} <span className="App-balances-eth">ETH</span>
            </p>
          </div>
        </div>
        <div className="App-buttons-box">
          <button type="button" onClick={connect} className="Button-secondary">
            Connect Wallet
          </button>
          <p className="App-connection">{connectionStatus}</p>
          <input
            type="text"
            id="deposit-amount"
            placeholder="ETH"
            onChange={handleInput}
            value={userAmount}
          />
          <button
            type="button"
            onClick={deposit}
            disabled={userAmount === 0}
            className="Button-primary"
          >
            Donate
          </button>
        </div>
        <div className="App-contract">
          Contract{" "}
          <a
            href={`https://etherscan.io/address/${contractAddress}`}
            target="_blank"
            rel="noreferrer"
          >
            {contractAddress}
          </a>
        </div>
      </section>
    </main>
  );
}

export default App;
