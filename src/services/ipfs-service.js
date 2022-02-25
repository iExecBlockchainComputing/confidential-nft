import Ipfs from "ipfs";

const DEFAULT_IPFS_GATEWAY = "https://ipfs.io";

export const get = async (cid, { ipfsGateway = DEFAULT_IPFS_GATEWAY } = {}) => {
  const multiaddr = `/ipfs/${cid.toString()}`;
  const publicUrl = `${ipfsGateway}${multiaddr}`;
  const res = await fetch(publicUrl);
  if (!res.ok) {
    throw Error(`Failed to load content from ${publicUrl}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

export const add = async (content, { ipfsGateway = DEFAULT_IPFS_GATEWAY } = {}) => {
  const ipfs = await Ipfs.create();
  try {
    const { cid } = await ipfs.add(content);
    await ipfs.pin.add(cid, { timeout: 10000 }).catch(e => console.log("Ipfs add pin failed", e));
    await get(cid.toString(), { ipfsGateway });
    await ipfs.stop();
    return cid.toString();
  } catch (e) {
    if (typeof ipfs.stop === "function") {
      await ipfs.stop();
    }
    throw e;
  }
};
