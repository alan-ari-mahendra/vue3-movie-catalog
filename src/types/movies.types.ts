export type MovieItem = {
  Title: string
  Year: number
  imdbID: string
}

export type MoviesResponse = {
  page: number
  per_page: number
  total: number
  total_pages: number
  data: MovieItem[]
}