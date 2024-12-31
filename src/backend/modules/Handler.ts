import {NextFetchEvent, NextRequest} from "next/server";
import {$_POSTType, force$_POST} from "@backend/utils/request";
import {error, msg, response} from "@backend/utils/response";
import {getUser} from "@backend/utils/user";
import {isHTTPMethod} from "next/dist/server/web/http";

class Handler {
	// @ts-ignore
	request: NextRequest;
	// @ts-ignore
	fetch: NextFetchEvent;
	// @ts-ignore
	requestCloned: NextRequest;
	json: {
		[key: string | symbol]: any;
	} = {};
	status = 200;

	async initialize() {
		try {
			// @ts-ignore
			this.requestCloned = this.request.clone();
			// @ts-ignore
			this.requestCloned.nextUrl = this.request.nextUrl;
		} catch (e) {

		}
		const type = this.request.headers.get('content-type')

		if (type && !type.includes('json')) {
			const formData = await this.request.formData().then();
			formData.forEach((value, key) => {
				this.json[key] = value;
			})
		} else {
			try {
				this.json = (await this.request.json()) ?? {};
			} catch {

			}
		}
		const additional = await this.additionalPayload();
		if (!!Object.keys(additional).length) {
			this.json = {
				...this.json,
				...additional
			}
		}
	}

	$_POST<T>(json: $_POSTType<T, any>) {
		let body = this.json ?? {};
		return force$_POST<T, typeof body>(json, body);
	}

	get(key: symbol | string, msg: string | null = null) {
		const value = this.json?.[key] ?? this.request.nextUrl.searchParams.get(key as string);
		if (!value && !!msg) {
			throw {
				code: 400,
				message: msg + " وارد نشده است",
				additional: {
					key
				}
			};
		}
		return value;
	}

	getRequest() {
		return this.request;
	}

	getFetchEvent() {
		return this.fetch;
	}

	async attachRequest(
		request: NextRequest,
		fetch: NextFetchEvent,
	): Promise<any> {
		this.request = request;
		this.fetch = fetch;
		await this.initialize();
		let response = (await this.handler(this.request.method)) ?? {};
		let additional: any = {};
		let hasAdditionalData = !!response?.additional?.data;

		if (hasAdditionalData) {
			additional = response?.additional;
			response = response.additional?.data;
			delete additional.data;
		}

		if (this.waitForModelAsyncFunctions()) {
			let isArray = Array.isArray(response);
			response = isArray ? response : [response];

			response = await Promise.all((
				response.map(async (response: any) => {
					const keys = Object.keys(response).filter(key => (response[key]?.constructor?.name === "AsyncFunction" || response[key]?.constructor?.name === "Promise") && !response[key]?.length);

					await Promise.all((
						keys.map(async key => {
							let func = response[key];
							if (typeof func !== 'function') func = await func;
							response[key] = typeof func === 'function' ? await func() : await func;
						})
					))

					return response;
				})
			));

			if (!isArray) response = response[0]
		}

		if (hasAdditionalData) {
			response = {
				additional: {
					...additional,
					data: response
				}
			}
		}

		return response;
	}

	response(json: any, status = 200) {
		return response(json, status);
	}

	error(msg: string | any, status = 400) {
		return error(msg, status);
	}

	msg(text: string) {
		return msg(text);
	}

	async handler(method: string): Promise<any> {
		try {
			if (!isHTTPMethod(method)) {
				this.methodDeny();
			}
			// @ts-ignore
			const func = this?.[method];
			if (!func) {
				this.methodDeny();
			}
			return await func.bind(this)();
		} catch (e) {
			const cName = e?.constructor?.name;
			if (!!cName && cName !== 'String' && cName !== 'Object') {
				console.log(cName, e);
				throw (await this.onError(e))
			}
			throw (e);
		}
	}

	async onError(e: any) {
		return e;
	}

	async getUser() {
		return getUser(this.request);
	}

	waitForModelAsyncFunctions() {
		return false;
	}

	async additionalPayload(): Promise<{ [key: symbol | string]: any }> {
		return {}
	}

	POST() {
		this.methodDeny();
	}

	GET() {
		this.methodDeny();
	}

	async PUT(...args: any[]): Promise<any> {
		this.methodDeny();
	}

	PATCH() {
		this.methodDeny();
	}

	DELETE() {
		this.methodDeny();
	}

	methodDeny() {
		throw ({
			message: "Method Not Allowed",
			code: 405
		})
	}
}

export default Handler;
