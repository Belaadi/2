import {Prisma, PrismaClient} from "@prisma/client";
import {BasicSchemaInformation} from "@backend/modules/Schema";


declare const global: {
	instance: PrismaClient
}

const instance: PrismaClient = global?.instance ?? new PrismaClient();
global.instance = instance;

function prop<T>(value: T) {
	return {
		needs: {},
		compute: () => value
	}
}

const prisma = instance.$extends({
	result: {
		user: {
			token: {
				needs: {
					token: true
				},
				compute: ({token})=>(sec = true)=>token
			}
		}
	},
	model: {
		$allModels: {
			async by<T>(this: T, key: string, value: string): Promise<T> {
				const context = Prisma.getExtensionContext(this) as any;
				return context.findFirst({where: {[key]: value}});
			}
		}
	},
});

//@ts-ignore
export type PrismaModelType<T extends keyof typeof prisma> = Awaited<ReturnType<(typeof prisma[T])['findFirst']>>

export function PrismaDefinitions() {
	return BasicSchemaInformation;
}


export default prisma;
