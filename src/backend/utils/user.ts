import prisma, {PrismaModelType} from "@backend/modules/prisma/Prisma";
import {User} from "@prisma/client";
import {NextRequest} from "next/server";
import {ssrOptimize} from "@/utils/other";
import {headers} from "next/headers";


export function getToken(request: NextRequest) {
  const headers = Object.fromEntries(request.headers);
  return (
    headers?.authorization?.split?.(" ")?.pop?.() ||
    headers?.token ||
    headers?.login ||
    request.cookies.get("token")?.value ||
    request.cookies.get("admin_token")?.value
  );
}

export async function getUser(token?: string | NextRequest | undefined, clientSide = true) {
  if (token && typeof token !== "string") {
    token = getToken(token);
  }
  if (!token) {
    return null;
  }
  const user = (await prisma.user.findUnique({ where: { token: token+"" } }));
  if (!user) return null;
  return (clientSide ? ssrOptimize(user):user) as unknown as PrismaModelType<'user'>;
}


export function getClientIp() {
	const header = headers()
	return (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]
}
