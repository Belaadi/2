import {NextFetchEvent, NextRequest, NextResponse} from "next/server";
import PrismaSubscription from "@backend/modules/prisma/Subscriptions";
import Handler from "@backend/modules/Handler";
import PrismaSchema from "../../../../prisma/PrismaInfo";
import {SchemaFieldNames} from "@backend/modules/Schema";
import {Prisma} from "@prisma/client";

const isFlat = true;

export async function CustomApiHandler(request: NextRequest, fetch: NextFetchEvent) {
	const paths = request.nextUrl.pathname.split("/").slice(2);
	let code = 200;
	let R: any = {};
	let baseRoute = true;
	let response: NextResponse | any = {};
	let access = true;
	let headers = {};
	let additional = {};

	await Promise.all(paths.map(async (path, i) => {
		const fullPath = paths.slice(0,i).join("/")+(i !== 0 ? "/":"")+path;
		let accessHandler: any;
		try {
			accessHandler = (await import('../../../backend/api/' + fullPath + '/access')).default;
		} catch {}

		if (accessHandler) {
			try {
				const accessResult = await accessHandler(request, fetch);

				if (accessResult && accessResult instanceof NextResponse) {
					access = false;
					response = accessResult;
				}
			}catch (e: any) {
				R = handleError(e);
				R.message = e?.message ?? e;
				code = e?.code ?? 403;
				access = false;
			}
		}
	}))

	if (access) {
		try {
			const RouteHandler = (await import('../../../backend/api/' + paths.join("/") + '/handler')).default;
			const constructor: Handler = new RouteHandler();
			baseRoute = false;
			try {
				response = await constructor.attachRequest(request, fetch);
			} catch (e: any) {
				R = handleError(e);
				code = e?.code || 400;
			}
		} catch (e) {
			console.log(e);
		}
	}

	if (access && baseRoute) {
		try {
			const route = await import('../../../backend/api/' + paths.join("/") + '/route');
			try {
				response = await route?.[request.method](request, fetch);
			} catch (e: any) {
				R = handleError(e);
				code = e?.code || 400;
			}
		} catch {
			code = 404;
			response.message = "No Endpoint"
		}
	}

	if (!!response) {
		if (typeof response === 'string') {
			R.message = response;
		} else if (response instanceof Response) {
			if (response?.headers?.get('content-type')?.includes('json')) {
				R = await response.json();
			} else return response;
			code = response.status;
			headers = response.headers;
		} else if (typeof response === 'object' && (Array.isArray(response) || !!Object.keys(response)?.length)) {
			R = response;
		}
	}

	additional = R.additional ?? {};
	const msg = R.message;
	delete R.message;
	delete R.additional;
	delete R.code;
	const obj = Array.isArray(R) ? [...R]:{...R};
	R = {};
	if (!!Object.keys(obj)?.length || Array.isArray(obj)) R.data = obj;
	if (msg) R.message = msg;
	code = +code;
	code = code < 200 || code >= 599 || isNaN(code) ? 500:code;

	R = finalize(R);
	code = R.code ?? code;
	delete R.code;

	const final = {
		...R,
		...additional,
		ok: code < 400
	};
	const finalResponse = (isFlat && final.ok) ? final?.data ?? final:final;

	return NextResponse.json(finalResponse, {status: code, headers});
}

function finalize(originError: any) {
	let R = typeof originError === 'object' ? {...originError}:{}
	const {code = 0, message = ""} = R;

	if (code >= 400 || code < 100) {
		if (message.toLowerCase().includes("prisma")) {
			const args: string[] = message.split("\n") ?? [];
			const last = args?.[args.length - 1] ?? "";
			const arg1 = last.split("`");
			let key = arg1?.[1] ?? "Unknown";

			if (key.includes("_") && key.includes("index")) {
				key = key.split("_")?.[1] ?? key;
			}
			const modelName = args.find(a => a.includes("prisma."))?.split(".")?.[1];
			const sch = PrismaSchema;
			const fieldName = sch.find(m => m.name.toLowerCase() === modelName?.toLowerCase())?.fields?.find(f => f.name.toLowerCase() === key+"")?.info?.name;
			const name = fieldName ?? SchemaFieldNames?.[key] ?? key;

			const expected = arg1?.[arg1?.length - 1]?.split?.(" ")?.[2]?.split(".")?.[0];
			const _enum = Prisma.dmmf.datamodel.enums.find(e => e.name === expected)?.values;
			const shouldBe = _enum?.map?.(e => e.name) ?? expected

			delete R.data;
			R.error = last;
			R.key = arg1?.[1];
			R.shouldBe = shouldBe;

			const isUniqError = last.toLowerCase().includes("unique")
			if (isUniqError) {
				R.message = `${name} Duplicate!`
				delete R.hint;
				R.code = 400;
			} else if (last.toLowerCase().includes("conversion")) {
				R.message = `Failure during converting data type!`
				delete R.hint;
				R.code = 400;
			}  else if (last.toLowerCase().includes("connect")) {
				R.message = "Database Failure!"
			} else {
				R.message = `${name} NoEndpoint!`;
				R.code = 400;
			}
		}
	}
	return R;
}

function handleError(e: any) {
	if (typeof e === 'string') {
		e = {
			message: e
		}
	}
	return e;
}
