/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {},
	},
	daisyui: {
		themes: [
			{
				mytheme: {
					"primary": "#F1DAC4",
					"secondary": "#48A9A6",
					"accent": "#474973",
					"neutral": "#161B33",
					"base-100": "#0D0C1D",
					"info": "#3ABFF8",
					"success": "#36D399",
					"warning": "#FBBD23",
					"error": "#BA1A1A",
				},
			},
		],
	},
	plugins: [require("daisyui")],
}
