import {Prisma, PrismaClient} from ".prisma/client";
import ModelName = Prisma.ModelName;
import PrismaAction = Prisma.PrismaAction;

declare global {
    var PRISMA_SETUP: boolean
}
type Type = {
    name: ModelName,
    action: PrismaAction | PrismaAction[],
    event: (payload: any, result?: any)=>Promise<void>
}

let Subscriptions: Type[] = []
let Filters: Type[] = [];

const AddSubscription = (name: ModelName, action: Prisma.PrismaAction | PrismaAction[], event: (obj: any, payload: any)=>Promise<void>)=>{
    Subscriptions.push({
        name,
        action,
        event
    });
}
const AddFilter = (name: ModelName, action: Prisma.PrismaAction | PrismaAction[], event: (payload: any)=>Promise<void>)=>{
    Filters.push({
        name,
        action,
        event
    });
}

const initialize = ()=>{
    Filters = [];
    Subscriptions = [];

    //@ts-ignore
    const instance: PrismaClient = global.instance;
    if (!instance) return;

    instance.$use((async (params, next) => {
        const validateAction = (t: Type) => {
            return (Array.isArray(t.action) ? t.action.includes(params.action):t.action === params.action)
        }

        await Promise.all((
             Filters.map(async filter => {
                 if (filter.name === params.model && validateAction(filter)) {
                     return await filter.event(params.args);
                 }
             })
        ))

        const result = await next(params);

        Subscriptions.map(sub => {
            if (sub.name === params.model && validateAction(sub)) {
                try {
                    sub.event(params.args, result);
                } catch (e: any) {
                    console.log(`Error in ${sub.name}(${sub.action}) Subscribe!`,e?.message ?? e);
                }
            }
        })

        return result;
    }));

    console.log("PRISMA SUBSCRIPTION SETUP");
}
export default async function PrismaSubscription() {
    initialize();
    const owners = ['9397791019']
}
