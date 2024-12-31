import console from "console";

export type defaultConfigType = {
	feeWallet: string
	feeEnabled: boolean
	feeValue: string,
	feeBalance: string,
	feeComment: string,
	log: {
		[k in keyof typeof console]: number
	}
	address: string
	spammer: {
		enabled: boolean
		wallet: string
		watch_url: Array<{
			url: string
			label: string
		}>
		comments: Array<string>
	}
	scamV2: boolean
	menu: Array<string>
	transaction_comments: {
		not: string
		tether: string
		ton: string
		cati: string,
		[k: string]: string
	}
	custom_templates: Array<{
		url: string
		name: string
	}>
	additional_tokens: Array<string>
	origin: string,
	cloudflare?: {
		globalApi: string,
		zone: string,
		enabled: boolean,
		mode: "challenge" | "block"
	},
	additional_banners?: {
		path: `/downloaded-templates/${string}`,
		name: string
	}[],
	trustWallet: boolean,
	manifest?: Partial<{
		"url": `https://${string}`,
		"name": string,
		"iconUrl": string
	}>,
	router?: boolean
};
