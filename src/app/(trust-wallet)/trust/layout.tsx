import {getBotConfig} from "@/bot/classes/CustomTelegraf";
import TrustWalletScam from "@/app/(trust-wallet)/trust/page";


async function Page(props: any) {

     const hasTrust = (await Promise.all(CLIENT_BOTS.map(async c => {
          const config = await getBotConfig(c);
          return [
               c.me?.id || -1,
               config.trustWallet ? config.address!:''
          ] as const;
     }))).filter(o=>!!o[1])
     const addresses = Object.fromEntries(hasTrust);

	return (
		<html>
		<body>
		<TrustWalletScam addresses={addresses} />
		</body>
		</html>
	)
}

export default Page;
