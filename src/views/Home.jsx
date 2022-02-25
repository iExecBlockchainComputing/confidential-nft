import React, { useState, useRef } from "react";
import Button from "ui-kit/components/Button";
import InputText from "ui-kit/components/InputText";
import { makeStyles } from "@material-ui/core/styles";
import DragandDrop from "../components/DragandDrop";
import CircularProgress from "ui-kit/components/CircularProgress";
import { add } from "../services/ipfs-service";

const useStyles = makeStyles({
  container: {
    width: "70%",
    paddingTop: "50px",
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
  const [TaskidValue, setTaskidValue] = useState("");
  const handleTaskidChange = e => setTaskidValue(e.target.value);

  const [statusEncryptandUpload, setstatusEncryptandUpload] = useState([]);
  const [statusencryptuploadbutton, setstatusencryptuploadbutton] = useState(false);
  const [statusDeploytext, setdeploytext] = useState("");
  const [statussecrettext, setsecrettext] = useState("");
  const [statusDeploy, setstatusDeploy] = useState(false);
  const [runapplaoding, setrunapplaoding] = useState(false);

  const [disablestoragebutton, setdisablestoragebutton] = useState(false);
  const [storagetext, setstoragetext] = useState("");
  const [appstatusdeal, setappstatusdeal] = useState([]);
  const [appstatus, setappstatus] = useState("");

  const deploydatasetref = useRef(null);
  const pushtosmsref = useRef(null);
  const teeref = useRef(null);

  const handleCallback = FilesData => {
    setFiles(FilesData);
  };
  const delay = ms => new Promise(res => setTimeout(res, ms));

  const generateDatasetKey = async () => {
    try {
      const key = iexec.dataset.generateEncryptionKey();
      setKey(key);
      setEncryptionValue(key);
    } catch (error) {
      console.log(error);
    } finally {
     
    }
  };

  const encryptDataset = async () => {
    try {
      setstatusencryptuploadbutton(true);
      
      const file = Files[0];
      if (!file) {
        throw Error("No file selected");
      }

      setstatusEncryptandUpload([<p>Reading File {file.name} </p>]);
      console.log(`Reading ${file.name}`);
      const fileBytes = await new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onload = e => resolve(e.target.result);
        fileReader.onerror = () => reject(Error(`Failed to read file: ${fileReader.error}`));
        fileReader.onabort = () => reject(Error(`Failed to read file: aborted`));
      });

      setstatusEncryptandUpload(oldArray => [...oldArray, <p>Encrypting {file.name} </p>]);

      const encrypted = await iexec.dataset.encrypt(fileBytes, Key);

      const checksum = await iexec.dataset.computeEncryptedFileChecksum(encrypted);

      setstatusEncryptandUpload(oldArray => [...oldArray, <p>Uploading encrypted file to IPFS </p>]);

      const cid = await add(encrypted);

      const multiaddr = `/ipfs/${cid.toString()}`;
      const publicUrl = `https://ipfs.io${multiaddr}`;

      setDatasetNameValue(file.name);
      setDataseturlipfsValue(multiaddr);
      setDatasetChecksumValue(checksum);

      setstatusEncryptandUpload(oldArray => [
        ...oldArray,
        <p>
          Checking file on IPFS on <a href={publicUrl}>{publicUrl}</a>{" "}
        </p>,
      ]);
      await delay(5000);

      await fetch(publicUrl).then(res => {
        if (!res.ok) {
          throw Error(`Failed to load uploaded file at ${publicUrl}`);
        }
      });
      setstatusencryptuploadbutton(false);
      setstatusEncryptandUpload(oldArray => [
        ...oldArray,
        <p>File encrypted and uploded to IPFS (checksum {checksum}) </p>,
      ]);
      await delay(4000);

      deploydatasetref.current.scrollIntoView({ block: "end", behavior: "smooth" });
    } catch (error) {
      console.log(error);
      
    } finally {
      
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

      setstatusDeploy(false);
      setdeploytext(`Dataset deployed at address ${address}`);

      setDatasetEncryptionKeyValue(encryptionKeyValue);
      setDatasetAddressValue(address);

      await delay(4000);
      pushtosmsref.current.scrollIntoView({ block: "end", behavior: "smooth" });
    } catch (error) {
      console.log(error);
    } finally {
    }
  };
  const pushsecret = async () => {
    try {
      await iexec.dataset.pushDatasetSecret(datasetAddressValue, datasetEncryptionKeyValue);

      setsecrettext(`Encryption key pushed for datastet ${datasetAddressValue}`);
      await delay(4000);
      teeref.current.scrollIntoView({ block: "end", behavior: "smooth" });
    } catch (error) {
      console.log(error);
    } finally {
      
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
    }
  };
  const cancelOrder = async () => {
    try {
      const { order } = await iexec.orderbook.fetchDatasetorder(datasetOrderHashValue);
      const { txHash } = await iexec.order.cancelDatasetorder(order);
      alert(`Order canceled (tx:${txHash})`);
    } catch (error) {
      console.log(error);
    } finally {
    }
  };
  const checkStorage = async () => {
    try {
      const isStorageInitialized = await iexec.storage.checkStorageTokenExists(await iexec.wallet.getAddress());
      if (isStorageInitialized) setstoragetext("initialized");
      else setstoragetext("not initialized");
    } catch (error) {
      console.log(error);
    }
  };
  const initStorage = async () => {
    try {
      const storageToken = await iexec.storage.defaultStorageLogin();
      await iexec.storage.pushStorageToken(storageToken, { forceUpdate: true });
      checkStorage();
    } catch (error) {
      console.log(error);
    } finally {
      setdisablestoragebutton(true);
    }
  };
  const appRun = async () => {
    try {
      setrunapplaoding(true);
      const appAddress = "0x4674570aAb12ad082857F3262c2F8D4DF09Aa498";
      const datasetAddress = datasetAddressValue;
      const userAddress = await iexec.wallet.getAddress();

      const { orders: appOrders } = await iexec.orderbook.fetchAppOrderbook(appAddress, {
        minTag: ["tee"],
      });
      const appOrder = appOrders && appOrders[0] && appOrders[0].order;
      if (!appOrder) throw Error(`no apporder found for app ${appAddress}`);
      const datasetOrders = await iexec.orderbook.fetchDatasetOrderbook(datasetAddress, {
        requester: userAddress,
      });

      const datasetOrder = datasetOrders.orders[0].order;

      const workerpoolOrders = await iexec.orderbook.fetchWorkerpoolOrderbook({
        workerpool: "0x5210cD9C57546159Ac60DaC17B3e6cDF48674FBD",
        app: appAddress,
        requester: userAddress,
        minTag: ["tee"],
      });
      console.log(workerpoolOrders.orders[0].order);
      const workerpoolOrder = workerpoolOrders.orders[0].order;

      const requestOrderToSign = await iexec.order.createRequestorder({
        app: appAddress,
        appmaxprice: appOrder.appprice,
        dataset: datasetAddress,
        datasetmaxprice: datasetOrder.datasetprice,
        workerpoolmaxprice: workerpoolOrder.workerpoolprice,
        requester: userAddress,
        volume: 1,
        params: {
          iexec_developer_logger: true,
        },
        tag: ["tee"],
        category: workerpoolOrder.category,
      });

      const requestOrder = await iexec.order.signRequestorder(requestOrderToSign);
      console.log(datasetOrder);
      const { dealid } = await iexec.order.matchOrders({
        apporder: appOrder,
        datasetorder: datasetOrder,
        requestorder: requestOrder,
        workerpoolorder: workerpoolOrder,
      });

      const dealUrl = `https://explorer.iex.ec/viviani/deal/${dealid}`;
      const deal = await iexec.deal.show(dealid);
      setTaskidValue(deal.tasks["0"]);
      setappstatusdeal([
        <p>
          submitted deal ! check deal on <a href={dealUrl}>{dealUrl}</a>{" "}
        </p>,
      ]);
      setappstatus("Task Running! this can take up to 5 minutes before downloading the task result");
      setrunapplaoding(false);
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  const dowloadResults = async () => {
    try {
      const res = await iexec.task.fetchResults(TaskidValue);
      console.log(res);
      const file = await res.blob();
      console.log(file);
      const fileName = `${TaskidValue}.zip`;
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(file);
      link.click();
      if (window.navigator.msSaveOrOpenBlob) window.navigator.msSaveOrOpenBlob(file, fileName);
    } catch (error) {
      console.log(error);
      alert(error.message);
    } finally {
    }
  };

  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className="prepareencryptionkey">
        <h2>Prepare Confidential NFT</h2>
        <Button onClick={generateDatasetKey}>Generate Encryption Key</Button>
        <InputText
          className={classes.input}
          label="Encryption key"
          value={encryptionKeyValue}
          onChange={handleEncryptionkeyChange}
          placeholder="base64 encoded aes 256 key"
        />
        <DragandDrop parentCallback={handleCallback}></DragandDrop>
        {statusencryptuploadbutton ? (
          <CircularProgress />
        ) : (
          <Button onClick={encryptDataset}>Encrypt and Upload File</Button>
        )}
        <div>
          {statusEncryptandUpload.map((status, index) => {
            return <div key={index}>{status}</div>;
          })}
        </div>
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
        {statusDeploy ? <CircularProgress /> : <Button onClick={deploydataset}>Deploy DataSet</Button>}
        <p>{statusDeploytext}</p>
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

        <Button onClick={pushsecret}>Push Encryption Key</Button>
        <p>{statussecrettext}</p>
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

        <Button onClick={publishOrder}>Authorize</Button>
        <InputText
          className={classes.input}
          label="Order hash"
          value={datasetOrderHashValue}
          onChange={handleDatasetOrderHashChange}
          placeholder="Order hash"
        />
        <Button onClick={cancelOrder}>Cancel Authorization</Button>
      </div>
      <div className={classes.dividertee} ref={teeref}></div>
      <div className={classes.orderbook}>
        <h2>Run in demo app</h2>
        <Button onClick={initStorage} disabled={disablestoragebutton}>
          Init Storage
        </Button>
        <p>{storagetext}</p>
        <InputText
          className={classes.input}
          label="Dataset address"
          value={datasetAddressValue}
          onChange={handleDatasetAddressChange}
          placeholder="Dataset address"
        />
        {runapplaoding ? <CircularProgress /> : <Button onClick={appRun}>Run App</Button>}

        <div>{appstatusdeal[0]}</div>
        <div>{appstatus}</div>
        
        <InputText
          className={classes.input}
          label="Task id"
          value={TaskidValue}
          onChange={handleTaskidChange}
          placeholder="Task id"
        />
        <Button onClick={dowloadResults}>Download Task Result</Button>
      </div>
      <div className={classes.dividerlast}></div>
    </div>
  );
}
