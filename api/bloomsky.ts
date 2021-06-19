import { settings } from './../settings.ts'
import { apiRequest } from './../utils.ts'

const { BLOOMSKY_API_KEY } = settings

//
// Bloomsky APIs
//
// Product Ref: https://www.bloomsky.com/
// API Ref: http://weatherlution.com/bloomsky-api/?doing_wp_cron=1617755664.4779980182647705078125
//

const BLOOM_SKY_BASE_URL = 'https://api.bloomsky.com/api/skydata/'

interface BloomSkyResponseDatum {
	UTC: number
	CityName: string
	Storm: {
		UVIndex: string // but of numbers (1 - 11+)
		WindDirection: 'S' | 'SW' | 'W' | 'NW' | 'N' | 'NE' | 'E' | 'SE'
		RainDaily: number
		WindGust: number
		SustainedWindSpeed: number
		RainRate: number
		'24hRain': number
	}
	Searchable: boolean
	DeviceName: string
	RegisterTime: number
	DST: 0 | 1
	BoundedPoint: string
	LON: number
	Point: {} // not sure
	VideoList: string[]
	VideoList_C: string[]
	DeviceID: string
	NumOfFollowers: number
	LAT: number
	ALT: number
	Data: {
		Luminance: number // cd/m2
		Temperature: number
		ImageURL: string
		TS: number
		Rain: boolean
		Humidity: number
		Pressure: number
		DeviceType: 'SKY2'
		Voltage: number
		Night: boolean
		UVIndex: number
		ImageTS: number
	}
	FullAddress: string
	StreetName: string
	PreviewImageList: string[]
}

export type BloomSkyResponseData = BloomSkyResponseDatum[]

/**
 * Get bloomsky base data
 * @returns {Promise<BloomSkyResponseData>} request response
 */
export const getBloomSkyData = async () => {
	const response = await apiRequest(`${BLOOM_SKY_BASE_URL}`, {
		method: 'GET',
		headers: { Authorization: BLOOMSKY_API_KEY },
	})
	if (!response.ok) {
		console.log(response)
		throw new Error('Error occured loading bloomsky data')
	}
	const data: BloomSkyResponseData = await response.json()
	return data
}
