import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";
import myNFTCollection from "./utils/MyNFTCollection.json";
import './styles/App.css';
import openseaLogo from './assets/opensea-seeklogo.com.svg';
import twitterLogo from './assets/twitter-logo.svg';

const TWITTER_HANDLE = 'gsrb_';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/bigdawgselects';

const CONTRACT_ADDRESS = "0x08C7898601E4FCd11b2D6310861e17240fad5Dd0";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts'});

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      setupEventListener()
    } else {
      console.log("No authorized account found")
    }
  }

  const connectWallet = async () => {
    try{
      const { ethereum } = window;

      if (!ethereum) {
        alert("You need MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts'});

      console.log("Connected", accounts[0]);
      setCurrentAccount(account[0]);

      setupEventListener() 
    } catch (error) {
      console.log(error);
    }
  }

  // listens to emitted NewNFTMinted event from contract
  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myNFTCollection.abi, signer);

        connectedContract.on("NewNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Your NFT was minted and sent to your wallet. Please wait ~10 minutes to appear on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // calls makeAnNFT function from contract
  const askContractToMintNFT = async () => { 
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myNFTCollection.abi, signer);

        
        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnNFT();

        console.log("Mining... please wait.")
        alert("Mining... please wait.")
        await nftTxn.wait();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
      alert("Transaction was reverted.")
    }
  }

  // switches to Rinkeby network if user is not already connected
  const switchToRinkeby = async () => {
    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Connected to chain " + chainId);

    const rinkebyChainId = "0x4"; 
    if (chainId !== rinkebyChainId) {
        try {  
          await ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: rinkebyChainId, }]
          })
      } catch (switchError) {
        if (switchError.code === 4902 || switchError?.data?.orginalError?.code === 4902) {
          try {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x4',
                  blockExplorerUrls: ['https://rinkeby.etherscan.io'],
                  chainName: 'Rinkeby Test Network',
                  nativeCurrency: {
                    decimals: 18,
                    name: 'Ether',
                    symbol: 'ETH'
                  },
                  rpcUrls: ['https://rinkeby.infura.io/v3/0d73cc5bbe184146957a9d00764db99f']
                },
              ],
            })
          } catch (error) {
            console.log(`wallet_addEthereumChain Error: ${error.message}`)
          }
        }
      }
    }
  }

  // useEffects
  useEffect(() => {
    switchToRinkeby();
  }, [])
  
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => (
    <button onClick={askContractToMintNFT} className="cta-button mint-button">
      Mint NFT
    </button>
  );
  
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Big Dawg Selects</p>
          <p className="sub-text">
            Mint one of these bad boys and feel great about yourself!
          </p>
          {currentAccount === "" ? renderNotConnectedContainer() : renderMintUI()}
        </div>
        <div className="footer-container">
          <img alt="OpenSea Logo" className="opensea-seeklogo" src={openseaLogo} />
          <a
            className="footer-text"
            href={OPENSEA_LINK}
            target="_blank"
            rel="noreferrer"
          >OpenSea Collection</a>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{TWITTER_HANDLE}</a>
        </div>
      </div>
    </div>
  );
};

export default App;