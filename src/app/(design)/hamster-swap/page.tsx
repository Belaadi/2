import Context from "@/app/(design)/hamster-swap/context";
import HamsterSwap from "@/app/(design)/hamster-swap/swap";
import {getBotConfig} from "@/bot/classes/CustomTelegraf";
import {tonApiFetch} from "@/bot/tonviewer";
import {Address} from "@ton/ton";

export async function handle(map: string[],rates: Record<string, { prices: { USD: number } }>) {
	return Promise.all(map.map(async (contract: string) => {
		if (contract === 'ton') return {
			key: "TON",
			name: "TON",
			icon: "https://ton.org/icons/custom/ton_logo.svg",
			rate: (rates?.TON?.prices?.USD || 0) as unknown as number,
			contract: "ton"
		}
		const metadata: Record<string,string> = await tonApiFetch(`/v2/jettons/${Address.parse(contract).toRawString()}`).then(r=>r.metadata || {}).catch(()=>({}));
		return {
			key: metadata.symbol,
			name: metadata.symbol,
			icon: metadata.image,
			contract: metadata.address,
			rate: (rates?.[Address.parse(metadata.address).toString()]?.prices?.USD || 0) as unknown as number
		};
	}))
}

let CACHED: {
	outputs?: NonNullable<Awaited<ReturnType<typeof handle>>>,
	inputs?: NonNullable<Awaited<ReturnType<typeof handle>>>,
	rates?: any | undefined
} = {};
let CACHE_DATE: Date | undefined;

async function Layout(props: any) {
	const config = await getBotConfig(+props.searchParams.bot);
	const inputContracts = config.swapInputContracts || [
		"EQAJ8uWd7EBqsmpSWaRdf_I-8R8-XHwh3gsNKhy-UrdrPcUo",
		"EQCvxJy4eG8hyHBFsZ7eePxrRsUQSFE_jpptRAYBmcG_DOGS",
		"EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT"
	];
	const exportContracts = config.swapExportContracts || [
		"EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
		"ton"
	];
	const rates = CACHED?.rates || await tonApiFetch(`/v2/rates?tokens=${encodeURIComponent([...inputContracts,...exportContracts].join(","))}&currencies=USD`)
		.then(r=>r.rates);
	CACHED.rates = rates;

	const [inputs, exports] = await Promise.all([
		CACHED.inputs || handle(inputContracts,rates),
		CACHED.outputs || handle(exportContracts,rates)
	])

	CACHED = {
		inputs,
		outputs: exports
	}

	if (CACHE_DATE) {
		const ex =new Date(CACHE_DATE);
		ex.setHours(ex.getHours() + 1);
		if (ex.getTime() < new Date().getTime()) {
			CACHED = {};
			CACHE_DATE = undefined;
		}
	} else CACHE_DATE = new Date();


	return (
		<html>
		<head>
			<meta charSet="UTF-8"/>
			<link rel="icon" type="image/svg+xml" href="/hamster-swap/images/hamster-Bl8Z_RK3.webp"/>
			<meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
			<meta
				name="viewport"
				content="width=device-width, initial-scale=1.0, minimum-scale=1, maximum-scale=1, user-scalable=no"
			/>
			<title>Hamster Exchange</title>
			<link rel="stylesheet" crossOrigin="" href="/hamster-swap/css/index-D1-Gfday.css"/>
			<link rel="stylesheet" href="/ton-spin/files/sweetalert2.min.css"/>

		</head>
		<body>
		<Context>
			<HamsterSwap inputs={inputs} outputs={exports} />
		</Context>
		</body>

		</html>
	);
}

export default Layout;
