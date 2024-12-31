import {Prisma} from "@prisma/client";
import {PrismaDefinitions} from "@backend/modules/prisma/Prisma";
import {SchemaFieldNames} from "@backend/modules/Schema";
import PrismaSchema from "../../../prisma/PrismaInfo";
import ModelName = Prisma.ModelName;
import {arabicToEnglishNumber} from "@/utils/other";


export type $_POSTType<T,B> = {
    [key in keyof T]: string | {
        name: string,
        keys?: string[],
        required?: boolean,
        errorMsg?: string,
        get?: (body: B)=>any
    }
}

export async function $_POST<T,B>(json: $_POSTType<T,B>, request: Request) {
    return force$_POST(json, await request.json());
}

export function generateModulePostJson(name: keyof typeof ModelName, required: boolean) {
    const list = PrismaDefinitions()[name]?.required ?? [];

    // @ts-ignore
    const fields = Prisma?.[name+"ScalarFieldEnum"] ?? {};


    return Object.fromEntries(

        Object.entries(fields).map(([key, value])=>{
            const fieldName = PrismaSchema.find(m => m.name.toLowerCase() === name?.toLowerCase())?.fields?.find(f => f.name.toLowerCase() === key+"")?.info?.name;
            return [
                key,
                {
                    required: list.includes(key) && required,
                    name: fieldName ?? SchemaFieldNames[key]
                }
            ]
        })
    );
}
export function force$_POST<T, B>(json: $_POSTType<T,B>, body: B): { [k in keyof T]: k extends keyof B ? B[k] : any } {
    let R: any = {};

    for (let key in json) {
        const jValue = json[key];

        const defaultGet = (body: any)=>{
            let ignored = ['name', 'description', 'title', 'content','id'];

            for (let k of keys) {
                const v = body[k];
                if (typeof v !== 'undefined') {
                    if (!!ignored.find(s => k.toLowerCase().includes(s)) || typeof v === 'boolean') {
                        return v;
                    }
                    const n = +v;
                    return isNaN(n) || ((v+"").startsWith("0") && (v+"").length !== 1) ? v:n;
                }
            }
        }

        const {get = defaultGet, name, keys  = [key], errorMsg = "وارد نشده است",required = true} = typeof jValue === 'string' ? {
            name: jValue,
        }:jValue;

        let value = get(body);

        if (typeof value === 'undefined' && required) throw({
            message: name+" "+errorMsg,
            code: 400,
            additional: {
                key: keys.join(" || ")
            }
        });

        R[key] = typeof value === 'string' ? arabicToEnglishNumber(value):value;
    }
    return R;
}
