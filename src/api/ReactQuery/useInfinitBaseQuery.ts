import { getEndpointUrl } from "src/utils/getEndpointUrl";
import { useHttpOptions } from "src/hooks/useHttpOptions/useHttpOptions";
import { QueryParam } from "./query.type";
import { UseInfiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";

export interface useInfiniteBaseQueryProps {
  resourcePath: string;
  pageSize?: number;
  pathParam?: string | Record<string, string>;
  queryParams?: QueryParam[];
}

export type useInfiniteBaseQueryOptions<R extends InifiniteQueryResponseData> = Omit<
  UseInfiniteQueryOptions<R>,
  "queryFn" | "initialPageParam" | "getNextPageParam" | "select"
> &
  Partial<Pick<UseInfiniteQueryOptions<R>, "initialPageParam" | "getNextPageParam">>;

export type InifiniteQueryResponseData = {
  totalPageNumber: number;
  totalItemNumber: number;
  hasMore: boolean;
  nextPageIndex: number;
};

export function useInfiniteBaseQuery<R extends InifiniteQueryResponseData>(
  { resourcePath, pageSize = 10, pathParam = "", queryParams = [] }: useInfiniteBaseQueryProps,
  queryOptions: useInfiniteBaseQueryOptions<R>
) {
  const {
    queryKey,
    initialPageParam = 0,
    getNextPageParam = lastPage => (lastPage?.hasMore ? lastPage.nextPageIndex : undefined),
    refetchInterval = false,
    refetchIntervalInBackground = false,
    enabled,
    ...restQueryOptions
  } = queryOptions;
  const { options, isImpersonating, isValidImpersonation } = useHttpOptions("GET");

  return useInfiniteQuery<R>({
    queryKey: [isImpersonating, isValidImpersonation, ...queryKey],
    queryFn: ({ pageParam }) =>
      fetch(
        getEndpointUrl({
          resourcePath,
          pageParam: typeof pageParam === "number" ? pageParam : 0,
          pageSize,
          pathParam,
          queryParams,
        }),
        options
      )
        .then(res => {
          if (res.ok) {
            return res.json();
          }

          throw new Error(res.statusText);
        })
        .catch(e => {
          throw new Error(e);
        }),
    select: data => {
      // Make sure to return an object that includes the `pages` and `pageParams` properties
      return {
        pages: data.pages,
        pageParams: data.pageParams,
      };
    },
    initialPageParam,
    getNextPageParam,
    refetchInterval,
    refetchIntervalInBackground,
    enabled: isImpersonating ? isValidImpersonation && enabled : enabled,
    ...restQueryOptions,
  });
}
