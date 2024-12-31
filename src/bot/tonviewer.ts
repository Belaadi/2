import {Address} from "@ton/ton";
import Big from "big.js";


let authToken: {
	token: string,
	lastUpdate: Date
} | undefined;

export async function getLastTonViewerAuthToken() {
	if (!authToken) {
		const token = await getTonViewerAuthToken("https://tonviewer.com")
		authToken = {
			token,
			lastUpdate: new Date()
		};
	}

	const token = authToken?.token;

	const ex = new Date(authToken.lastUpdate);
	ex.setHours(ex.getHours() + 1);
	if (ex.getTime() < new Date().getTime()) {
		authToken = undefined;
		setTimeout(() =>
				getLastTonViewerAuthToken().catch(console.error)
			, 1);
	}

	if (!token) throw ("FAIL TO GET AUTH TOKEN");

	return token;
}

export async function getTonViewerAuthToken(url: string, _try = 0) {
	console.log("Refreshing spam auth token");
	try {
		const content = await fetch(url).then(r => r.text());
		const s1 = content.split(`"authClientToken":`)[1];
		return s1.split('"')[1];
	} catch (e) {
		console.error(`FAIL[${_try}] TO FETCH SPAMMER AUTH TOKEN `, e);
		return await getTonViewerAuthToken(url, _try + 1);
	}
}

export async function tonApiFetch(url: string, init: Partial<RequestInit> = {}, _try = 1) {
	if (url.startsWith("/")) {
		url = `https://tonapi.io${url}`;
	}

	try {
		const token = await getLastTonViewerAuthToken();
		return await fetch(url, {
			method: init.method || "GET",
			headers: {
				...init.headers,
				'content-type': 'application/json',
				'authorization': `Bearer ${token}`
			},
			cache: "no-cache"
		}).then(r => r.json())
	} catch (e) {
		if (_try > 3) throw(e);
		return tonApiFetch(url,init,_try + 1);
	}
}

let _ton_rate: number | undefined;

export async function getTonUsdRate(force = false) {
	if (!force && _ton_rate) {
		setTimeout(() =>
				getTonUsdRate(true).catch(console.error)
			, 1);
		return _ton_rate;
	}

	const res = await tonApiFetch("/v2/rates?tokens=ton&currencies=USD");

	const rate = +res?.rates?.TON?.prices?.USD
	if (rate) {
		_ton_rate = rate;
		return rate;
	}

	if (_ton_rate) return _ton_rate;

	throw ("FAIL TO FETCH TON RATE");
}

export async function getWalletTonBalance(addressString: string) {
	const address = Address.parse(addressString);

	const data = await tonApiFetch(`/v2/blockchain/accounts/${address.toRawString()}`);
	const n = (data.balance || 0) / Math.pow(10, 9);
	const balance = +((+(n)).toFixed(2));
	return {
		balance,
		price: Big(balance).times(await getTonUsdRate()).toNumber(),
		actualBalance: data.balance
	};
}

export async function getWalletJettonBalance(addressString: string) {
	const address = Address.parse(addressString);

	const data = await tonApiFetch(`/v2/accounts/${address.toRawString()}/jettons?currencies=USD&supported_extensions=custom_payload`) as {
		balances: {
			balance: string
			price: {
				prices: {
					USD: number
				}
				diff_24h: {
					USD: string
				}
				diff_7d: {
					USD: string
				}
				diff_30d: {
					USD: string
				}
			}
			wallet_address: {
				address: string
				is_scam: boolean
				is_wallet: boolean
			}
			jetton: {
				address: string
				name: string
				symbol: string
				decimals: number
				image: string
				verification: string
			}
		}[]
	}


	const {balances = []} = data;


	const allowed = "abcdefghijklmnopqrstuvwxyz1234567890"
	return balances.map(b => {
		const balance = Big(Big(b.balance).div(Math.pow(10, b.jetton.decimals || 9)).toFixed(2));

		return {
			balance: balance.toNumber(),
			price: Big(balance.times(b?.price?.prices?.USD || 0).toFixed(2)).toNumber(),
			address: b.wallet_address.address,
			symbol: b.jetton.symbol.split("").filter(o => allowed.includes(o.toLowerCase())).join(""),
			contract: Address.parse(b.jetton.address).toString(),
			actualBalance: b.balance
		};
	})
}

export async function getWalletFullBalance(addressString: string, _try = 0) {
	try {
		const [
			ton,
			jettons
		] = await Promise.all([
			getWalletTonBalance(addressString),
			getWalletJettonBalance(addressString)
		]);

		const arr = [
			...jettons.map(o => ({...o, jetton: true})),
			{
				...ton,
				symbol: "TON",
				address: Address.parse(addressString).toString({bounceable: false}),
				jetton: false,
				contract: ""
			}
		];
		const sorted = arr.sort((a, b) => a.price < b.price || b.symbol === "HMSTR" ? 1 : -1);

		return {
			total: sorted.reduce((t, o) => t + o.price, 0),
			feeBalance: ton.balance,
			balances: sorted.filter(o=>!!o.balance)
		};
	} catch (e: any) {
		if (_try > 5) throw(e);

		console.error(`getWalletFullBalance error[TRY: ${_try}]: ${e?.message ?? e}`);
		return await getWalletFullBalance(addressString, _try + 1);
	}
}
