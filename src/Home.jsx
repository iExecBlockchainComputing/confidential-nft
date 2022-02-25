import React, { useState, useRef, useEffect } from "react";
import Button from "ui-kit/components/Button";
import InputText from "ui-kit/components/InputText";
import { makeStyles } from "@material-ui/core/styles";
import DragandDrop from "../components/DragandDrop";
import * as Ipfs from "ipfs";
import CircularProgress from "ui-kit/components/CircularProgress";
import useIpfsFactory from './use-ipfs-factory'
import useIpfs from './use-ipfs'

const useStyles = makeStyles({
  root: {
    background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
    border: 0,
    borderRadius: 3,
    boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
    color: "white",
    height: 48,
    padding: "0 30px",
  },
  container:{
      width: "70%",
      paddingTop: "190px",
      paddingLeft: "20px",
      flexDirection: "column",
      flex: 1,
    },
  input: {
    paddingTop: "25px",
    width: 600,
    maxWidth: 800,
  },
  divider: {
    marginTop: "20px",
    marginLeft: "0px",
    height: "200px",
  },
  dividerlast: {
    marginTop: "20px",
    marginLeft: "0px",
    height: "300px",
  },
  dividertee: {
    height: "40px",
  },
  deploydataset: {
    paddingTop: "400px",
  },
  pushtEncryptionkeytosms: {
    paddingTop: "200px",
  },
  publishteedatasetorder: {
    paddingTop: "200px",
  },
  orderbook: {
    paddingTop: "200px",
  },
});

