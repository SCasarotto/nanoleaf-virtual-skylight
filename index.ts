import { sleep } from 'https://deno.land/x/sleep/mod.ts'
import { Image } from 'https://deno.land/x/imagescript/mod.ts'

import { getTimes } from './deps/suncalc/suncalc.ts'

import {
	setCustomEffect,
	setSelectedEffect,
	setBrightness,
	getAllPanelInfo,
} from './api/nanoleaf.ts'
import { getBloomSkyData } from './api/bloomsky.ts'
import { apiRequest, createAndUseLinearScale } from './utils.ts'

const panelIdArray = [
	30919, // Control Panel ID
	20795,
	15413,
	33282,
	12850,
	38851,
	48334,
	34671,
	37012,
	25389,
	19974,
	6618,
	20098,
	38258,
	23841,
	25157,
	53492,
	3979,
]

// Determines the pixel to use in a 5x5 image
const panelIdToPixelCoord = (id: number) => {
	switch (id) {
		case 30919:
			return { x: 4, y: 6 }
		case 20795:
			return { x: 4, y: 5 }
		case 15413:
			return { x: 4, y: 4 }
		case 33282:
			return { x: 3, y: 4 }
		case 12850:
			return { x: 3, y: 5 }
		case 38851:
			return { x: 3, y: 6 }
		case 48334:
			return { x: 2, y: 5 }
		case 34671:
			return { x: 2, y: 4 }
		case 37012:
			return { x: 2, y: 3 }
		case 25389:
			return { x: 4, y: 3 }
		case 19974:
			return { x: 3, y: 3 }
		case 6618:
			return { x: 2, y: 2 }
		case 20098:
			return { x: 5, y: 3 }
		case 38258:
			return { x: 2, y: 4 }
		case 23841:
			return { x: 2, y: 6 }
		case 25157:
			return { x: 5, y: 4 }
		case 53492:
			return { x: 6, y: 3 }
		case 3979:
			return { x: 5, y: 5 }
		default:
			return undefined
	}
}

interface PanelConfig {
	id: number
	numberOfFrames?: number
	red: number
	green: number
	blue: number
	white?: number
	time?: number
}
const panelConfigToString = (d: PanelConfig) =>
	`${d.id} ${d.numberOfFrames ?? 1} ${d.red} ${d.green} ${d.blue} ${d.white ?? 0} ${d.time ?? 10}`

let previousImageUrl = ''
let duplicateCount = 0

while (true) {
	// TODO: Should verify we can find the nanoleaf before doing other work
	let foundNanoleaf = false
	try {
		const dataResponse = await getAllPanelInfo()
		if (dataResponse) {
			foundNanoleaf = true
		}
	} catch (_) {
		console.log('Did not find Nanoleaf')
	}
	if (foundNanoleaf) {
		try {
			const weatherData = await getBloomSkyData()
			if (weatherData?.[0]) {
				const { ImageURL } = weatherData[0].Data
				console.log(ImageURL)
				if (ImageURL !== previousImageUrl) {
					duplicateCount = 0
					const response = await apiRequest(ImageURL)
					const arrayBuffer = await response.arrayBuffer()
					const image = await Image.decode(new Uint8Array(arrayBuffer))
					const resizedImage = image.resize(6, 6)
					await setCustomEffect({
						command: 'add',
						animType: 'static',
						animData: `${panelIdArray.length} ${panelIdArray
							.map((d) => {
								const pixelCoord = panelIdToPixelCoord(d)
								if (pixelCoord) {
									const [red, green, blue] = resizedImage.getRGBAAt(
										pixelCoord.x,
										pixelCoord.y,
									)
									return panelConfigToString({
										id: d,
										red,
										green,
										blue,
									})
								}
								return ''
							})
							.join(' ')} `,
						loop: false,
						palette: [],
						colorType: 'HSB',
					})
				} else {
					duplicateCount += 1
					if (duplicateCount > 1) {
						setSelectedEffect('Clear Night Sky')
					}
				}
				previousImageUrl = ImageURL

				// Set Brightness
				// < dawn or > dusk => 20
				// dawn -> sunriseEnd => 20 - 0.75
				// sunriseEnd -> sunriseEnd + 2 hour => 0.75 - 1
				// sunsetStart - 2 hour -> sunset => 1 - 0.75
				// sunset -> dusk => 0.75 - 0.2
				const { dawn, dusk, sunriseEnd, sunsetStart } = getTimes(
					new Date(),
					41.883641868649995,
					-87.64383898457068,
				)
				const now = Date.now()
				const dawnEpoch = dawn.getTime()
				const sunriseEndEpoch = sunriseEnd.getTime()
				const sunsetStartEpoch = sunsetStart.getTime()
				const duskEpoch = dusk.getTime()
				const HOUR_IN_MILISECONDS = 60 * 60 * 1000

				let newBrightness = 20
				// Before Dawn
				if (now < dawnEpoch) {
					newBrightness = 20
					console.log('Between Dawn', newBrightness)
				} else if (now < sunriseEndEpoch) {
					newBrightness = Math.round(
						createAndUseLinearScale({
							minScale: 20,
							maxScale: 75,
							minValue: dawnEpoch,
							maxValue: sunriseEndEpoch,
							value: now,
						}),
					)
					console.log('Between Dawn and Sunrise End', newBrightness)
				} else if (now < sunriseEndEpoch + HOUR_IN_MILISECONDS * 2) {
					newBrightness = Math.round(
						createAndUseLinearScale({
							minScale: 75,
							maxScale: 100,
							minValue: sunriseEndEpoch,
							maxValue: sunriseEndEpoch + HOUR_IN_MILISECONDS * 2,
							value: now,
						}),
					)
					console.log('Between Sunrise End and Full Brightness', newBrightness)
				} else if (now < sunsetStartEpoch - HOUR_IN_MILISECONDS * 2) {
					newBrightness = 100
					console.log('Full Brightness', newBrightness)
				} else if (now < sunsetStartEpoch) {
					newBrightness = Math.round(
						createAndUseLinearScale({
							minScale: 100,
							maxScale: 75,
							minValue: sunsetStartEpoch - HOUR_IN_MILISECONDS * 2,
							maxValue: sunsetStartEpoch,
							value: now,
						}),
					)
					console.log('Between Full Brightness and Sunset Start', newBrightness)
				} else if (now < duskEpoch) {
					newBrightness = Math.round(
						createAndUseLinearScale({
							minScale: 75,
							maxScale: 20,
							minValue: sunsetStartEpoch,
							maxValue: duskEpoch,
							value: now,
						}),
					)
					console.log('Sunset Start and Dusk', newBrightness)
				} else if (now >= duskEpoch) {
					// After Dusk
					newBrightness = 20
					console.log('After Dusk', newBrightness)
				}
				await setBrightness({ value: newBrightness })
			}
		} catch (e) {
			console.log(e)
		}
	}
	await sleep(5 * 60)
}
