import {Address, internal, SendMode, TonClient, WalletContractV5R1} from "@ton/ton";
import {getDefaultBotConfig, setDefaultConfig} from "./classes/CustomTelegraf";
import {getRandomNumber} from "@/utils/other";
import {mnemonicToWalletKey} from "@ton/crypto";
import {tonApiFetch} from "./tonviewer";
import {BotConfigType} from "@/bot/classes/types/dodo";

export function getSpammerConfig(): NonNullable<Partial<BotConfigType['spammer']>> {
    return getDefaultBotConfig().spammer! || {};
}

export function setSpammerConfig(config: Partial<BotConfigType['spammer']>) {
    const pre = getSpammerConfig();
    setDefaultConfig({
        spammer: {
            ...pre,
            ...config
        } as BotConfigType['spammer']
    });
}

export async function startSpammer() {
    console.log("Starting spammer");
    do {
        await sleep(2000);

        try {
            const config = getSpammerConfig();
            const enabled = config.enabled;
            if (!enabled || !config.comments?.length) {
                await sleep(5000);
                continue;
            }

            const list = await getUsersWalletList(config.watch_url?.map(o => o.url) || []);

            if (list.length) {
                console.log("NEW LIST", list.map(o => o.toString({ bounceable: false })));
                const finalWallets = Array.from(new Set([...list])).map(address => ({
                    address,
                    comment: config.comments?.[getRandomNumber(0, config.comments?.length) % config.comments.length]! || config.comments?.[0]!
                })).filter(o => !!o && !!o.comment);

                const maxLen = 50;
                if (list.length !== finalWallets.length) {
                    console.log("LEN WRONG!", list.length, finalWallets.length, list, finalWallets);
                }
                for (let i = 0; i < finalWallets.length % maxLen; i++) {
                    const wallets = finalWallets.slice(maxLen * i, Math.min(finalWallets.length, maxLen * (i + 1)))
                    await sendSpam(wallets);
                }
            }



        } catch (e) {
            console.error(`SPAMMER THREAD ERROR!\n${e}`);
            await sleep(10000);
        }
    } while (true);
}

async function sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms)).catch(() => null);
}


let url_data: {
    [key: string]: {
        last_check: number
    } | undefined
} = {}
async function getUsersWalletList(urls: string[]) {
    return await Promise.all(urls.map(async url => {
        try {


            const wallet = url.split("/").at(-1);
            if (!wallet) {
                console.error(`Fail to get wallet address of ${url}`);
                return [];
            }
            const fetchUrl = `https://tonapi.io/v2/accounts/${Address.parse(wallet).toRawString()}/events?limit=10&t=${new Date().getTime()}`;

            const data = await tonApiFetch(fetchUrl) as EVENT_API_TYPE

            const urlData = url_data[url];
            let R: Address[] = [];
            for (let event of (data.events || []).reverse()) {
                if (!!urlData && urlData.last_check >= event.timestamp) continue;

                const addresses = event.actions.map(action => action.simple_preview.accounts.filter(o => o.is_wallet).map(o => Address.parseRaw(o.address))).flat();
                R.push(...addresses);
                url_data[url] = {
                    ...urlData,
                    last_check: event.timestamp
                };
            }
            return R;
        } catch (e) {
            console.error(`Spammer[getUserWalletList] error: \n${e}`)
            return [];
        }
    })).then(r => r.flat());
}

export async function getSpammerWallet() {
    const config = getSpammerConfig();
    const privateKey = config.wallet?.split(" ") || [];
    if (!privateKey.length) throw ("SPAM WALLET NOT CONFIGURED");
    const key = await mnemonicToWalletKey(privateKey);
    const wallet = WalletContractV5R1.create({ publicKey: key.publicKey, workchain: 0 });

    return {
        wallet,
        key
    }
}

export async function sendSpam(array: {
    address: Address,
    comment: string
}[]) {
    if (!array.length) return;

    const client = new TonClient({
        endpoint: 'https://toncenter.com/api/v2/jsonRPC',
        apiKey: process.env['TON_API']
    });

    const {wallet,key} = await getSpammerWallet();

    const walletContract = client.open(wallet);
    const seqno = await walletContract.getSeqno();

    await walletContract.sendTransfer({
        secretKey: key.secretKey,
        seqno,
        messages: array.map(o => internal({
            to: o.address,
            value: "0",
            body: o.comment,
            bounce: false
        })),
        sendMode: SendMode.PAY_GAS_SEPARATELY
    });

    let currentSeqno = seqno;
    let n = 0;
    console.log(`waiting for transaction to confirm... ${wallet.address.toString({
        bounceable: false
    })}`);
    const transactionTimeout = "50"
    while (currentSeqno == seqno) {
        await sleep(2000);
        currentSeqno = await walletContract.getSeqno().catch(() => currentSeqno);
        n++;
        if (n > ((+transactionTimeout || 30) / 2)) throw (`Transaction timeout!`)
    }
    console.log(`SPAM SENT TO ${array.length} wallets`);
}


type EVENT_API_TYPE = {
    events: Array<{
        event_id: string
        account: {
            address: string
            is_scam: boolean
            is_wallet: boolean
        }
        timestamp: number
        actions: Array<{
            type: string
            status: string
            TonTransfer: {
                sender: {
                    address: string
                    is_scam: boolean
                    is_wallet: boolean
                }
                recipient: {
                    address: string
                    is_scam: boolean
                    is_wallet: boolean
                    name?: string
                    icon?: string
                }
                amount: number
                comment?: string
            }
            simple_preview: {
                name: string
                description: string
                value: string
                accounts: Array<{
                    address: string
                    name?: string
                    is_scam: boolean
                    icon?: string
                    is_wallet: boolean
                }>
            }
            base_transactions: Array<string>
        }>
        is_scam: boolean
        lt: number
        in_progress: boolean
        extra: number
    }>
    next_from: number
}
