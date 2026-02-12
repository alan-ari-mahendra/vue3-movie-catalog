import { QueryClient } from '@tanstack/vue-query'
import type { UseMutationOptions } from '@tanstack/vue-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, 
      gcTime: 10 * 60 * 1000, 
    },
  }
})


type AsyncFunction<TArgs extends unknown[] = unknown[], TReturn = unknown> = (
  ...args: TArgs
) => Promise<TReturn>


export type ApiFnReturnType<FnType extends AsyncFunction> =
  Awaited<ReturnType<FnType>>


export type QueryConfig<T extends (...args: never[]) => unknown> = Omit<
  ReturnType<T>,
  'queryKey' | 'queryFn'
>

export type MutationConfig<
  MutationFnType extends AsyncFunction
> = UseMutationOptions<
  ApiFnReturnType<MutationFnType>,
  Error,
  Parameters<MutationFnType>[0]
>