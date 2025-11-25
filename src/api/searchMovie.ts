import { queryOptions, useQuery } from '@tanstack/vue-query'
import api from '../utils/api'
import apiEndpoints from '../utils/apiEndpoints'
import { getRestApiUrl } from '../utils/config'
import type { QueryConfig } from '../utils/vue-query'
import type { MoviesResponse } from '../types/movies.types'
import { ref, type Ref } from 'vue'



export const searchMovies = async ({
  Title = ref(""),
  page = ref(1),
}: {
  Title?: Ref<string, string>
  page?: Ref<number, number>
}) => {
  const params = {
    Title: Title.value,
    page: page.value,
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
  page = ref(1),
}: {
  Title?: Ref<string, string>
  page?: Ref<number, number>
}) => ['search-movies', { Title, page }]

export const searchMoviesQueryOptions = ({
  Title = ref(""),
  page = ref(1),
}: {
  Title?: Ref<string, string>
  page?: Ref<number, number>
}) => {
  return queryOptions({
    queryKey: searchMoviesQueryKey({ Title, page }),
    queryFn: () => searchMovies({ Title, page }),
  })
}

type UseSearchMoviesParams = {
  queryConfig?: QueryConfig<typeof searchMovies>
  Title?: Ref<string, string>
  page?: Ref<number, number>
}

export const useSearchMovies = ({
  queryConfig,
  Title = ref(""),
  page = ref(1),
}: UseSearchMoviesParams = {}) => {
  return useQuery({
    ...searchMoviesQueryOptions({ Title, page }),
    ...queryConfig,
  })
}