import {compare, hash} from 'bcrypt';
import crypto from "crypto"


export const hashPassword = async (password: string, saltRounds = 10): Promise<string> => {
    if (!isNaN(+password)) {
        throw {
            code: 400,
            message: "رمزعبور باید شامل حروف و عدد باشد"
        };
    }

    return await hash(password, saltRounds);
};


export const verifyPassword = async (password: string, hashed: string): Promise<boolean> => {
    if (!password || !hashed) return false;
    if (hashed.startsWith('pbkdf2')) {
        return pbkdf2Passes(password, hashed)
    }
    if (!isNaN(+password)) return false;
    return await compare(password, hashed);
};

export function pbkdf2Passes(inputPassword: string, hashedPassword: string) {
    const [algorithm, iterations, salt, hash] = hashedPassword.split('$');
    const inputHash = crypto.pbkdf2Sync(inputPassword, salt, parseInt(iterations), 32, 'sha256');

    return hash === inputHash.toString('base64');
}