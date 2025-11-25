import { queryOptions, useQuery } from '@tanstack/vue-query'
import api from '../utils/api'
import apiEndpoints from '../utils/apiEndpoints'
import { getRestApiUrl } from '../utils/config'
import type { QueryConfig } from '../utils/vue-query'
import type { MoviesResponse } from '../types/movies.types'
import { ref, type Ref } from 'vue'



export const searchMovies = async ({
  Title = ref(""),
}: {
  Title?: Ref<string, string>
}) => {
  const params = {
    Title: Title.value,
  }

  const response = await api.get<MoviesResponse>(
    apiEndpoints.searchMovies,
    {
      params,
    },
    getRestApiUrl,
  )
  return response
}

export const searchMoviesQueryKey = ({
  Title = ref(""),
}: {
  Title?: Ref<string, string>
}) => ['search-movies', { Title }]

export const searchMoviesQueryOptions = ({
  Title = ref(""),
}: {
  Title?: Ref<string, string>
}) => {
  return queryOptions({
    queryKey: searchMoviesQueryKey({ Title}),
    queryFn: () => searchMovies({ Title}),
  })
}

type UseSearchMoviesParams = {
  queryConfig?: QueryConfig<typeof searchMovies>
  Title?: Ref<string, string>
}

export const useSearchMovies = ({
  queryConfig,
  Title = ref(""),
}: UseSearchMoviesParams = {}) => {
  return useQuery({
    ...searchMoviesQueryOptions({ Title }),
    ...queryConfig,
  })
}
