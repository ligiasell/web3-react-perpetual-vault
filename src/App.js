import { ethers } from "ethers";
import { useState } from "react";

import "./App.css";
import contractABI from "./GiveForeverABI.json";

const contractAddress = "0x843C1cE2d0fAEe726A33ad13520609D55612f381";
const provider = new ethers.BrowserProvider(window.ethereum); // Provided by Metamask
let signer;
let contract;

function App() {
  const [userAmount, setUserAmount] = useState(0);
  const [donated, setDonated] = useState(0);
  const [lidoBalance, setLidoBalance] = useState(0);
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
    const lidoBalance = await contract.lidoBalance();
    setLidoBalance(ethers.formatEther(lidoBalance));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>
          <span className="blue">Give</span>Forever
        </h1>
        <p>A perpetual vault for charity donation</p>
        <div className="App-body">
          <div className="App-balances">
            Donated: {donated} ETH
            <br />
            Balance: {lidoBalance} ETH
            <br />
          </div>
          <div className="App-button-box">
            <div className="App-connection">{connectionStatus}</div>
            <button onClick={connect}>CONNECT</button>
          </div>
          <div className="App-button-box">
            <input
              type="text"
              id="deposit-amount"
              placeholder="ETH"
              onChange={handleInput}
              value={userAmount}
            />
            <br />
            <button onClick={deposit} disabled={userAmount === 0}>
              DEPOSIT
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
        </div>
      </header>
    </div>
  );
}

export default App;
