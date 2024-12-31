import {NextResponse} from "next/server";

export function response(body: any, status = 200) {
    return NextResponse.json(body, { status });
}

export function error(body: string | any, status = 400) {
    if (typeof body === 'string') {
        body = {
            message: body,
        }
    }
    return response(body, status);
}

export function msg(body: string | any, status = 200) {
    return error(body, status);
}