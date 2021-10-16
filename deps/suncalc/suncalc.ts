/*
 (c) 2011-2015, Vladimir Agafonkin
 SunCalc is a JavaScript library for calculating sun/moon position and light phases.
 https://github.com/mourner/suncalc
*/

// shortcuts for easier to read formulas

const PI = Math.PI
const sin = Math.sin
const cos = Math.cos
const tan = Math.tan
const asin = Math.asin
const atan = Math.atan2
const acos = Math.acos
const rad = PI / 180

// sun calculations are based on http://aa.quae.nl/en/reken/zonpositie.html formulas

// date/time constants and conversions

const dayMs = 1000 * 60 * 60 * 24
const J1970 = 2440588
const J2000 = 2451545

const toJulian = (date: Date) => date.valueOf() / dayMs - 0.5 + J1970
const fromJulian = (j: number) => new Date((j + 0.5 - J1970) * dayMs)
const toDays = (date: Date) => toJulian(date) - J2000

// general calculations for position

const e = rad * 23.4397 // obliquity of the Earth

const rightAscension = (l: number, b: number) => atan(sin(l) * cos(e) - tan(b) * sin(e), cos(l))
const declination = (l: number, b: number) => asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l))
const azimuth = (H: number, phi: number, dec: number) =>
	atan(sin(H), cos(H) * sin(phi) - tan(dec) * cos(phi))
const altitude = (H: number, phi: number, dec: number) =>
	asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H))

const siderealTime = (d: number, lw: number) => rad * (280.16 + 360.9856235 * d) - lw

const astroRefraction = (h: number) => {
	if (h < 0)
		// the following formula works for positive altitudes only.
		h = 0 // if h = -0.08901179 a div/0 would occur.

	// formula 16.4 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
	// 1.02 / tan(h + 10.26 / (h + 5.10)) h in degrees, result in arc minutes -> converted to rad:
	return 0.0002967 / Math.tan(h + 0.00312536 / (h + 0.08901179))
}

// general sun calculations

const solarMeanAnomaly = (d: number) => rad * (357.5291 + 0.98560028 * d)

const eclipticLongitude = (M: number) => {
	const C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M)) // equation of center
	const P = rad * 102.9372 // perihelion of the Earth

	return M + C + P + PI
}

const sunCoords = (d: number) => {
	const M = solarMeanAnomaly(d)
	const L = eclipticLongitude(M)

	return {
		dec: declination(L, 0),
		ra: rightAscension(L, 0),
	}
}

// calculates sun position for a given date and latitude/longitude

export const getPosition = (date: Date, lat: number, lng: number) => {
	const lw = rad * -lng
	const phi = rad * lat
	const d = toDays(date)
	const c = sunCoords(d)
	const H = siderealTime(d, lw) - c.ra

	return {
		azimuth: azimuth(H, phi, c.dec),
		altitude: altitude(H, phi, c.dec),
	}
}

// sun times configuration (angle, morning name, evening name)

const times: Array<[number, string, string]> = [
	[-0.833, 'sunrise', 'sunset'],
	[-0.3, 'sunriseEnd', 'sunsetStart'],
	[-6, 'dawn', 'dusk'],
	[-12, 'nauticalDawn', 'nauticalDusk'],
	[-18, 'nightEnd', 'night'],
	[6, 'goldenHourEnd', 'goldenHour'],
]

// adds a custom time to the times config

export const addTime = (angle: number, riseName: string, setName: string) => {
	times.push([angle, riseName, setName])
}

// calculations for sun times

const J0 = 0.0009

const julianCycle = (d: number, lw: number) => Math.round(d - J0 - lw / (2 * PI))
const approxTransit = (Ht: number, lw: number, n: number) => J0 + (Ht + lw) / (2 * PI) + n
const solarTransitJ = (ds: number, M: number, L: number) =>
	J2000 + ds + 0.0053 * sin(M) - 0.0069 * sin(2 * L)
const hourAngle = (h: number, phi: number, d: number) =>
	acos((sin(h) - sin(phi) * sin(d)) / (cos(phi) * cos(d)))
const observerAngle = (height: number) => (-2.076 * Math.sqrt(height)) / 60

// returns set time for the given sun altitude
const getSetJ = (
	h: number,
	lw: number,
	phi: number,
	dec: number,
	n: number,
	M: number,
	L: number,
) => {
	const w = hourAngle(h, phi, dec)
	const a = approxTransit(w, lw, n)

	return solarTransitJ(a, M, L)
}

// calculates sun times for a given date, latitude/longitude, and, optionally,
// the observer height (in meters) relative to the horizon

export const getTimes = (date: Date, lat: number, lng: number, height?: number) => {
	height = height || 0

	const lw = rad * -lng
	const phi = rad * lat
	const dh = observerAngle(height)
	const d = toDays(date)
	const n = julianCycle(d, lw)
	const ds = approxTransit(0, lw, n)
	const M = solarMeanAnomaly(ds)
	const L = eclipticLongitude(M)
	const dec = declination(L, 0)
	const Jnoon = solarTransitJ(ds, M, L)

	const result: Record<string, Date> = {
		solarNoon: fromJulian(Jnoon),
		nadir: fromJulian(Jnoon - 0.5),
	}

	for (let i = 0; i < times.length; i += 1) {
		const time = times[i]
		const h0 = (time[0] + dh) * rad

		const Jset = getSetJ(h0, lw, phi, dec, n, M, L)
		const Jrise = Jnoon - (Jset - Jnoon)

		result[time[1]] = fromJulian(Jrise)
		result[time[2]] = fromJulian(Jset)
	}

	return result
}

