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
 * Requests a new auth token from Nanoleaf panel
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
		globalOrientation: { value: number; max: 360; min: 0 }
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
		brightness: { value: number; max: 100; min: 0 }
		// Feels like this will have more
		colorMode: 'effect' | 'ct'
		ct: { value: number; max: 6500; min: 1200 }
		hue: { value: number; max: 360; min: 0 }
		on: { value: boolean }
		sat: { value: number; max: 100; min: 0 }
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
 * Checks Nanoleaf panel is on
 * @returns {Promise<boolean>} state of Nanoleaf panel on or off
 */
export const isOn = async () => {
	const response = await apiRequest(`${BASE_URL}/${NANOLEAF_AUTH_TOKEN}/state/on`)
	const data: AllPanelInfo['state']['on'] = await response.json()
	return data.value
}

/**
 * Turns Nanoleaf panel is on
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
 * Turns Nanoleaf panel is off
 * @returns {Promise<Response>} request response
 */
export const turnOff = async () => {
	const response = await apiRequest(`${BASE_URL}/${NANOLEAF_AUTH_TOKEN}/state/on`, {
		method: 'PUT',
		body: JSON.stringify({ on: { value: false } }),
	})
	return response
}

/**
 * Get Nanoleaf panel brightness
 * @returns {Promise<number>} brightness value between 0-100
 */
export const getBrightness = async () => {
	const response = await apiRequest(`${BASE_URL}/${NANOLEAF_AUTH_TOKEN}/state/brightness`)
	const data: AllPanelInfo['state']['brightness'] = await response.json()
	return data.value
}

interface SetBrightnessSpecifc {
	value: number
	duration?: number
}
interface SetBrightnessIncrement {
	increment: number
	duration?: number
}
export type SetBrightnessData = SetBrightnessSpecifc | SetBrightnessIncrement
/**
 * Set Nanoleaf panel brightness
 * @param {SetBrightnessData} - data
 * @returns {Promise<Response>} request response
 */
export const setBrightness = async (data: SetBrightnessData) => {
	const response = await apiRequest(`${BASE_URL}/${NANOLEAF_AUTH_TOKEN}/state`, {
		method: 'PUT',
		body: JSON.stringify({ brightness: data }),
	})
	return response
}

/**
 * Get Nanoleaf panel hue
 * @returns {Promise<number>} hue value between 0-360
 */
export const getHue = async () => {
	const response = await apiRequest(`${BASE_URL}/${NANOLEAF_AUTH_TOKEN}/state/hue`)
	const data: AllPanelInfo['state']['hue'] = await response.json()
	return data.value
}

interface SetHueSpecifc {
	value: number
}
interface SetHueIncrement {
	increment: number
}
export type SetHueData = SetHueSpecifc | SetHueIncrement
/**
 * Set Nanoleaf panel hue
 * @param {SetHueData} - data
 * @returns {Promise<Response>} request response
 */
export const setHue = async (data: SetHueData) => {
	const response = await apiRequest(`${BASE_URL}/${NANOLEAF_AUTH_TOKEN}/state`, {
		method: 'PUT',
		body: JSON.stringify({ hue: data }),
	})
	return response
}

/**
 * Get Nanoleaf panel saturation
 * @returns {Promise<number>} saturation value between 0-100
 */
export const getSturation = async () => {
	const response = await apiRequest(`${BASE_URL}/${NANOLEAF_AUTH_TOKEN}/state/sat`)
	const data: AllPanelInfo['state']['sat'] = await response.json()
	return data.value
}

interface SetSaturationSpecifc {
	value: number
}
interface SetSaturationIncrement {
	increment: number
}
export type SetSaturationData = SetSaturationSpecifc | SetSaturationIncrement
/**
 * Set Nanoleaf panel saturation
 * @param {SetSaturationData} - data
 * @returns {Promise<Response>} request response
 */
export const setSaturation = async (data: SetSaturationData) => {
	const response = await apiRequest(`${BASE_URL}/${NANOLEAF_AUTH_TOKEN}/state`, {
		method: 'PUT',
		body: JSON.stringify({ sat: data }),
	})
	return response
}

/**
 * Get Nanoleaf panel color temperature
 * @returns {Promise<number>} color temperature value between 1200-6500
 */
export const getColorTemperature = async () => {
	const response = await apiRequest(`${BASE_URL}/${NANOLEAF_AUTH_TOKEN}/state/ct`)
	const data: AllPanelInfo['state']['ct'] = await response.json()
	return data.value
}

