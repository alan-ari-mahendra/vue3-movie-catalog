import axios, { type AxiosResponse, AxiosError } from 'axios'
import { getRestApiUrl } from './config'

type QueryParamValue = string | number | boolean | null | undefined
type QueryParams = Record<string, QueryParamValue>

interface ApiError {
  code: string
  message: string
  status: number
  data: Record<string, unknown>
}

type ApiVariables = Record<string, unknown>

interface ApiErrorResponse {
  message?: string
  error?: string
}

export const objectToQueryString = (params: QueryParams = {}) => {
  const esc = encodeURIComponent
  return Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null)
    .map((k) => esc(k) + '=' + esc(String(params[k])))
    .join('&')
}

const defaults = {
  baseURL: getRestApiUrl || 'http://localhost:8000',
  error: {
    code: 'INTERNAL_ERROR',
    message:
      'Something went wrong. Please check your internet connection or contact our support.',
    status: 503,
    data: {},
  } as ApiError,
}

const getHeaders = async (
  contentType?: string,
): Promise<Record<string, string | undefined>> => {
  return {
    'Content-Type': contentType || 'application/json',
  }
}

const api = async <T>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  options?: {
    params?: ApiVariables
    data?: ApiVariables
    contentType?: string
  },
  baseURL?: string,
): Promise<T> => {
  const headers = await getHeaders(options?.contentType)
  try {
    const params = options?.params || {}
    Object.keys(params).forEach(
      (key) => params[key] === undefined && delete params[key],
    )
    const response: AxiosResponse<T> = await axios({
      url: `${baseURL || defaults.baseURL}${url}`,
      method,
      headers,
      params,
      data: options?.data,
      paramsSerializer: objectToQueryString,
    })
    return response.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>
      
      if (axiosError.response) {
        if (axiosError.response.status === 401) {
          throw { message: 'Session expired. Please log in again.' }
        }
        
        if (
          axiosError.response.data?.error &&
          axiosError.response.status !== 503 &&
          axiosError.response.status !== 401
        ) {
          throw {
            message: axiosError.response.data.message,
            error: axiosError.response.data.error,
            status: axiosError.response.status,
          }
        }
      }
    }
    throw defaults.error
  }
}


export default {
  get: <T>(
    url: string,
    options?: { params?: ApiVariables; contentType?: string },
    baseURL?: string,
  ): Promise<T> => api<T>('get', url, options, baseURL),
  post: <T>(
    url: string,
    options?: {
      data?: ApiVariables
      params?: ApiVariables
      contentType?: string
    },
    baseURL?: string,
  ): Promise<T> => api<T>('post', url, options, baseURL),
  put: <T>(
    url: string,
    options?: { data?: ApiVariables; contentType?: string },
    baseURL?: string,
  ): Promise<T> => api<T>('put', url, options, baseURL),
  patch: <T>(
    url: string,
    options?: { data?: ApiVariables; contentType?: string },
    baseURL?: string,
  ): Promise<T> => api<T>('patch', url, options, baseURL),
  delete: <T>(
    url: string,
    options?: { params?: ApiVariables; contentType?: string },
    baseURL?: string,
  ): Promise<T> => api<T>('delete', url, options, baseURL),
}