import { sleep } from 'https://deno.land/x/sleep/mod.ts'

import { isOn, turnOn, turnOff } from './api.ts'

while (true) {
	const isNenoleafOn = await isOn()
	if (isNenoleafOn) {
		await turnOff()
	} else {
		await turnOn()
	}
	await sleep(5)
}
