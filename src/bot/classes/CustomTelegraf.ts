import { Telegraf } from 'telegraf';
import * as console from 'console';
import { UserFromGetMe } from 'telegraf/types';
import {BotConfigType, TheMessageContext} from './types/dodo';
import prisma from "@backend/modules/prisma/Prisma";
import {SettingKey} from "@prisma/client";
import * as fs from "fs";
import * as Path from "path";
import exampleBotConfig from "../../../config/default.json"
import {defaultConfigType} from "@/bot/classes/types/config";
declare global {
	var CT_BOTS: {
		[key: string]: CustomTelegraf
	}
}
if (!global.CT_BOTS) global.CT_BOTS = {};


export default class CustomTelegraf extends Telegraf {
	readyEvents: (typeof this.onReady)[] = [];
	disconnectEvents: (typeof this.onDis)[] = [];
	me: UserFromGetMe | undefined;
	name: string;
	ready: boolean = false;
	id: string;

	constructor(name: string, token: string) {
		super(token);
		this.name = name;
		this.id = name.replaceAll(" ", "_")+`:${Object.keys(global.CT_BOTS).length}:`+Math.random();

		console.log(this.id, 'Initializing', 'Bot');
		this.telegram.getMe().then((me) => {
			this.me = me;
			console.log(me.username,me.id, "READY");
			this.launch(() => {
				this.onReady.bind(this)(me);
			}).catch((e)=>{
				this.onDis.bind(this)(e,this)
			});
		}).catch((e)=>{
			this.onDis.bind(this)(e,this)
		});
		global.CT_BOTS[this.id] = this;
	}

	private onReady(bot: UserFromGetMe) {
		this.me = bot;

		for (const readyEvent of this.readyEvents) {
			try {
				readyEvent(bot);
			} catch (e) {
				console.error(`Error in Ready event[${bot.username}]`);
			}
		}

		const handle = (e: TheMessageContext) => {
			if (e?.chat.type !== 'private') return;
			e.payload = {};

			try {
				return this.event(e);
			} catch (e) {
				console.error(e);
			}
		}
		/*this.on('channel_post', async e => {
			if (true) return;
			await this.waitToReady().then( async (me)=>{
				console.log("POST CREATION",me)
				try {
					await prisma.botChannel.create({
						data: {
							botUsername: me?.username || this.id,
							channelId: e.chat.id+"",
							chatId: e.chat.id+"",
							title: e.chat.title
						}
					}).catch(()=>null)
				} catch (e) {
					console.error(e);
				}
			})
		})*/
		this.on("message", handle);
		this.start(handle as any);
		this.ready = true;
	}

	private onDis(e: Error,t: CustomTelegraf) {
		if (!global.CT_BOTS[this.id]) {
			console.log("Ignored Bot", this.id);
			return;
		}

		console.log(this.id, "Disconnected", e?.message ?? e);
		for (let disconnectEvent of this.disconnectEvents) {
			try {
				disconnectEvent(e, t);
			} catch (e) {
				console.error(e);
			}
		}
		this.disconnectEvents = [];
		delete global.CT_BOTS?.[this.id];
	}

	public onDisconnect(e: (e: Error, T: this) => void) {
		this.disconnectEvents.push(e);
	}

	event: (ctx: TheMessageContext)=>Promise<any> = async ()=>console.log(this.id,"MISS")
	onMessage(func: typeof this.event) {
		this.event = func;
	}

	async waitToReady(): Promise<UserFromGetMe> {
		if (this.me) {
			return this.me;
		}

		return await new Promise(r => {
			this.readyEvents.push((bot) => {
				r(bot);
			});
		});
	}

	async getSetting(key: SettingKey): Promise<string | undefined> {
		const me = await this.waitToReady();
		const record = await prisma.botSetting.findUnique({
			where: {
				botUsername_key: {
					key,
					botUsername:me.username+""
				}
			}
		});

		return record?.value;
	}

	async setSetting(key: SettingKey, value: string) {
		const me = await this.waitToReady();
		const exs = await prisma.botSetting.findFirst({
			where: {
				botUsername: me.username+"",
				key
			}
		});

		const wh = {
			key: key,
			botUsername: me.username+"",
		};
		const v = {
			value
		};
		if (exs) {
			return await prisma.botSetting.update({
				where: {
					id: exs.id,
					botUsername_key: {
						key,
						botUsername: me.username+""
					}
				},
				data: v
			})
		} else {
			return await prisma.botSetting.create({
				data: {
					...wh,
					...v
				}
			})
		}
	}
}

let CACHED: {
	[id: number]: Awaited<ReturnType<typeof getBotConfig>>
} = {};




export async function getBotConfig(client: CustomTelegraf | number, defaultValue = true): Promise<BotConfigType> {
	const defaultConfig = defaultValue ? getDefaultBotConfig():{};
	let id = typeof client === 'number' ? client:undefined;
	if (!id && typeof client !== 'number') {
		await client.waitToReady().catch(console.error);
		id = client.me?.id;
	}
	if (!id) return defaultConfig;

	const cached = CACHED[id]
	if (cached) {
		return cached;
	}

	try {
		const content = fs.readFileSync(Path.join(process.cwd(),'config', `${id}.bot.json`));
		const config = {
			...defaultConfig,
			...JSON.parse(content.toString('utf-8') || "{}") as any
		};
		CACHED[id] = config;
		return config;
	} catch {
		return defaultConfig;
	}
}

export function getDefaultBotConfig(): BotConfigType {
	const cached = CACHED[0];
	if (cached) return cached;

	try {
		const content = fs.readFileSync(Path.join(process.cwd(),'config', `default.json`));
		const config = JSON.parse(content.toString('utf-8') || "{}") as any;
		CACHED[0] = config;
		return config;
	} catch {
		return {};
	}
}

export function setDefaultConfig(config: BotConfigType) {
	const pre = getDefaultBotConfig();
	const path = Path.join(process.cwd(),'config', `default.json`);
	const final = {
		...pre,
		...config
	}
	fs.writeFileSync(path, JSON.stringify(final, null,2));
	CACHED[0] = final;
	return {
		additional_tokens: [],
		custom_templates: [],
		menu: [],
		log: {},
		transaction_comments: {},
		spammer: {
			enabled: false,
			watch_url: [],
			comments: []
		},
		...final
	} as BotConfigType;
}

export async function setBotConfig(client: CustomTelegraf | number, data: BotConfigType) {
	let id = typeof client === 'number' ? client:undefined;
	if (!id && typeof client !== 'number') {
		await client.waitToReady();
		id = client.me?.id;
	}

	const preData = await getBotConfig(client,false);
	const configPath = Path.join(process.cwd(),'config', `${id}.bot.json`);

	const finalData = {
		...preData,
		...data
	};
	CACHED[id!] = finalData;
	fs.writeFileSync(configPath, JSON.stringify(finalData,null,2));

	return finalData;
}
