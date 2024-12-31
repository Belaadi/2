import * as fs from "fs";
import * as process from "process";

export async function createFile(file: File, filePath: string) {
    const arr = await file.arrayBuffer();
    const uint8View = new Uint8Array(arr);
    return fs.writeFileSync(filePath, uint8View)
}

export async function updateFile(file: File, previousPath: string, newPath: string): Promise<string> {
    const apiPath = "/api/file"
    const baseUploadUrl = "/backend/uploaded";

    previousPath = previousPath.replace(apiPath, baseUploadUrl);

    const cwd  = process.cwd().replaceAll("\\","/");
    const uploadPath = cwd+"/public"+baseUploadUrl;

    const checkDelete = previousPath.includes(baseUploadUrl);
    let targetLocation = newPath.replace(baseUploadUrl,"");


    // Create Target Location's folder
    const paths = targetLocation.split("/");
    const recursivePath = paths.slice(0,-1).join("/");
    const finalRPath = uploadPath+recursivePath;
    if (!fs.existsSync(finalRPath)) {
        fs.mkdirSync(finalRPath, {recursive: true});
    }

    //Parse $EX in Target Location
    if (targetLocation.includes("$EX")) {
        const nameAr = file.name.split(".");
        const ex = nameAr[nameAr.length - 1];
        targetLocation = targetLocation.replace("$EX", ex);
    }

    // Delete Previous File
    const absolutePrePath = cwd+"/public"+previousPath;
    if (checkDelete && fs.existsSync(absolutePrePath)) {
        fs.unlinkSync(absolutePrePath);
    }

    const finalNewPath = uploadPath+targetLocation;
    await createFile(file, finalNewPath);

    let final = baseUploadUrl+targetLocation;
    final  = final.replace(baseUploadUrl, apiPath);
    return final;
}
