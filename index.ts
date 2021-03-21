import { sleep } from 'https://deno.land/x/sleep/mod.ts'

import {
	//isOn,
	//turnOn,
	//turnOff,
	// setBrightness,
	identify,
} from './api.ts'

// while (true) {
// 	const isNenoleafOn = await isOn()
// 	if (isNenoleafOn) {
// 		await turnOff()
// 	} else {
// 		await turnOn()
// 	}
// 	await sleep(5)
// }

// while (true) {
// 	await setBrightness({ value: 100, duration: 1 })
// 	await sleep(1)
// 	await setBrightness({ value: 0, duration: 1 })
// 	await sleep(1)
// }
await identify()
