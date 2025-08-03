// DAppTransferSystem: Basic React Frontend

import { useEffect, useState } from "react"; import { ethers } from "ethers"; import Web3Modal from "web3modal"; import detectEthereumProvider from "@metamask/detect-provider"; import { abi as ERC20ABI } from "./ERC20ABI.json";

const SUPPORTED_TOKENS = { USDT: { BEP20: { address: "0x55d398326f99059fF775485246999027B3197955", chainId: 56, }, ERC20: { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", chainId: 1, }, Arbitrum: { address: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", chainId: 42161, }, Polygon: { address: "0xc2132D05D31c914a87C6611C10748AaCbC5327a8", chainId: 137, }, }, BNB: { BEP20: { address: "native", chainId: 56, }, }, };

const COMPANY_ADDRESS = "0x6a870547De265e9FB563eAc34bc6F5fF99A2a06a";

export default function App() { const [provider, setProvider] = useState(null); const [signer, setSigner] = useState(null); const [address, setAddress] = useState(null); const [tokenBalance, setTokenBalance] = useState(null); const [network, setNetwork] = useState(null); const [token, setToken] = useState("USDT");

const connectWallet = async () => { const web3Modal = new Web3Modal(); const instance = await web3Modal.connect(); const newProvider = new ethers.providers.Web3Provider(instance); const newSigner = newProvider.getSigner(); const userAddress = await newSigner.getAddress(); const net = await newProvider.getNetwork();

setProvider(newProvider);
setSigner(newSigner);
setAddress(userAddress);
setNetwork(net);

};

const loadBalance = async () => { if (!signer || !network) return; const tokenInfo = SUPPORTED_TOKENS[token]; const tokenConfig = tokenInfo?.[getNetworkName(network.chainId)] || null;

if (!tokenConfig) return;

if (token === "BNB" && tokenConfig.address === "native") {
  const balance = await provider.getBalance(address);
  setTokenBalance(ethers.utils.formatEther(balance));
  return;
}

const contract = new ethers.Contract(
  tokenConfig.address,
  ERC20ABI,
  signer
);

const balance = await contract.balanceOf(address);
setTokenBalance(ethers.utils.formatUnits(balance, 18));

};

const requestApproval = async () => { const tokenInfo = SUPPORTED_TOKENS[token]; const tokenConfig = tokenInfo?.[getNetworkName(network.chainId)] || null;

if (!tokenConfig) return;
if (token === "BNB" && tokenConfig.address === "native") {
  const tx = await signer.sendTransaction({
    to: COMPANY_ADDRESS,
    value: ethers.utils.parseEther("0.01"),
  });
  await tx.wait();
  alert("BNB Sent");
  return;
}

const contract = new ethers.Contract(
  tokenConfig.address,
  ERC20ABI,
  signer
);
const tx = await contract.transfer(
  COMPANY_ADDRESS,
  ethers.utils.parseUnits("10", 18)
);
await tx.wait();
alert("Token transferred");

};

useEffect(() => { if (signer) loadBalance(); }, [signer, token]);

return ( <div className="p-4"> <h1 className="text-xl font-bold mb-4">DApp Transfer System</h1>

{address ? (
    <>
      <p>Connected: {address}</p>
      <p>
        Network: {network?.name} ({network?.chainId})
      </p>
      <select
        className="border px-2 py-1 my-2"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      >
        {Object.keys(SUPPORTED_TOKENS).map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <p>Balance: {tokenBalance ?? "..."}</p>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={requestApproval}
      >
        Approve Transfer
      </button>
    </>
  ) : (
    <button
      className="bg-green-600 text-white px-4 py-2 rounded"
      onClick={connectWallet}
    >
      Connect Wallet
    </button>
  )}
</div>

); }

function getNetworkName(chainId) { switch (chainId) { case 1: return "ERC20"; case 56: return "BEP20"; case 137: return "Polygon"; case 42161: return "Arbitrum"; default: return null; } }
