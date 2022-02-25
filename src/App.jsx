import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import { Web3Provider } from "@ethersproject/providers";
import "./App.css";
import { Row, Col, Button, Menu, Alert } from "antd";
import Web3Modal from "web3modal";
import { IExec } from 'iexec';
import { useUserAddress } from "eth-hooks";
import {Account, Faucet } from "./components";
import { Home } from "./views";
import {NETWORK, NETWORKS } from "./constants";


/// 📡 What chain are your contracts deployed to?
const targetNetwork = NETWORKS["iExecSidechain"];

// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer;


function App(props) {

  // injected provider for writing
  const [provider, setWriteProvider] = useState();
  const [iexec, setiexec] = useState();
  // infura provider pointed at target network for reading
  // wait, can we use infura for mumbai or we need to get our own rpc
  // yes.. we have to use RPC provider. project is already configured for multiple networks
  // including mumbai.
  // const readProvider = new JsonRpcProvider(targetNetwork.rpcUrl);


  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  

  const address = useUserAddress(provider);

  // You can warn the user if you would like them to be on a specific network
  let selectedChainId = provider?._network?.chainId;
  let localChainId = targetNetwork?.chainId;




 

  let networkDisplay = "";
  if (targetNetwork?.chainId && selectedChainId && targetNetwork.chainId !== selectedChainId) {
    networkDisplay = (
      <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
        <Alert
          message={"⚠️ Wrong Network"}
          description={
            <div>
              You have{" "}
              <b>
                {NETWORK(selectedChainId)?.name}({selectedChainId})
              </b>{" "}
              selected and you need to be on{" "}
              <b>
                {NETWORK(targetNetwork?.chainId)?.name} ({localChainId})
              </b>
              .
            </div>
          }
          type="error"
          closable={false}
        />
      </div>
    );
  } else {
    networkDisplay = (
      <div style={{ zIndex: -1, position: "absolute", right: 154, top: 28, padding: 16, color: targetNetwork.color }}>
        {targetNetwork.name}
      </div>
    );
  }

  const loadWeb3Modal = useCallback(async () => {
    
    
    let ethProvider;
  if (!window.ethereum)
    // check existing web3 provider
    throw Error('Need to install MetaMask');
  ethProvider = window.ethereum;
  ethProvider.on("chainChanged", (_chainId) => window.location.reload());
      ethProvider.on("accountsChanged", (_accounts) =>
        window.location.reload()
      );
      await window.ethereum.request({
        method: "eth_requestAccounts"
      });
      window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x85",
            chainName: "iExec Test Sidechain",
            nativeCurrency: {
              name: "xRLC",
              symbol: "xRLC",
              decimals: 18
            },
            rpcUrls: ["https://viviani.iex.ec"],
            blockExplorerUrls: ["https://blockscout-viviani.iex.ec"]
          }
        ]
      });
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' }); // prompt the use to grant the dapp access to the blockchain
  } catch (error) {
    throw Error('User denied access', error);
  }
  const web3provider = new Web3Provider(ethProvider);
    // Wrapper for transforming a web3 provider (like metamask)
    setWriteProvider(web3provider);
    setiexec(new IExec(
      {
        ethProvider: ethProvider, // an eth signer provider like MetaMask connected to https://bellecour.iex.ec
      },
      {
        isNative: true, // iExec sidechain use RLC as native token
        smsURL: "https://v7.sms.debug-tee-services.viviani.iex.ec"
      },
    ));
  }, [setWriteProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  let faucetHint = "";
  const faucetAvailable = provider && provider.connection && targetNetwork.name === "localhost";

  const [faucetClicked, setFaucetClicked] = useState(false);
  if (
    !faucetClicked &&
    provider &&
    provider._network &&
    provider._network.chainId === 31337
  ) {
    faucetHint = (
      <div style={{ padding: 16 }}>
        <Button
          type={"primary"}
          onClick={() => {
            setFaucetClicked(true);
          }}
        >
          <span role="img" aria-label="funds">💰</span> Grab funds from the faucet <span role="img" aria-label="gas">⛽️</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="App">
      
      
      {networkDisplay}
      <BrowserRouter>
        <Menu style={{ textAlign: "center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link
              onClick={() => {
                setRoute("/");
              }}
              to="/"
            >
              
            </Link>
          </Menu.Item>
          
          
        </Menu>

        <Switch>
          <Route exact path="/">
          {address?
              <Home address={address} writeProvider={provider} iexec={iexec}/>
              : <div style={{paddingTop: "130px"}}>Connect your wallet to use the Dapp!</div>
            }
          </Route>
          
        </Switch>
      </BrowserRouter>

      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", left: 0,right: 0, top: 0,}}>
        <Account
          address={address}
          provider={provider}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
        />
        {faucetHint}
      </div>

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
      <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
        <Row align="middle" gutter={[4, 4]}>
          <Col span={24}>
            {
              /*  if the local provider has a signer, let's show the faucet:  */
              faucetAvailable ? (
                <Faucet
                  localProvider={provider}
                  // price={price}
                  // ensProvider={provider}
                />
              ) : (
                ""
              )
            }
          </Col>
        </Row>
      </div>
      
    </div>
  );
}

/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    
  },
});

const logoutOfWeb3Modal = async () => {
  await web3Modal.clearCachedProvider();
  setTimeout(() => {
    window.location.reload();
  }, 1);
};

window.ethereum &&
  window.ethereum.on("chainChanged", chainId => {
    setTimeout(() => {
      window.location.reload();
    }, 1);
  });

export default App;
