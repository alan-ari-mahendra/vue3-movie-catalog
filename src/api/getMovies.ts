import { queryOptions, useQuery } from '@tanstack/vue-query'
import api from '../utils/api'
import apiEndpoints from '../utils/apiEndpoints'
import { getRestApiUrl } from '../utils/config'
import type { QueryConfig } from '../utils/vue-query'
import type { MoviesResponse } from '../types/movies.types'



export const getMovies = async ({
  page = 1,
}: {
  page?: number
}) => {
  const params = {
    page: page.toString(),
  }

  const response = await api.get<MoviesResponse>(
    apiEndpoints.movies,
    {
      params,
    },
    getRestApiUrl,
  )
  return response
}

export const getMoviesQueryKey = ({
  page = 1,
}: {
  page?: number
}) => ['movies', { page }]

export const getMoviesQueryOptions = ({
  page = 1,
}: {
  page?: number
}) => {
  return queryOptions({
    queryKey: getMoviesQueryKey({ page}),
    queryFn: () => getMovies({ page}),
  })
}

type UseGetMoviesParams = {
  queryConfig?: QueryConfig<typeof getMovies>
  page?: number
}

export const useGetMovies = ({
  queryConfig,
  page = 1,
}: UseGetMoviesParams = {}) => {
  return useQuery({
    ...getMoviesQueryOptions({ page }),
    ...queryConfig,
  })
}
