export function generateRandomNumber(length: number = 6, notZeroFirst = true): string {
    let result = '';
    const characters = '0123456789';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        const n = characters[randomIndex];
        if (n === '0' && notZeroFirst && i === 0) continue;
        result += n;
    }

    return result;
}

export function generateRandomString(length: number = 10) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomString = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        randomString += charset.charAt(randomIndex);
    }

    return randomString;
}
