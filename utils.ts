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
			console.log('API RESPONSE', { response: responseClone })
		}
	}
	return response
}
