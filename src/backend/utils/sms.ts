export async function sendSMSCode(phone: string, code: string) {
	return await fetch("https://api.sms.ir/v1/send/verify", {
		method: "POST",
		headers: {
			"X-API-KEY": "2i7SXKuwAdd2QiN4zD22KOBwPvPjQ4yt8seig0udUCL4bGO4qGk7ubYg3uFW7gvl",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			"mobile": (+phone)+"",
			"templateId": 100000,
			"parameters": [
				{
					"name": "Code",
					"value": code
				}
			]
		})
	}).then(r => r.json());
}
