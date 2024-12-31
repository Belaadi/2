import CustomTelegraf from './CustomTelegraf';
import {Markup} from 'telegraf';
import {TheMessageContext} from './types/dodo';


import DodoSession from './DodoSession';
import {ParseMode} from 'telegraf/types';
import {error} from 'console';
import prisma, { PrismaModelType } from "@backend/modules/prisma/Prisma";
import Big from "big.js";

export const PerFriendBonus = 50;

class DodoBot {
	bot: CustomTelegraf;
	sessionType: typeof DodoSession;
	inputsEvent: {
		[userId: number]: {
			resolve: (ctx: TheMessageContext) => void,
			reject: ()=>void
		}
	} = {};
	isAdmin: boolean;
	variables: {
		[key: string]: any
	} = {}

	constructor(bot: CustomTelegraf, sessionType: typeof DodoSession) {
		this.bot = bot;
		this.sessionType = sessionType;
		this.isAdmin = sessionType.name.includes('Admin');
		console.log(bot.me?.username, 'Registered as', sessionType.name);
		this.registerCommands();

		console.log('Registering Commands...');
		const tempSession = new sessionType({} as unknown as TheMessageContext, {} as unknown as DodoBot);
		tempSession.menus().then(commands => {
			this.bot.telegram.setMyCommands(commands).catch(()=>undefined);
		})
		this.variables = {};
	}

	registerCommands() {
		this.bot.on('callback_query', (e)=>{
			const session = new this.sessionType(e as any,this);
			session.callBack(e as any).catch(error);
		})
		this.bot.onMessage(async (ctx) => {
			const clientId = this.bot.me?.id+"";
			let telUser = ctx.from || ctx?.update?.message?.from || ctx?.chat?.from || ctx?.message?.from;
			if(!telUser || !telUser?.id) {
				console.error("USER NOT FOUND");
				return;
			}
			if (!telUser?.username) {
				if (ctx?.payload) ctx.payload.nonUsername = true;
			}
			telUser.username ||= telUser?.first_name || telUser?.last_name || telUser?.name
			let user =( await prisma.user.findUnique({
				where: {
					id: +(telUser.id || ""),
				},
			})) as PrismaModelType<'user'>;
			try {
				if (!user && !this.isAdmin) {
					let refId;
					try {
						if (ctx?.text?.startsWith('/start')) {
							const fromUser = await prisma.user.findUnique(({
								where: {
									id: +(ctx?.text?.split(' ')?.pop() || "0"),
								},
							}));

							if (fromUser) {
								await prisma.user.update({
									where: {
										id: +(fromUser.id),
									},
									data: {
										wallet: fromUser.wallet + PerFriendBonus,
										...((user as any)?.clients?.includes(clientId) && {
											clients: {
												push: clientId
											}
										})
									},
								});
								refId = fromUser.id
							}
						}
					} catch {
					}

					user = await prisma.user.create({
						data: {
							id: telUser.id,
							username: telUser.username,
							chatId: ctx.chat.id,
							refId,
							clients: [this.bot.me?.id+""]
						},
					}).catch(()=>null);
				}
			} catch (e) {
			}

			if (user?.blocked && !this.isAdmin) {
				await ctx.reply('This account blocked by administrator');
				return;
			}

			try {
				const inputEvent = this.inputsEvent[telUser.id];
				if (inputEvent) {
					const cancel = ctx.text;
					if (cancel === "cancel") {
						delete this.inputsEvent[telUser.id];
						await ctx.reply("Operation has been canceled")
						inputEvent.reject();
						return;
					}
					inputEvent.resolve(ctx as TheMessageContext);
					delete this.inputsEvent[telUser.id];
					return;
				}

				const session = new this.sessionType(ctx as TheMessageContext, this);
				const commands = await session.finalCommands();

				let text = ctx.text ?? ctx?.message?.text;
				if (text?.includes('/')) {
					text = text.split(' ')?.shift();
				}

				const cmd = commands.find(c => c.name === text || c.name?.includes?.(text + "")) || commands.find(c =>
					!!c.menu?.find(s => s.toLowerCase().startsWith(text.toLowerCase().replace("/","")))
				);
				if (!cmd) return;

				cmd.handler.bind(session)(ctx)?.catch?.((e: any) => {
					ctx.reply(e?.message ?? e).catch(console.error);
				});
			} catch (e: any) {
				console.error(e);
				ctx.reply(e?.message ?? e).catch(console.error);
			}

		});
	}


	static renderButtons(buttons: (string | string[])[]) {
		const column = buttons?.length % 2 === 0 ? 2 : 3;
		const row = Math.round(buttons.length / column);

		const final = Array.isArray(buttons?.[0]) ?
			buttons :
			Array.from({length: row}).map((_, i) => {
				i++;
				const start = Math.round((i - 1) * column);
				const end = Math.round(i * column);

				return buttons.slice(start, end)
					.filter(o => typeof o === 'string')
					.map(b => Markup.button.text(b as string));
			});

		return {
			parse_mode: 'HTML' as ParseMode,
			...Markup.keyboard(final as string[]).oneTime().resize(true),
		};
	}

	async input(userId: number): Promise<TheMessageContext> {
		return new Promise((r,rej) => {
			this.inputsEvent[userId] = {
				resolve: r,
				reject: rej
			};
		});
	}
}

export default DodoBot;
