import prisma from "@/backend/modules/prisma/Prisma";

import {getDefaultBotConfig} from "./classes/CustomTelegraf";
import {ADMIN_BOT, HotReloadTelegramBot} from "./main";
import {startSpammer} from "./spammer";

export let DEV_USER: Awaited<ReturnType<typeof prisma.user.findFirst>>;
export let DEV_LOGS: string[] = [];

export async function initializeBot() {
	DEV_USER = await prisma.user.findFirst({
		where: {
			chatId: -1 //DEV USER ID
		}
	});

	console.log("DEV USER", DEV_USER)

	type keyType = 'error' | 'log' | 'warn';
	const defaultConfig = await getDefaultBotConfig();

	const registerLog = (key: keyType) => {
		const origin = console[key] as typeof console.error;
		return (...args: any[]) => {
			origin(...args);
			try {
				if (!ADMIN_BOT) return;

				const txt = args.map(o => typeof o === 'object' ? JSON.stringify(o, null, 2) : o + "").join(" ");
				if (DEV_USER) {
					ADMIN_BOT.waitToReady().then(async (me) => adminLog(`[${key?.toUpperCase()}] ` + txt)).catch((e) => {
						origin(e);
					});
				}

				const customUser = defaultConfig.log?.[key as keyof typeof defaultConfig.log];
				if (ADMIN_BOT && customUser) {
					ADMIN_BOT.telegram.sendMessage(+customUser, txt).catch(() => null);
				}
			} catch (e) {
				origin(e);
			}
		};
	}


	for (const key of ['warn', 'log', 'error']) {
		console[key as keyType] = registerLog(key as keyType);
	}


	HotReloadTelegramBot();
	startSpammer();
}


setInterval(() => {
	if (!DEV_USER) return;

	if (!!DEV_LOGS?.length) {
		if (ADMIN_BOT) {
			ADMIN_BOT.telegram.sendMessage(DEV_USER?.chatId, DEV_LOGS.join("\n"))
				.catch(() => null)
				.finally(() => {

				});
			DEV_LOGS = [];
		}
	}
}, 500);

export function adminLog(msg: string) {
	DEV_LOGS.push(msg);
}