// moon calculations, based on http://aa.quae.nl/en/reken/hemelpositie.html formulas

const moonCoords = (d: number) => {
	// geocentric ecliptic coordinates of the moon

	const L = rad * (218.316 + 13.176396 * d) // ecliptic longitude
	const M = rad * (134.963 + 13.064993 * d) // mean anomaly
	const F = rad * (93.272 + 13.22935 * d) // mean distance
	const l = L + rad * 6.289 * sin(M) // longitude
	const b = rad * 5.128 * sin(F) // latitude
	const dt = 385001 - 20905 * cos(M) // distance to the moon in km

	return {
		ra: rightAscension(l, b),
		dec: declination(l, b),
		dist: dt,
	}
}

export const getMoonPosition = (date: Date, lat: number, lng: number) => {
	const lw = rad * -lng
	const phi = rad * lat
	const d = toDays(date)
	const c = moonCoords(d)
	const H = siderealTime(d, lw) - c.ra
	let h = altitude(H, phi, c.dec)
	// formula 14.1 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
	const pa = atan(sin(H), tan(phi) * cos(c.dec) - sin(c.dec) * cos(H))

	h = h + astroRefraction(h) // altitude correction for refraction

	return {
		azimuth: azimuth(H, phi, c.dec),
		altitude: h,
		distance: c.dist,
		parallacticAngle: pa,
	}
}

// calculations for illumination parameters of the moon,
// based on http://idlastro.gsfc.nasa.gov/ftp/pro/astro/mphase.pro formulas and
// Chapter 48 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.

export const getMoonIllumination = (date: Date) => {
	const d = toDays(date || new Date())
	const s = sunCoords(d)
	const m = moonCoords(d)
	const sdist = 149598000 // distance from Earth to Sun in km
	const phi = acos(sin(s.dec) * sin(m.dec) + cos(s.dec) * cos(m.dec) * cos(s.ra - m.ra))
	const inc = atan(sdist * sin(phi), m.dist - sdist * cos(phi))
	const angle = atan(
		cos(s.dec) * sin(s.ra - m.ra),
		sin(s.dec) * cos(m.dec) - cos(s.dec) * sin(m.dec) * cos(s.ra - m.ra),
	)

	return {
		fraction: (1 + cos(inc)) / 2,
		phase: 0.5 + (0.5 * inc * (angle < 0 ? -1 : 1)) / Math.PI,
		angle: angle,
	}
}

const hoursLater = (date: Date, h: number) => new Date(date.valueOf() + (h * dayMs) / 24)

// calculations for moon rise/set times are based on http://www.stargazing.net/kepler/moonrise.html article

export const getMoonTimes = (date: Date, lat: number, lng: number, inUTC?: boolean) => {
	const t = new Date(date)
	if (inUTC) {
		t.setUTCHours(0, 0, 0, 0)
	} else {
		t.setHours(0, 0, 0, 0)
	}

	const hc = 0.133 * rad
	let h0 = getMoonPosition(t, lat, lng).altitude - hc
	let rise
	let set
	// Not sure what these should default to
	let ye = 0
	let x1 = 0
	let x2 = 0

	// go in 2-hour chunks, each time seeing if a 3-point quadratic curve crosses zero (which means rise or set)
	for (let i = 1; i <= 24; i += 2) {
		const h1 = getMoonPosition(hoursLater(t, i), lat, lng).altitude - hc
		const h2 = getMoonPosition(hoursLater(t, i + 1), lat, lng).altitude - hc

		const a = (h0 + h2) / 2 - h1
		const b = (h2 - h0) / 2
		const xe = -b / (2 * a)
		ye = (a * xe + b) * xe + h1
		const d = b * b - 4 * a * h1
		let roots = 0

		if (d >= 0) {
			const dx = Math.sqrt(d) / (Math.abs(a) * 2)
			x1 = xe - dx
			x2 = xe + dx
			if (Math.abs(x1) <= 1) {
				roots++
			}
			if (Math.abs(x2) <= 1) {
				roots++
			}
			if (x1 < -1) {
				x1 = x2
			}
		}

		if (roots === 1) {
			if (h0 < 0) {
				rise = i + x1
			} else {
				set = i + x1
			}
		} else if (roots === 2) {
			rise = i + (ye < 0 ? x2 : x1)
			set = i + (ye < 0 ? x1 : x2)
		}

		if (rise && set) {
			break
		}

		h0 = h2
	}

	const result: Record<string, Date | boolean> = {}

	if (rise) {
		result.rise = hoursLater(t, rise)
	}
	if (set) {
		result.set = hoursLater(t, set)
	}

	if (!rise && !set) {
		result[ye > 0 ? 'alwaysUp' : 'alwaysDown'] = true
	}

	return result
}
