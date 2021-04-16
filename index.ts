import { sleep } from 'https://deno.land/x/sleep/mod.ts'
import { Image } from 'https://deno.land/x/imagescript/mod.ts'

import { setCustomEffect } from './api/nanoleaf.ts'
import { getBloomSkyDdata } from './api/bloomsky.ts'
import { apiRequest } from './utils.ts'

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

while (true) {
	const weatherData = await getBloomSkyDdata()
	if (weatherData?.[0]) {
		const { ImageURL } = weatherData[0].Data
		console.log(ImageURL)
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
	}
	await sleep(5 * 60)
}
