/**
 * Authentication Configuration
 *
 * Configuration management for authentication API endpoint
 */

const REST_API_URL = import.meta.env.VITE_REST_API_URL

if (!REST_API_URL) {
  console.error('Missing required environment variable: VITE_REST_API_URL')
  console.error(
    'Please check your .env.local file and ensure the authentication API URL is set.',
  )
}

export const config = {
  restApiUrl: REST_API_URL || 'http://localhost:8000',
} as const

export const getRestApiUrl: string = config.restApiUrl


export default config