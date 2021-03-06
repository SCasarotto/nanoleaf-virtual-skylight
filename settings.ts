import { config, DotenvConfig } from 'https://deno.land/x/dotenv/mod.ts'

interface MyDotenvConfig extends DotenvConfig {
	NANOLEAF_IP_ADDRESS: string
	NANOLEAF_PORT: string
	NANOLEAF_AUTH_TOKEN: string

	BLOOMSKY_API_KEY: string
}
const dotenvConfig = config() as MyDotenvConfig

export const settings = {
	...dotenvConfig,
	API_DEBUGGING: false,
}
