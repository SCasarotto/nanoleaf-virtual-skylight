# nanoleaf-virtual-skylight

The goal is this project is to use Nanoleaf Canvas tiles and create a virtual skylight based on the current weather.

This project is built with [deno](https://deno.land/) because ... all the cool kids are doing it.

## Get Started

1. Clone Repo
1. Ensure you have [deno](https://deno.land/) installed.
1. Copy the `.env.example` file and create a `.env` file. Fill out the fields with your IP Address, Port and Auth Token first. See ".ENV Setup" below.
1. Run the code `deno run --allow-env --allow-read --allow-net index.ts`

## .ENV Setup

Likely when you first clone this repo you will not have all the required configuration information to just start.

1. Find the IP address of your Nanoleaf. I did this using my router app but there are many ways. See the [Nanoleaf Docs](https://forum.nanoleaf.me/docs#_oon416cadkkr) for other options.
2. In the [Nanoleaf Docs](https://forum.nanoleaf.me/docs#_oon416cadkkr) they mention the default port is `16021` but also not to hardcode that. At this time I have hardcoded it but may later build a dynamic way to determine it.
3. Getting the auth token can be done with the `getAuthToken` function. It simply calls `/api/v1/new` just as the [docs](https://forum.nanoleaf.me/docs#_5soyiy1g6uf) suggest.

## BloomSky API

Part of this project has started to use an API for to get near real time images of the sky and weather data.

-   [General Website](https://www.bloomsky.com/)
-   [API Docs](http://weatherlution.com/bloomsky-api/?doing_wp_cron=1618533559.3775849342346191406250)
