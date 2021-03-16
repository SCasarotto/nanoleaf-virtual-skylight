import { settings } from './settings.ts'

const { API_DEBUGGING, NANOLEAF_AUTH_TOKEN, NANOLEAF_IP_ADDRESS, NANOLEAF_PORT } = settings

const BASE_URL = `http://${NANOLEAF_IP_ADDRESS}:${NANOLEAF_PORT}/api/v1`

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
 * Requests a new auth token from nanoleaf panel
 * @returns {Promise<string>} auth token
 */
export const getAuthToken = async () => {
	const response = await apiRequest(`${BASE_URL}/new`, {
		method: 'POST',
	})
	const data: { auth_token: string } = await response.json()
	return data.auth_token
}

/**
 * Delete an auth token
 * @param {string} - authToken
 * @returns {Promise<Response>} request response
 */
export const deleteAuthToken = async (authToken: string) => {
	const response = await apiRequest(`${BASE_URL}/${authToken}`, {
		method: 'DELETE',
	})
	const data: { auth_token: string } = await response.json()
	return data.auth_token
}

export interface AllPanelInfo {
	name: string
	serialNo: string
	manufacturer: string
	firmwareVersion: string
	hardwareVersion: string
	model: string
	// Improve type - Its not mentioned in the docs
	cloudHash: Record<string, unknown>
	// Improve type
	discovery: Record<string, unknown>
	effects: {
		effectsList: string[]
		select: string
	}
	// Improve type - Its not mentioned in the docs
	firmwareUpgrade: Record<string, unknown>
	panelLayout: {
		globalOrientation: { value: number; max: number; min: number }
		layout: {
			numPanels: number
			sideLength: number
			positionData: {
				panelId: number
				x: number
				y: number
				o: number
				shapeType: 0 | 1 | 2 | 3 | 4 | 7 | 8 | 9 | 12
			}[]
		}
	}
	// Improve type - Its not mentioned in the docs
	schedules: Record<string, unknown>
	state: {
		brightness: { value: number; max: number; min: number }
		// Feels like this will have more
		colorMode: 'effect'
		ct: { value: number; max: number; min: number }
		hue: { value: number; max: number; min: number }
		on: { value: boolean }
		sat: { value: number; max: number; min: number }
	}
}

/**
 * Get All Panel Info
 * @returns {Promise<AllPanelInfo>} panel data
 */
export const getAllPanelInfo = async () => {
	const response = await apiRequest(`${BASE_URL}/${NANOLEAF_AUTH_TOKEN}/`)
	const data: AllPanelInfo = await response.json()
	return data
}

/**
 * Checks nanoleaf panel is on
 * @returns {Promise<boolean>} state of nanoleaf panel on or off
 */
export const isOn = async () => {
	const response = await apiRequest(`${BASE_URL}/${NANOLEAF_AUTH_TOKEN}/state/on`)
	const data: { value: boolean } = await response.json()
	return data.value
}

/**
 * Turns nanoleaf panel is on
 * @returns {Promise<Response>} request response
 */
export const turnOn = async () => {
	const response = await apiRequest(`${BASE_URL}/${NANOLEAF_AUTH_TOKEN}/state/on`, {
		method: 'PUT',
		body: JSON.stringify({ on: { value: true } }),
	})
	return response
}
/**
 * Turns nanoleaf panel is off
 * @returns {Promise<Response>} request response
 */
export const turnOff = async () => {
	const response = await apiRequest(`${BASE_URL}/${NANOLEAF_AUTH_TOKEN}/state/on`, {
		method: 'PUT',
		body: JSON.stringify({ on: { value: false } }),
	})
	return response
}
