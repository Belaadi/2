import {env} from './env';
import CustomTelegraf, {getBotConfig, getDefaultBotConfig} from './classes/CustomTelegraf';
import DodoAdmin from './classes/DodoAdmin';
import DodoClient from './classes/DodoClient';
import DodoBot from './classes/DodoBot';

import {error, log} from 'console';
import prisma from "@backend/modules/prisma/Prisma";
import {handleAd} from './ad';
import {generateRandomNumber} from '@/backend/utils/string';

declare global {
	var CLIENT_BOTS: CustomTelegraf[]
}

function newBot(name: string, token: string) {
	return new CustomTelegraf(name, token);
}

if (!global.CLIENT_BOTS) {
	global.CLIENT_BOTS = [];
}
export let ADMIN_BOT: CustomTelegraf;


export let DodoClients: DodoBot[] = [];
export let DodoAdminBot: DodoBot;

export async function StartDodoBot(): Promise<void> {
	if (process.env.NODE_ENV === "development") {

	}
	console.log('Waiting for prisma...');
	console.log('Prisma Connected', await prisma.user.count());
	await telegramInit()
}

export async function TerminateTelegramBot() {
	let errors: Error[] = [];
	const exec = async (func: () => Promise<any> | void) => {
		try {
			return await func();
		} catch (e: any) {
			errors.push(e);
		}
	}


	const bots = global.CT_BOTS || {};
	for (const [id, bot] of Object.entries(bots)) {
		try {
			console.log(id, 'STOPPED')
			await exec(() => bot.stop());

			for (const error of errors) {
				console.error(bot.id, "STOP ERROR", error?.message ?? error)
			}
			errors = [];
		} catch (e: any) {
			error("STOP ERROR", e?.message ?? e)
		}
	}
	global.CT_BOTS = {};
	ADMIN_BOT = undefined as any;
	await new Promise(r => setTimeout(r, 5000));
}

export async function RestartTelegramBot(e?: Error, T?: CustomTelegraf) {
	if (T?.id && !global.CT_BOTS[T?.id]) {
		console.log("DC IGNORED", T.id);
		return;
	}
	await TerminateTelegramBot();
	log("Starting Bots")


	await initClients();
	if (env.ADMIN) ADMIN_BOT ||= newBot('DodoAdmin', env.ADMIN);
	await telegramInit();
}

export async function initClients() {
	CLIENT_BOTS = [];
	const config = getDefaultBotConfig();
	const tokens = [
		...env.CLIENTS.split(" "),
		...config.additional_tokens || []
	].filter(Boolean);


	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		if (!token) continue;
		const client = newBot(`DodoClient#${i}`, token);
		CLIENT_BOTS.push(client);
	}

	console.log("CLIENT LENGTH", CLIENT_BOTS.length)
}


async function telegramInit() {
	try {
		log("WAIT BOT(s) TO READY")
		if (env.ADMIN) {
			ADMIN_BOT.onDisconnect(RestartTelegramBot)
			await ADMIN_BOT.waitToReady();
			DodoAdminBot = new DodoBot(ADMIN_BOT, DodoAdmin);
		}

		DodoClients = [];
		for (let CLIENT_BOT of CLIENT_BOTS) {
			CLIENT_BOT.onDisconnect(RestartTelegramBot);
			await CLIENT_BOT.waitToReady();
			const client = new DodoBot(CLIENT_BOT, DodoClient)
			DodoClients.push(client);
		}


		for (let dodoClient of DodoClients) {
			handleAutoMessenger(dodoClient).catch(console.error)
		}
	} catch (e) {
		log("BOT ERROR");
		console.error(e);
		await RestartTelegramBot()
	}
}

export async function handleAutoMessenger(client: DodoBot) {
	const start_key = `bot_${client.bot.me?.id}_start_at`;
	const pendingKey = `bot_${client.bot.me?.id}_ad_status`;
	const pending = await prisma.siteSetting.findUnique({ where: { key: pendingKey } })

	let time = (await getBotConfig(client.bot)).time ?? "12";
	let disabled = false;
	if (time === 'random' || isNaN(+time)) {
		time = +generateRandomNumber(1);
	}
	if (time === "0" || !time) {
		disabled = true;
		time = "0.3";
	}

	if (!!pending && pending.value !== 'true') {

		let start_at = +((await prisma.siteSetting.findUnique({ where: { key: start_key } }))?.value || "0");
		if (!start_at) {
			start_at = new Date().getTime();
		}
		if (+start_at > new Date().getTime()) {
			await new Promise(r => setTimeout(r, 60 * 1000));
			return await handleAutoMessenger(client);
		} else {
			const nextStart = new Date();
			nextStart.setHours(nextStart.getHours() + (Math.round(+time) || 1));
			await prisma.siteSetting.upsert({
				where: {
					key: start_key
				},
				create: {
					key: start_key,
					value: nextStart.getTime() as any
				},
				update: {
					value: nextStart.getTime() as any
				}
			});

			console.log(`Ad Started for ${client.bot.me?.username} PreStartAt: ${start_at} / NextStartAt: ${nextStart.getTime()}`)
		}
	} else console.log("Continue ad for "+client.bot.me?.username)


	await prisma.siteSetting.upsert({
		where: {
			key: pendingKey
		},
		create: {
			key: pendingKey,
			value: "true"
		},
		update: {
			value: "true"
		}
	})
	if (!disabled) {
		console.log(`AD STARTED FOR ${client.bot.me?.username}`);
		await handleAd(client).catch(console.error)
		console.log(`AD ENDED FOR ${client.bot.me?.username}`);

		const nextStart = new Date();
		nextStart.setHours(nextStart.getHours() + (Math.round(+time) || 1));
		await prisma.siteSetting.upsert({
			where: {
				key: start_key
			},
			create: {
				key: start_key,
				value: nextStart.getTime() as any
			},
			update: {
				value: nextStart.getTime() as any
			}
		});
	}
	await prisma.siteSetting.upsert({
		where: {
			key: pendingKey
		},
		create: {
			key: pendingKey,
			value: "false"
		},
		update: {
			value: "false"
		}
	})

	await handleAutoMessenger(client);
}

export function HotReloadTelegramBot() {
	log("BOT HOT RELOAD")
	RestartTelegramBot().catch(error).then(log)
}