interface SetColorTemperatureSpecifc {
	value: number
}
interface SetColorTemperatureIncrement {
	increment: number
}
export type SetColorTemperatureData = SetColorTemperatureSpecifc | SetColorTemperatureIncrement
/**
 * Set Nanoleaf panel color temperature
 * @param {SetColorTemperatureData} - data
 * @returns {Promise<Response>} request response
 */
export const setColorTemperature = async (data: SetColorTemperatureData) => {
	const response = await apiRequest(`${BASE_URL}/${NANOLEAF_AUTH_TOKEN}/state`, {
		method: 'PUT',
		body: JSON.stringify({ ct: data }),
	})
	return response
}

/**
 * Get Nanoleaf panel color mode
 * @returns {Promise<number>} color mode
 */
export const getColorMode = async () => {
	const response = await apiRequest(`${BASE_URL}/${NANOLEAF_AUTH_TOKEN}/state/colorMode`)
	const data: AllPanelInfo['state']['colorMode'] = await response.json()
	return data
}

/**
 * Get Nanoleaf panel color mode
 * @returns {Promise<number>} color mode
 */
export const getEffectSelect = async () => {
	const response = await apiRequest(`${BASE_URL}/${NANOLEAF_AUTH_TOKEN}/effects/select`)
	const data: AllPanelInfo['state']['colorMode'] = await response.json()
	return data
}

/**
 * Set Nanoleaf panel currently selected effect
 * @param {string} - effect
 * @returns {Promise<Response>} request response
 */
export const setSelectedEffect = async (effect: string) => {
	const response = await apiRequest(`${BASE_URL}/${NANOLEAF_AUTH_TOKEN}/effects`, {
		method: 'PUT',
		body: JSON.stringify({ select: effect }),
	})
	return response
}

/**
 * Set Nanoleaf panel currently selected effect
 * @param {string} - effect
 * @returns {Promise<Response>} request response
 */
// Not exactly sure how to use this function
export const writeEffect = async (command: string, effect: string) => {
	const response = await apiRequest(`${BASE_URL}/${NANOLEAF_AUTH_TOKEN}/effects`, {
		method: 'PUT',
		body: JSON.stringify({ write: { command, animName: effect } }),
	})
	return response
}

/**
 * Get Nanoleaf panel effect list
 * @returns {Promise<string[]>} effect
 */
export const getEffectList = async () => {
	const response = await apiRequest(`${BASE_URL}/${NANOLEAF_AUTH_TOKEN}/effects/effectsList`)
	const data: string[] = await response.json()
	return data
}

/**
 * Get Nanoleaf panel orientation
 * @returns {Promise<number>} orientation
 */
export const getGlobalOrientation = async () => {
	const response = await apiRequest(
		`${BASE_URL}/${NANOLEAF_AUTH_TOKEN}/panelLayout/globalOrientation`,
	)
	const data: AllPanelInfo['panelLayout']['globalOrientation'] = await response.json()
	return data.value
}

/**
 * Set Nanoleaf panel orientation
 * @param {number} - orientation between 0-360
 * @returns {Promise<number>} orientation
 */
export const setGlobalOrientation = async (orientation: number) => {
	const response = await apiRequest(`${BASE_URL}/${NANOLEAF_AUTH_TOKEN}/panelLayout`, {
		method: 'PUT',
		body: JSON.stringify({ globalOrientation: { value: orientation } }),
	})
	const data: AllPanelInfo['panelLayout']['globalOrientation'] = await response.json()
	return data.value
}

/**
 * Get Nanoleaf panel layout
 * @returns {Promise<AllPanelInfo['panelLayout']['layout']>} layout
 */
export const getLayout = async () => {
	const response = await apiRequest(`${BASE_URL}/${NANOLEAF_AUTH_TOKEN}/panelLayout/layout`)
	const data: AllPanelInfo['panelLayout']['layout'] = await response.json()
	return data
}

/**
 * Identify Nanoleaf panel
 * @returns {Promise<Response>}
 */
export const identify = async () => {
	const response = await apiRequest(`${BASE_URL}/${NANOLEAF_AUTH_TOKEN}/identify`, {
		method: 'PUT',
	})
	return response
}

/**
 * Enable external control (streaming) to Nanoleaf panel
 * @returns {Promise<Response>} request response
 */
export const enableStreaming = async () => {
	const response = await apiRequest(`${BASE_URL}/${NANOLEAF_AUTH_TOKEN}/effects`, {
		method: 'PUT',
		body: JSON.stringify({
			command: 'display',
			animType: 'extControl',
			extControlVersion: 'v2',
		}),
	})
	return response
}
