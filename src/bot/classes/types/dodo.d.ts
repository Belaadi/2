import { Context, NarrowedContext } from 'telegraf';
import { Message, Update } from 'telegraf/typings/core/types/typegram';
import {defaultConfigType} from "@/bot/classes/types/config";

export type DodoCommand = {
	name: string | string[],
	handler: ((ctx: TheMessageContext) => Promise) | (() => (string[])),
	menu?: string[]
}


export type PhotoMedia = {
	file_id: 'XXXX',
	file_unique_id: 'YYYY',
	file_size: 64202,
	width: 606,
	height: 1280
};

export type BotConfigType = Partial<defaultConfigType & {
	[k: string]: any
}>

export type TheMessageContext =
	(NarrowedContext<Context<Update>,
		{
			message:
				(Update.New & Update.NonChannel & Message.TextMessage)
				& ({ photo?: PhotoMedia[], caption?: string }),
			update_id: number
		}>) & {
	payload?: {
		[key: string]: any
	}
}
