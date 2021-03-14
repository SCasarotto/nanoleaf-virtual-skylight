import { sleep } from 'https://deno.land/x/sleep/mod.ts'

import { settings } from './settings.ts'
import { getOnOff, setOnOff } from './api.ts'

while (true) {
	const isOn1 = await getOnOff({
		ip: settings.NANOLEAF_IP_ADDRESS,
		port: settings.NANOLEAF_PORT,
		authToken: settings.NANOLEAF_AUTH_TOKEN,
	})
	await setOnOff({
		ip: settings.NANOLEAF_IP_ADDRESS,
		port: settings.NANOLEAF_PORT,
		authToken: settings.NANOLEAF_AUTH_TOKEN,
		on: !isOn1,
	})
	await sleep(5)
}
