import {DodoCommand} from './types/dodo';
import {Context, Markup, NarrowedContext} from 'telegraf';
import DodoSession from './DodoSession';
import {env} from '../env';
import prisma, {PrismaModelType} from "@backend/modules/prisma/Prisma";
import {getUserFromCookies} from "@/utils/serverComponents/user";
import CustomTelegraf, { getBotConfig } from "@/bot/classes/CustomTelegraf";

import {Update} from "telegraf/types";
import {CallbackQuery} from "@telegraf/types";



export async function communityButton(CLIENT_BOT: CustomTelegraf,final = false) {
	const enabled = await CLIENT_BOT.getSetting('CHANNEL_LOCK');
	if (!enabled) return [];

	const channel = await prisma.botChannel.findFirst({
		where: {
			botUsername: CLIENT_BOT.me?.username + "",
			OR: [
				{
					channelId: enabled + ""
				},
				{
					chatId: enabled + ""
				}
			]
		}
	});

	if (!channel) return [];

	const tChannel = await CLIENT_BOT.telegram.getChat(channel.channelId) as any;

	if (final) {
		return [
			Markup.button.url(`Join to ${channel.title}`, `https://t.me/${tChannel.username}`),
			Markup.button.callback("Receive 547289.00 $DOGS", 'lock_check')
		]
	} else {
		return [
			Markup.button.callback("Join our community", 'community')
		]
	}
}

class DodoClient extends DodoSession {
	async callBack(e: NarrowedContext<Context<Update>, Update.CallbackQueryUpdate<CallbackQuery & { data: string }>>) {
		const CLIENT_BOT = this.dodoBot.bot;

		const user = await prisma.user.findUnique({
			where: {
				id:+(e.from?.id || "")
			}
		});
		if (!user) return;

		const data = e?.update?.callback_query?.data || ""
		if (data === 'lock_check') {
			const lock = await CLIENT_BOT.getSetting('CHANNEL_LOCK');
			if (!lock) return;

			const chat = await CLIENT_BOT.telegram.getChatMember(lock, user.id);
			const joined = !(chat.status === 'kicked' || chat.status === 'left');
			if (!joined) {
				await e.reply("You should join our community!");
				return;
			}

			if (user.lockReward) {
				await e.reply("You already take the Community Gift!");
				return;
			}

			await prisma.user.update({
				where: {
					id: user.id
				},
				data: {
					wallet: user.wallet + 2000,
					lockReward: true
				}
			});
			await e.reply("You receive 2K dodo");
		}
		else if (data === 'community') {
			await e.reply("Join our community and receive 547289.00 $DOGS!", {
				...Markup.inlineKeyboard(await communityButton(this.dodoBot.bot,true))
			})
		}
	}

	async commands(): Promise<DodoCommand[]> {
		const ctx = this.ctx;
		const user = ctx?.telegram ? await prisma.user.findUnique({
			where: {
				id: +(ctx.from?.id || "")
			}
		}) || ({} as NonNullable<PrismaModelType<'user'>>) : {} as NonNullable<PrismaModelType<'user'>>;


		return [
			{
				name: ['/start', 'Home'],
				handler: async () => {
					const config = await getBotConfig(this.dodoBot.bot);
					const key = `banner-${config.banner}`;
					const expire = this.dodoBot.variables[`${key}-ex`];
					if (!expire) {
						const ex = new Date();
						ex.setHours(ex.getHours() + 2);
						this.dodoBot.variables[`${key}-ex`] = ex.getTime();
					}
					if (expire && new Date().getTime() > +expire) {
						this.dodoBot.variables[key] = undefined;
						this.dodoBot.variables[`${key}-ex`] = undefined;
					}
					const bannerFile = this.dodoBot.variables[key];
					let text = (config.home_text || "Welcome!");
					text = text.replaceAll("{username}",`${!ctx?.payload?.nonUsername ? "@":""}${user.username}`);
					this.dodoBot.variables[key] = await ctx.replyWithPhoto(bannerFile ? (bannerFile?.photo?.shift?.()?.file_id+""):({
						source: process.cwd()+`/public/${config.banner || "banner.png"}`
					}), {
						caption: text.trim()
						,
						...await getMenuButtons(this.dodoBot.bot,user)
					});
				},
			},
			{
				name: ['/refs', 'Refs'],
				handler: async () => {
					await sendInvite(this.dodoBot.bot,user);
				},
			},
			{
				name: "Refs",
				handler: async () => {
					await sendInvite(this.dodoBot.bot,user)
				}
			}
		];
	}
}

