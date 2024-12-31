'use server';

import {User} from "@prisma/client";
import {getUserFromCookies} from "@/utils/serverComponents/user";
import prisma from "@backend/modules/prisma/Prisma";


const shopId = "PWYPMh066N7t7GIe";

export type POSCreationResponse = {
	status: string
	result: {
		uuid?: string
		created: string
		address: string
		expiry_date: string
		side_commission: string
		side_commission_service: string
		type_payments: string
		amount: number
		amount_usd: number
		amount_in_fiat: number
		fee: number
		fee_usd: number
		service_fee: number
		service_fee_usd: number
		fiat_currency: string
		status: string
		is_email_required: boolean,
		invoice_status?: string,
		link: string
		invoice_id?: string
		currency: {
			id: number
			code: string
			fullcode: string
			network: {
				code: string
				id: number
				icon: string
				fullname: string
			}
			name: string
			is_email_required: boolean
			stablecoin: boolean
			icon_base: string
			icon_network: string
			icon_qr: string
			order: number
		}
		project: {
			id: number
			name: string
			fail: string
			success: string
			logo: string
		}
		test_mode: boolean
	}
}

let PAYMENTS: {
	[key: string]: User['id']
} = {}

export async function createPosPayment(amount: number) {
	const R = await fetch("https://api.cryptocloud.plus/v2/invoice/pos/create?locale=en", {
		headers: {
			"content-type": "application/json",
		},
		method: "POST",
		body: JSON.stringify({
			"amount": amount,
			"shop_id": shopId,
			"currency": "USD"
		})
	}).then(r=>r.json()).catch((e)=>{
		console.error(e);
		return undefined;
	}) as POSCreationResponse | undefined

	const id = (R?.result.invoice_id || R?.result.uuid)?.split("-")?.at?.(-1);
	if (!id) {
		console.error(`FAILED TO CREATE POS PAYMENT ${amount}`);
		console.error(R);
		return undefined;
	}
	PAYMENTS[id] = (await getUserFromCookies())?.id || -1;

	return await fetch("https://api.cryptocloud.plus/v2/invoice/checkout/confirm", {
		headers: {
			"content-type": "application/json",
		},
		method: "POST",
		body: JSON.stringify({
			"invoice_uuid": id,
			"currency_code": "USDT_ERC20",
			"phone_number": "",
			"customer_invoice_email": ""
		})
	}).then(r=>r.json()).catch(console.error) as POSCreationResponse | undefined
}

export async function checkPosPayment(id: string) {
	const R = (await fetch(`https://api.cryptocloud.plus/v2/invoice/checkout/info?invoice_uuid=${id}`).then(r=>r.json())) as POSCreationResponse | undefined;
	const st = R?.result?.invoice_status;
	const pId = (R?.result.invoice_id || R?.result.uuid)?.split("-")?.at?.(-1);
	if (!pId) {
		console.error(R);
		console.error("FAILED TO CHECK POS PAYMENT ID",id);
		return undefined;
	}

	const userId = PAYMENTS[pId]
	if (st?.includes("paid") && userId) {
		await prisma.user.update({
			where: {
				id: PAYMENTS[pId]
			},
			data: {
				usdtBalance: {
					increment: R?.result.amount || 0
				}
			}
		}).catch(console.error)
		delete PAYMENTS[pId];
	}
	return st;
}
