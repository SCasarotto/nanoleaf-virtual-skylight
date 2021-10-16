import { settings } from './settings.ts'

const { API_DEBUGGING } = settings

/**
 * Api Request helper.
 * Simple wrapper around fetch to do easy logging
 * @param {Request | URL | string} - input
 * @param {RequestInit} - [init]
 * @returns {Promise<Response>}
 */
export const apiRequest = async (input: Request | URL | string, init?: RequestInit) => {
	if (API_DEBUGGING) {
		console.log('API REQUEST:', { input, init })
	}
	const response = await fetch(input, init)
	if (API_DEBUGGING) {
		const responseClone = response.clone()
		try {
			const data = await responseClone.json()
			console.log('API RESPONSE', { response: responseClone, data })
		} catch (e) {
			console.error(e)
			console.log('API RESPONSE', { response: responseClone })
		}
	}
	return response
}

type CreateLinearScaleData = {
	minScale: number
	maxScale: number
	minValue: number
	maxValue: number
}
/**
 * Create Linear Scale
 * Create a linear scale mapping one dimensions to another
 * @param {CreateLinearScaleData} data
 * @returns {(value: number) => number} scale
 */
export const createLinearScale = (data: CreateLinearScaleData) => {
	const { maxScale, maxValue, minScale, minValue } = data
	const ratio = (maxScale - minScale) / (maxValue - minValue)
	return (value: number) => minScale + ratio * (value - minValue)
}

type CreateAndUseLinearScaleData = CreateLinearScaleData & {
	value: number
}
/**
 * Create And Use Linear Scale
 * Create a linear scale mapping one dimensions to another and then use it with hte value
 * @param {CreateAndUseLinearScaleData} data
 * @returns {number} value - mapped to the scale
 */
export const createAndUseLinearScale = (data: CreateAndUseLinearScaleData) => {
	const { value, ...rest } = data
	const scale = createLinearScale(rest)
	return scale(value)
}
