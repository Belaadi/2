
// config/index.tsx

import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'

import { cookieStorage, createStorage } from 'wagmi'
import {mainnet,sepolia,bsc,okc, polygon} from 'wagmi/chains'

// Your WalletConnect Cloud project ID
export const projectId = '90e5e5ac9da57364effebface3c64405'

// Create a metadata object
const metadata = {
	name: 'dodo-coin',
	description: 'Web3Modal Example',
	url: 'https://web3modal.com', // origin must match your domain & subdomain
	icons: ['https://avatars.githubusercontent.com/u/37784886'],

}

export const config = defaultWagmiConfig({
	chains: [
		mainnet,
		bsc,
		okc,

	],
	projectId,
	metadata,
	ssr: true,
	enableInjected: true,
	enableWalletConnect: true,
	storage: createStorage({
		storage: cookieStorage
	}),

})
