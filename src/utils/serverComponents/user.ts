"use server";

import {cookies, headers} from "next/headers";
import prisma from "@backend/modules/prisma/Prisma";
import {getUser} from "@backend/utils/user";

export async function getUserFromHeaders(token2: string | undefined = undefined) {
	const token = headers().get('Authorization')?.split?.(" ")?.pop?.();
	if (!token) return null;
	return getUser(token);
}


export async function getUserFromCookies(clientSide = true) {
	const token = cookies().get('token')?.value;
	if (!token) return undefined;
	return getUser(token,clientSide);
}
