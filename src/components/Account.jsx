import React, {useState} from "react";
import NavBar from "ui-kit/components/NavBar";
import Button from "ui-kit/components/Button";

/*
  ~ What it does? ~

  Displays an Address, Balance, and Wallet as one Account component,
  also allows users to log in to existing accounts and log out

  ~ How can I use? ~

  <Account
    address={address}
    provider={provider}
    provider={provider}
    provider={provider}
    price={price}
    web3Modal={web3Modal}
    loadWeb3Modal={loadWeb3Modal}
    logoutOfWeb3Modal={logoutOfWeb3Modal}
    blockExplorer={blockExplorer}
  />

  ~ Features ~

  - Provide address={address} and get balance corresponding to the given address
  - Provide provider={provider} to access balance on local network
  - Provide provider={provider} to display a wallet
  - Provide provider={provider} and your address will be replaced by ENS name
              (ex. "0xa870" => "user.eth")
  - Provide price={price} of ether and get your balance converted to dollars
  - Provide web3Modal={web3Modal}, loadWeb3Modal={loadWeb3Modal}, logoutOfWeb3Modal={logoutOfWeb3Modal}
              to be able to log in/log out to/from existing accounts
  - Provide blockExplorer={blockExplorer}, click on address and get the link
              (ex. by default "https://etherscan.io/" or for xdai "https://blockscout.com/poa/xdai/")
*/

export default function Account({
  address,
  provider,
  price,
  minimized,
  web3Modal,
  loadWeb3Modal,
  logoutOfWeb3Modal,
  blockExplorer,
}) {
  const tabsValues = [
    {
      value: "tab1",
      label: "NFT Builder",
    },
  ];


  const [activeTab, setActiveTab] = useState(tabsValues[0].value);
  const handleTabSelect = (value) => setActiveTab(value);

  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const toggleLogin = () => {
    loadWeb3Modal();
    setIsLoggedIn(!isLoggedIn);
  }
  const userAddress = address;


  const availableNetworks = [
    {
      value: "1",
      label: "iExec Sidechain testnet",
    }
  ];
  const [currentNetwork, setCurrentNetwork] = useState(
    availableNetworks[0].value
  );
  const handleNetworkSelect = (value) => setCurrentNetwork(value);
  const modalButtons = [];
  if (web3Modal) {
    if (web3Modal.cachedProvider) {
      
      modalButtons.push(
        <Button
          key="logoutbutton"
          style={{ verticalAlign: "top", marginLeft: 8, marginTop: 4 }}
          shape="round"
          size="large"
          onClick={logoutOfWeb3Modal}
        >
          Logout
        </Button>,
      );
    } else {
      modalButtons.push(
        <Button
          key="loginbutton"
          style={{ verticalAlign: "top", marginLeft: 8, marginTop: 4 }}
          shape="round"
          size="large"
          /*type={minimized ? "default" : "primary"}     too many people just defaulting to MM and having a bad time*/
          onClick={loadWeb3Modal}
        >
          Connect
        </Button>,
      );
    }
  }


  return (
    <div>
      
        <NavBar
          title="Datahub"
          tabs={{
            values: tabsValues,
            value: activeTab,
            onSelect: handleTabSelect,
          }}
          login={{
            isLoggedIn,
            onLoginClick: toggleLogin,
            onLogoutClick: toggleLogin,
            address: userAddress,
            onAddressClick: () => alert("onAddressClick"),
          }}
          network={{
            values: availableNetworks,
            value: currentNetwork,
            onSelect: handleNetworkSelect,
            disabled: isLoggedIn,
          }}
          extraButtons={[
            {
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              ),
              label: "extra button",
              onClick: () => alert("clicked"),
            },
          
          ]}
        />
      
      
    </div>
  );
}
