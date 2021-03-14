import { settings } from './settings.ts'

const { API_DEBUGGING, NANOLEAF_AUTH_TOKEN, NANOLEAF_IP_ADDRESS, NANOLEAF_PORT } = settings

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

/**
 * Requests a new auth token from nanoleaf
 * @returns {Promise<string>} auth token
 */
export const getAuthToken = async () => {
	const response = await apiRequest(`http://${NANOLEAF_IP_ADDRESS}:${NANOLEAF_PORT}/api/v1/new`, {
		method: 'POST',
	})
	const data: { auth_token: string } = await response.json()
	return data.auth_token
}

/**
 * Checks nanoleaf is on
 * @returns {Promise<boolean>} state of nanoleaf on or off
 */
export const isOn = async () => {
	const response = await apiRequest(
		`http://${NANOLEAF_IP_ADDRESS}:${NANOLEAF_PORT}/api/v1/${NANOLEAF_AUTH_TOKEN}/state/on`,
	)
	const data: { value: boolean } = await response.json()
	return data.value
}

/**
 * Turns nanoleaf is on
 * @returns {Promise<Response>} request response
 */
export const turnOn = async () => {
	const response = await apiRequest(
		`http://${NANOLEAF_IP_ADDRESS}:${NANOLEAF_PORT}/api/v1/${NANOLEAF_AUTH_TOKEN}/state/on`,
		{
			method: 'PUT',
			body: JSON.stringify({ on: { value: true } }),
		},
	)
	return response
}
/**
 * Turns nanoleaf is off
 * @returns {Promise<Response>} request response
 */
export const turnOff = async () => {
	const response = await apiRequest(
		`http://${NANOLEAF_IP_ADDRESS}:${NANOLEAF_PORT}/api/v1/${NANOLEAF_AUTH_TOKEN}/state/on`,
		{
			method: 'PUT',
			body: JSON.stringify({ on: { value: false } }),
		},
	)
	return response
}