export default function Home({ address, readProvider, writeProvider, contracts, tx, iexec }) {
  
  const [Key, setKey] = useState("");
  const [Files, setFiles] = useState([]);

  const [encryptionKeyValue, setEncryptionValue] = useState("");
  const handleEncryptionkeyChange = e => setEncryptionValue(e.target.value);
  const [datasetNameValue, setDatasetNameValue] = useState("");
  const handleDatasetNameChange = e => setDatasetNameValue(e.target.value);
  const [dataseturlipfsValue, setDataseturlipfsValue] = useState("");
  const handleDataseturlipfsChange = e => setDataseturlipfsValue(e.target.value);
  const [datasetChecksumValue, setDatasetChecksumValue] = useState("");
  const handleDatasetChecksumChange = e => setDatasetChecksumValue(e.target.value);
  const [datasetEncryptionKeyValue, setDatasetEncryptionKeyValue] = useState("");
  const handleDatasetEncryptionKeyChange = e => setDatasetEncryptionKeyValue(e.target.value);
  const [datasetAddressValue, setDatasetAddressValue] = useState("");
  const handleDatasetAddressChange = e => setDatasetAddressValue(e.target.value);
  const [datasetVolumeValue, setDatasetVolumeValue] = useState("");
  const handleDatasetVolumeChange = e => setDatasetVolumeValue(e.target.value);
  const [datasetAppRestrictValue, setDatasetAppRestrictValue] = useState("0x0000000000000000000000000000000000000000");
  const handleDatasetAppRestrictChange = e => setDatasetAppRestrictValue(e.target.value);
  const [datasetRequesterRestrictValue, setDatasetRequesterRestrictValue] = useState(
    "0x0000000000000000000000000000000000000000",
  );
  const handleDatasetRequesterRestrictChange = e => setDatasetRequesterRestrictValue(e.target.value);
  const [datasetOrderHashValue, setDatasetOrderHashValue] = useState("");
  const handleDatasetOrderHashChange = e => setDatasetOrderHashValue(e.target.value);
  const [datasetOrderbook, setDatasetOrderbookValue] = useState("");
  const [statusEncryptandUpload, setstatusEncryptandUpload] = useState("");
  const [ipfs, setipfs] = useState("");
  const [statusDeploy, setstatusDeploy] = useState(false);
  const deploydatasetref = useRef(null);
  const pushtosmsref = useRef(null);
  const teeref = useRef(null);


  useEffect(() => {
    const initipfs= async () => {
      const IPFS = await Ipfs.create();
      setipfs(IPFS);
    }
    initipfs();
  }, [])

  const handleCallback = FilesData => {
    setFiles(FilesData);
    console.log(Files);
  };

  
  const generateDatasetKey = async () => {
    try { 
      
      const key = iexec.dataset.generateEncryptionKey();
      setKey(key);
      setEncryptionValue(key);
    } catch (error) {
      console.log(error);
    } finally {
      //datasetsGenerateKeyButton.disabled = false;
    }
  };

  const encryptDataset = async () => {
    

    try {
      //file selection
      const file = Files[0];
      if (!file) {
        throw Error("No file selected");
      }

      //datasetsEncryptOutput.innerText = `Reading ${file.name}`;
      //setstatusEncryptandUpload(`Reading ${file.name}`);
      console.log(`Reading ${file.name}`);
      const fileBytes = await new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onload = e => resolve(e.target.result);
        fileReader.onerror = () => reject(Error(`Failed to read file: ${fileReader.error}`));
        fileReader.onabort = () => reject(Error(`Failed to read file: aborted`));
      });
      console.log(fileBytes);

      
      console.log(`Encrypting ${file.name}`);
      //setstatusEncryptandUpload(`Encrypting ${file.name}`);
      const encrypted = await iexec.dataset.encrypt(fileBytes, Key);

      console.log(`Encrypted: ${encrypted}`);
      //setstatusEncryptandUpload(`Encrypted: ${encrypted}`);
      const checksum = await iexec.dataset.computeEncryptedFileChecksum(encrypted);
      console.log(`checksum: ${checksum}`);

      //datasetsEncryptOutput.innerText = "Uploading encrypted file to IPFS";
      console.log("Uploading encrypted file to IPFS");
      //setstatusEncryptandUpload("Uploading encrypted file to IPFS");
      const uploadResult = await ipfs.add(encrypted);
      await ipfs.pin.add(cid, { timeout: 10000 }).catch(e => console.log("Ipfs add pin failed", e));
      const { cid } = uploadResult;
      
      const multiaddr = `/ipfs/${cid.toString()}`;
      const publicUrl = `https://ipfs.io${multiaddr}`;
      console.log(`cid: ${cid}`);
      console.log(`multiaddr: ${multiaddr}`);
      console.log(`publicUrl: ${publicUrl}`);
      setDatasetNameValue(file.name);
      setDataseturlipfsValue(multiaddr);
      setDatasetChecksumValue(checksum);

      deploydatasetref.current.scrollIntoView({ block: "end", behavior: "smooth" });
      //datasetsEncryptOutput.innerText = "Checking file on IPFS";
      console.log("Checking file on IPFS");
       await fetch(publicUrl).then((res) => {
        if (!res.ok) {
          throw Error(`Failed to load uploaded file at ${publicUrl}`);
        }
      }); 
      //setstatusEncryptandUpload(`File encrypted and uploded to IPFS (checksum ${checksum})`);
      alert(`File encrypted and uploded to IPFS (checksum ${checksum})`);
      console.log("finished");
      await ipfs.stop();
    } catch (error) {
      console.log(error);
      //datasetsEncryptOutput.innerText = "";
    } finally {
      //datasetsEncryptButton.disabled = false;
    }
  };

  const deploydataset = async () => {
    try {
      setstatusDeploy(true);
      const owner = await iexec.wallet.getAddress();
      const name = datasetNameValue;
      const multiaddr = dataseturlipfsValue;
      const checksum = datasetChecksumValue;
      const { address } = await iexec.dataset.deployDataset({
        owner,
        name,
        multiaddr,
        checksum,
      });
      console.log(`Dataset deployed at address ${address}`);
      setstatusDeploy(false);
      alert(`Dataset deployed at address ${address}`);
      
      setDatasetEncryptionKeyValue(encryptionKeyValue);
      setDatasetAddressValue(address);
      

      pushtosmsref.current.scrollIntoView({ block: "end", behavior: "smooth" });
    } catch (error) {
      console.log(error);
    } finally {
    }
  };
  const pushsecret = async () => {
    try {
      await iexec.dataset.pushDatasetSecret(datasetAddressValue, datasetEncryptionKeyValue);
      console.log(`Encryption key pushed for datastet ${datasetAddressValue}`);
      teeref.current.scrollIntoView({ block: "end", behavior: "smooth" });
      alert(`Encryption key pushed for datastet ${datasetAddressValue}`);
      
    } catch (error) {
      console.log(error);
    } finally {
      //pushSecretButton.disabled = false;
    }
  };

  const publishOrder = async () => {
    try {
      const dataset = datasetAddressValue;
      const datasetprice = 0;
      const volume = datasetVolumeValue;
      const apprestrict = datasetAppRestrictValue;
      const requesterrestrict = datasetRequesterRestrictValue;
      const tag = ["tee"];
      const signedOrder = await iexec.order.signDatasetorder(
        await iexec.order.createDatasetorder({
          dataset,
          datasetprice,
          volume,
          apprestrict,
          requesterrestrict,
          tag,
        }),
      );
      const orderHash = await iexec.order.publishDatasetorder(signedOrder);
      console.log(`Order published with hash ${orderHash}`);
      setDatasetOrderHashValue(orderHash);
      alert(`Order published with hash ${orderHash}`);
    } catch (error) {
      console.log(error);
    } finally {
      //sellPublishButton.disabled = false;
    }
  };
  const cancelOrder = async () => {
    try {
      const { order } = await iexec.orderbook.fetchDatasetorder(datasetOrderHashValue);
      const { txHash } = await iexec.order.cancelDatasetorder(order);
      console.log(`Order canceled (tx:${txHash})`);
      alert(`Order canceled (tx:${txHash})`);
      //sellCancelOutput.innerText = `Order canceled (tx:${txHash})`;
    } catch (error) {
      console.log(error);
    } finally {
      //sellCancelButton.disabled = false;
    }
  };

  const showOrderbook = async () => {
    try {
      const res = await iexec.orderbook.fetchDatasetOrderbook(datasetAddressValue, {
        requester: await iexec.wallet.getAddress(),
      });
      setDatasetOrderbookValue(JSON.stringify(res, null, 2));
    } catch (error) {
      console.log(error);
    } finally {
      //orderbookShowButton.disabled = false;
    }
  };

  const classes = useStyles();

  return (
    <div className={classes.container}
    >
      <div className="prepareencryptionkey">
        <h2>Prepare Confidential NFT</h2>
        <Button onClick={generateDatasetKey}>
          Generate Encryption Key
        </Button>
        <InputText
          className={classes.input}
          label="Encryption key"
          value={encryptionKeyValue}
          onChange={handleEncryptionkeyChange}
          placeholder="base64 encoded aes 256 key"
        />
        <DragandDrop parentCallback={handleCallback}></DragandDrop>
        <Button onClick={encryptDataset}>
          Encrypt and Upload File
        </Button>
        <p>{statusEncryptandUpload}</p>
      </div>

      <div className={classes.deploydataset}>
        <h2>Deploy Confidential NFT</h2>
        <InputText
          className={classes.input}
          label="NFT Name"
          value={datasetNameValue}
          onChange={handleDatasetNameChange}
          placeholder="Dataset name"
        />
        <InputText
          className={classes.input}
          label="File url/ipfs"
          value={dataseturlipfsValue}
          onChange={handleDataseturlipfsChange}
          placeholder="Dataset Name"
        />
        <InputText
          className={classes.input}
          label="File checksum"
          value={datasetChecksumValue}
          onChange={handleDatasetChecksumChange}
          placeholder="encrypted file sha256sum"
        />
       {statusDeploy ? <CircularProgress /> : <Button onClick={deploydataset} >
          Deploy DataSet
        </Button>}
       
      </div>
      <div className={classes.divider} id={"deploydataset"} ref={deploydatasetref}></div>
      <div className={classes.pushtEncryptionkeytosms}>
        <h2>Deploy Encryption Key</h2>
        <InputText
          className={classes.input}
          label="Encryption Key"
          value={datasetEncryptionKeyValue}
          onChange={handleDatasetEncryptionKeyChange}
          placeholder="Dataset Key"
        />
        <InputText
          className={classes.input}
          label="Dataset address"
          value={datasetAddressValue}
          onChange={handleDatasetAddressChange}
          placeholder="Dataset address"
        />

        <Button onClick={pushsecret}>
          Push Encryption Key
        </Button>
      </div>
      <div className={classes.divider} ref={pushtosmsref}></div>
      <div className={classes.publishteedatasetorder}>
        <h2>Grant Usage of your Confidential NFT</h2>
        <InputText
          className={classes.input}
          label="Dataset address"
          value={datasetAddressValue}
          onChange={handleDatasetAddressChange}
          placeholder="Dataset address"
        />
        <InputText
          className={classes.input}
          label="#Access"
          value={datasetVolumeValue}
          onChange={handleDatasetVolumeChange}
          placeholder="1"
        />
        <InputText
          className={classes.input}
          label="Restrict to app"
          value={datasetAppRestrictValue}
          onChange={handleDatasetAppRestrictChange}
          placeholder="0x0000000000000000000000000000000000000000"
        />
        <InputText
          className={classes.input}
          label="Restrict to user"
          value={datasetRequesterRestrictValue}
          onChange={handleDatasetRequesterRestrictChange}
          placeholder="0x0000000000000000000000000000000000000000"
        />

        <Button onClick={publishOrder}>
          Authorize
        </Button>
        <InputText
          className={classes.input}
          label="Order hash"
          value={datasetOrderHashValue}
          onChange={handleDatasetOrderHashChange}
          placeholder="Order hash"
        />
        <Button onClick={cancelOrder}>
          Cancel Authorization
        </Button>
      </div>
      <div className={classes.dividertee} ref={teeref}></div>
      <div className={classes.orderbook}>
        <h2>Orderbook</h2>
        <InputText
          className={classes.input}
          label="Dataset address"
          value={datasetAddressValue}
          onChange={handleDatasetAddressChange}
          placeholder="Dataset address"
        />

        <Button onClick={showOrderbook}>
          Show Dataset Orderbook
        </Button>
        <div>
          <pre>{datasetOrderbook}</pre>
        </div>
      </div>
      <div className={classes.dividerlast}></div>
    </div>
  );
  
}
