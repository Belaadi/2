import {HTTP_METHOD} from "next/dist/server/web/http";

type KeyOnly<T> = {
    [K in keyof T]: any
} | {}

type bodyType = {
    [key: string]: any
} | FormData

export default async function api<T = bodyType, R = any>(path: string, data: KeyOnly<T> = {}, method: HTTP_METHOD = "POST") {
    // @ts-ignore
    const isSilent = !!data?._silent || !!data?.__silent;
    try {


        const response = await fetch("/api" + path, {
            method,
            ...(method !== "GET" && {body: (data instanceof FormData ? data : JSON.stringify(data))}),
        });
        const json = await response.json();
        if (!json.ok) {
            throw(json);
        }
        return json as {data: R, ok: boolean, total?: number, message?: string};
    } catch (e: any) {
        if (!isSilent) alert(e?.message ?? e);
        throw(e);
    }
}

export async function uploadFile(file: File, path: string): Promise<string> {
    const formData = new FormData();
    formData.set('file', file);
    formData.set('path', path);
    const res = await api("/core/upload",formData, "POST");

    return res?.data?.path;
}
