import {Prisma} from "@prisma/client";
import {Unknown} from "@/utils/safeState";


const datamodel = Prisma?.dmmf?.datamodel;


const PrismaSchemaGenerated = datamodel?.models?.map(model => {
  return {
    ...model,
    fields: model.fields.map(field => {
      let info: any = handlePrismaModuleDocumentation(field?.documentation);

      return {
        ...field,
        info
      };
    })
  }
});

export function handlePrismaModuleDocumentation(documentation: string | undefined) {
  let info: Unknown = {};
  const docs = documentation;
  if (docs) {
    const lines: string[] = docs.split("\n").map(s => s.split("\n")).flat().map(s => s.split("\\n")).flat();
    lines.map(str => {
      const args = str.split("@")?.[1]?.split(" ");
      const key = args?.[0];
      if (!key) return;
      let value = args.slice(1).join(" ");
      if (key && value) {
        try {
          value = JSON.parse(value);
        } catch {
        }
        // @ts-ignore
        info[key] = value;
      }
    })
  }

  return info;
}

export default PrismaSchemaGenerated;
