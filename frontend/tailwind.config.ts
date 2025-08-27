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
			fontFamily: {
				'sans': ['Inter', 'system-ui', 'sans-serif'],
				'heading': ['Poppins', 'system-ui', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#1e3a5f',
					foreground: '#ffffff',
					dark: '#0f1b2f',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				accent: {
					DEFAULT: '#ff6b35',
					light: '#ff8c65',
					foreground: '#ffffff',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				gray: {
					50: '#f8fafc',
					600: '#64748b',
					800: '#334155',
				},
				emerald: {
					500: '#10b981',
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
				}
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
				'fade-in-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'zoom': {
					'0%': {
						transform: 'scale(1)'
					},
					'100%': {
						transform: 'scale(1.05)'
					}
				},
				'zoom-pulse': {
					'0%, 100%': {
						transform: 'scale(1)'
					},
					'50%': {
						transform: 'scale(1.08)'
					}
				},
				'pan': {
					'0%': {
						transform: 'translateX(0) translateY(0) scale(1.1)'
					},
					'25%': {
						transform: 'translateX(-2%) translateY(-1%) scale(1.12)'
					},
					'50%': {
						transform: 'translateX(-1%) translateY(-2%) scale(1.15)'
					},
					'75%': {
						transform: 'translateX(1%) translateY(-1%) scale(1.12)'
					},
					'100%': {
						transform: 'translateX(0) translateY(0) scale(1.1)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px) rotate(0deg)'
					},
					'33%': {
						transform: 'translateY(-20px) rotate(1deg)'
					},
					'66%': {
						transform: 'translateY(-10px) rotate(-1deg)'
					}
				},
				'gradient-shift': {
					'0%': {
						background: 'linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.3), rgba(0,0,0,0.4))'
					},
					'50%': {
						background: 'linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.2), rgba(0,0,0,0.6))'
					},
					'100%': {
						background: 'linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.3), rgba(0,0,0,0.4))'
					}
				},
				'fade-pulse': {
					'0%, 100%': {
						opacity: '1'
					},
					'50%': {
						opacity: '0.7'
					}
				},
				'float-particle': {
					'0%, 100%': {
						transform: 'translateY(0px) translateX(0px) scale(1)',
						opacity: '0.3'
					},
					'25%': {
						transform: 'translateY(-30px) translateX(10px) scale(1.2)',
						opacity: '0.8'
					},
					'50%': {
						transform: 'translateY(-60px) translateX(-5px) scale(0.8)',
						opacity: '0.5'
					},
					'75%': {
						transform: 'translateY(-30px) translateX(-10px) scale(1.1)',
						opacity: '0.7'
					}
				},
				'light-ray': {
					'0%, 100%': {
						opacity: '0.2',
						transform: 'rotate(12deg) scaleY(1)'
					},
					'50%': {
						opacity: '0.5',
						transform: 'rotate(15deg) scaleY(1.2)'
					}
				},
				'slide-in-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(50px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'glow': {
					'0%, 100%': {
						textShadow: '0 0 20px rgba(255, 107, 53, 0.3)'
					},
					'50%': {
						textShadow: '0 0 40px rgba(255, 107, 53, 0.6), 0 0 60px rgba(255, 107, 53, 0.4)'
					}
				},
				'text-glow': {
					'0%, 100%': {
						textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
					},
					'50%': {
						textShadow: '0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 107, 53, 0.4)'
					}
				},
				'color-shift': {
					'0%, 100%': {
						color: '#ffffff'
					},
					'50%': {
						color: '#ff6b35'
					}
				},
				'form-float': {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-5px)'
					}
				},
				'glass-shimmer': {
					'0%': {
						background: 'rgba(255, 255, 255, 0.1)'
					},
					'50%': {
						background: 'rgba(255, 255, 255, 0.15)'
					},
					'100%': {
						background: 'rgba(255, 255, 255, 0.1)'
					}
				},
				'button-glow': {
					'0%, 100%': {
						boxShadow: '0 0 20px rgba(255, 107, 53, 0.5)'
					},
					'50%': {
						boxShadow: '0 0 40px rgba(255, 107, 53, 0.8), 0 0 60px rgba(255, 107, 53, 0.3)'
					}
				},
				'subtle-pulse': {
					'0%, 100%': {
						opacity: '1',
						transform: 'scale(1)'
					},
					'50%': {
						opacity: '0.9',
						transform: 'scale(1.02)'
					}
				},
				'button-pulse': {
					'0%, 100%': {
						transform: 'scale(1)'
					},
					'50%': {
						transform: 'scale(1.05)'
					}
				},
				'stats-float': {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-3px)'
					}
				},
				'dot-pulse': {
					'0%, 100%': {
						opacity: '1',
						transform: 'scale(1)'
					},
					'50%': {
						opacity: '0.5',
						transform: 'scale(1.3)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in-up': 'fade-in-up 0.6s ease-out',
				'zoom': 'zoom 20s ease-in-out infinite alternate',
				'zoom-pulse': 'zoom-pulse 25s ease-in-out infinite',
				'pan': 'pan 40s ease-in-out infinite alternate',
				'float': 'float 30s ease-in-out infinite',
				'gradient-shift': 'gradient-shift 15s ease-in-out infinite alternate',
				'fade-pulse': 'fade-pulse 20s ease-in-out infinite',
				'float-particle': 'float-particle 8s ease-in-out infinite',
				'light-ray': 'light-ray 18s ease-in-out infinite',
				'slide-in-up': 'slide-in-up 1.2s ease-out',
				'glow': 'glow 3s ease-in-out infinite alternate',
				'text-glow': 'text-glow 4s ease-in-out infinite alternate',
				'color-shift': 'color-shift 6s ease-in-out infinite alternate',
				'form-float': 'form-float 20s ease-in-out infinite',
				'glass-shimmer': 'glass-shimmer 8s ease-in-out infinite',
				'button-glow': 'button-glow 2s ease-in-out infinite alternate',
				'subtle-pulse': 'subtle-pulse 4s ease-in-out infinite',
				'button-pulse': 'button-pulse 3s ease-in-out infinite',
				'stats-float': 'stats-float 6s ease-in-out infinite',
				'dot-pulse': 'dot-pulse 2s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
