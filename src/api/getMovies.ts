import { queryOptions, useQuery } from '@tanstack/vue-query'
import api from '../utils/api'
import apiEndpoints from '../utils/apiEndpoints'
import { getRestApiUrl } from '../utils/config'
import type { QueryConfig } from '../utils/vue-query'
import type { MoviesResponse } from '../types/movies.types'
import { ref, type Ref } from 'vue'



export const getMovies = async ({
  page = ref(1),
}: {
  page?: Ref<number, number>
}) => {
  const params = {
    page: page.value,
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
  page = ref(1),
}: {
  page?: Ref<number, number>
}) => ['movies', { page }]

export const getMoviesQueryOptions = ({
  page = ref(1),
}: {
  page?: Ref<number, number>
}) => {
  return queryOptions({
    queryKey: getMoviesQueryKey({ page}),
    queryFn: () => getMovies({ page}),
  })
}

type UseGetMoviesParams = {
  queryConfig?: QueryConfig<typeof getMovies>
  page?: Ref<number, number>
}

export const useGetMovies = ({
  queryConfig,
  page = ref(1),
}: UseGetMoviesParams = {}) => {
  return useQuery({
    ...getMoviesQueryOptions({ page }),
    ...queryConfig,
  })
}
