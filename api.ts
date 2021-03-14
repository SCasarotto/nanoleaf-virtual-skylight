export interface RequestBaseConfig {
	ip: string
	port: string
	authToken: string
}

export const getToken = async (config: Omit<RequestBaseConfig, 'authToken'>) => {
	const { ip, port } = config
	const response = await fetch(`http://${ip}:${port}/api/v1/new`, {
		method: 'POST',
	})
	const data: { auth_token: string } = await response.json()
	return data.auth_token
}
export const getOnOff = async (config: RequestBaseConfig) => {
	const { ip, port, authToken } = config
	const response = await fetch(`http://${ip}:${port}/api/v1/${authToken}/state/on`)
	const data: { value: boolean } = await response.json()
	return data.value
}

export interface SetOnOffConfig extends RequestBaseConfig {
	on: boolean
}
export const setOnOff = async (config: SetOnOffConfig) => {
	const { ip, port, authToken, on } = config
	const response = await fetch(`http://${ip}:${port}/api/v1/${authToken}/state/on`, {
		method: 'PUT',
		body: JSON.stringify({ on: { value: on } }),
	})
	return response
}
