import prisma from "@/backend/modules/prisma/Prisma";
import { DodoClients } from "./main";

let running = false;
export async function prettifyUser(take = 1000, skip = 0) {
    if (skip === 0 && running) {
        console.log("PRETTIFY ALREADY RUNNING");
        return;
    }

    const total = await prisma.user.count();
    if (total <= skip) {
        console.log("PRETTIFY FINISHED");
        running = false;
        return;
    }
    running = true;
    console.log(`PRETTIFY ${skip}/${total} (${Math.round((take + skip) / total)}%)`)
    const users = await prisma.user.findMany({
        take,
        skip,
        select: {
            id: true,
            chatId: true,
            clients: true,
            username: true
        }
    });
    console.log(`PRETTIFY USER FETCHED ${users.length}`)

    await Promise.all(users.map(async user => {
        const handled = user.clients.filter(Boolean);
        if (!!handled.length) return;
        await Promise.all(DodoClients.map(async client => {
            const clientId = client.bot.me?.id + "";
            if (!clientId || clientId === "undefined" || clientId === 'null' || user.clients.includes(clientId)) return;
            const chat = await client.bot.telegram.getChat(user.chatId).catch(() => undefined);
            if (!!chat && chat.id) {
                user = await prisma.user.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        clients: {
                            push: clientId
                        }
                    }
                })
                return client.bot.me?.username
            }
        }))
    })).catch(console.error)
    
    return prettifyUser(take, skip + take);
}