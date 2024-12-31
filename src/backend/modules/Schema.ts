import PrismaSchema from "../../../prisma/PrismaInfo";
import {Prisma} from "@prisma/client";

export const ModelNames = PrismaSchema?.map(m => m.name) as unknown as Prisma.ModelName


export const BasicSchemaInformation = Object.fromEntries(PrismaSchema
    ?.map(model => ([
            model.name,
            {
                required: model.fields.filter(f => f.isRequired && !f.isId && !f.relationFromFields && !f.hasDefaultValue).map(f => f.name)
            }
        ])
    ) ?? [])

let names: { [key: string | number | symbol]: string } = {};

PrismaSchema?.forEach(m => {
    m.fields.filter(f => !!f.info?.name).map(f => {
        names[f.name] = f.info.name+"";
    })
});

export const SchemaFieldNames = names