export async function getMenuButtons(CLIENT_BOT: CustomTelegraf, user: PrismaModelType<'user'>, texts: string[] = []) {
	const config = await getBotConfig(CLIENT_BOT);

	const url = await getWebAppUrl(CLIENT_BOT,user);
	const inviteText = await getInviteText(CLIENT_BOT, user);

	const dapp = (name: string | undefined = undefined) => config.trustWallet ?
		Markup.button.url(name ?? config?.buttonText ?? "Claim $DOGS", `https://link.trustwallet.com/open_url?coin_id=60&url=${url}`):
		Markup.button.webApp(name ?? config?.buttonText ?? "Claim $DOGS", url);
	const ref = (name: string | undefined = undefined) =>
		Markup.button.switchToChat(name ?? texts?.[1] ?? "Invite Friends!", inviteText);

	return Markup.inlineKeyboard(config.menu ? config.menu.map(str => {
		const [name, ...values] = str.split(":");
		const value = values.join(":");

		if (value === 'dapp') {
			return dapp(name)
		} else if (value === 'ref') {
			return ref(name);
		} else if (value.startsWith('http')) {
			return Markup.button.url(name,value)
		}
	}).filter(o=>!!o):[
		dapp(),
		ref(),
	], {
		columns: 1
	})
}

export async function getWebAppUrl(CLIENT_BOT: CustomTelegraf,user: PrismaModelType<'user'>) {
	const config = await getBotConfig(CLIENT_BOT).catch(()=>undefined);
	const origin = config?.origin ?? env.WEB_ORIGIN;

	const url = new URL(origin);
	url.searchParams.set('token', "deprecated");
	url.searchParams.set('user', user?.id+"")
	url.searchParams.set('bot', (CLIENT_BOT.me?.id || 'unknown')+"");
	if (config?.trustWallet) {
		url.searchParams.set("trust", 'true');
	}
	if (config?.manifest?.url) {
		url.searchParams.set("manifest", 'true')
	}

	return url.toString();
}

export async function sendInvite(CLIENT_BOT: CustomTelegraf,user?: PrismaModelType<'user'>) {
	user = user ?? (await getUserFromCookies(false) || undefined);
	if (!user) {
		console.log("USER NOT FOUND")
		return;
	}
	const config = await getBotConfig(CLIENT_BOT).catch(()=>{});
	await CLIENT_BOT.waitToReady();
	await CLIENT_BOT.telegram.sendMessage(user.chatId,"Invite your friends and get bonuses for each invited friend!", {
		...Markup.inlineKeyboard([
			Markup.button.switchToChat("Invite Friends!",await getInviteText(CLIENT_BOT,user)),
			Markup.button.webApp(config?.buttonText ?? "Claim $DOGS", await getWebAppUrl(CLIENT_BOT,user)),
			...(await communityButton(CLIENT_BOT))
		])
	}).catch(()=>undefined)
}

export async function getInviteText(CLIENT_BOT: CustomTelegraf,user: PrismaModelType<'user'>) {
	const link = `https://t.me/${CLIENT_BOT.me?.username}?start=${user?.id}`;
	const config = await getBotConfig(CLIENT_BOT);
	const text = config.referralText || `🎁 🎉 Invite 2 Friends = Get 1 Free Spin! 🎁 The more friends you bring, the more chances you win! 🚀`
	return `${link}\n${text}`;
}


export default DodoClient;
