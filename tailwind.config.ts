
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				brand: {
					teal: '#81e6d9',
					'teal-light': '#a7f0e9',
					'teal-dark': '#63c4b9',
					purple: '#8B5CF6',
					'purple-light': '#9b87f5',
					'purple-dark': '#6E59A5'
				}
			},
			typography: {
				DEFAULT: {
					css: {
						'--tw-prose-body': 'hsl(0 0% 90%)',
						'--tw-prose-headings': '#fff',
						'--tw-prose-lead': 'hsl(0 0% 85%)',
						'--tw-prose-links': '#81e6d9',
						'--tw-prose-bold': '#fff',
						'--tw-prose-counters': '#81e6d9',
						'--tw-prose-bullets': 'hsl(0 0% 70%)',
						'--tw-prose-hr': 'hsl(0 0% 30%)',
						'--tw-prose-quotes': 'hsl(0 0% 85%)',
						'--tw-prose-quote-borders': '#81e6d9',
						'--tw-prose-captions': 'hsl(0 0% 70%)',
						'--tw-prose-code': '#fff',
						'--tw-prose-pre-code': '#fff',
						'--tw-prose-pre-bg': 'hsl(0 0% 15%)',
						'--tw-prose-th-borders': 'hsl(0 0% 40%)',
						'--tw-prose-td-borders': 'hsl(0 0% 30%)',
						color: 'hsl(0 0% 90%)',
						maxWidth: 'none',
						h1: {
							color: '#81e6d9',
							fontWeight: '700',
						},
						h2: {
							color: '#fff',
							fontWeight: '600',
						},
						h3: {
							color: '#fff',
							fontWeight: '600',
						},
						h4: {
							color: '#a7f0e9',
							fontWeight: '600',
						},
						a: {
							color: '#81e6d9',
							textDecoration: 'none',
							'&:hover': {
								color: '#a7f0e9',
							},
						},
						strong: {
							color: '#fff',
						},
						code: {
							color: '#81e6d9',
							backgroundColor: 'hsl(0 0% 15%)',
							padding: '0.25rem 0.5rem',
							borderRadius: '0.25rem',
							fontWeight: '500',
						},
						'code::before': {
							content: '""',
						},
						'code::after': {
							content: '""',
						},
						pre: {
							backgroundColor: 'hsl(0 0% 15%)',
							color: '#fff',
						},
						blockquote: {
							borderLeftColor: '#81e6d9',
							color: 'hsl(0 0% 85%)',
						},
					},
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'slide-up': 'slide-up 0.6s ease-out'
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		require("@tailwindcss/typography"),
	],
} satisfies Config;
