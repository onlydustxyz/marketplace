"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { createContext, useEffect, useMemo, useState } from "react";
import { useDebounce } from "usehooks-ts";

import ProjectApi from "src/api/Project";
import { useInfiniteBaseQueryProps } from "src/api/useInfiniteBaseQuery";

import { TProjectContext } from "./project.context.types";

export const ProjectsContext = createContext<TProjectContext.Return>({
  projects: [],
  fetchNextPage: () => null,
  hasNextPage: false,
  isFetchingNextPage: false,
  isLoading: false,
  count: 0,
  filters: {
    values: TProjectContext.DEFAULT_FILTER,
    isCleared: true,
    count: 0,
    set: () => null,
    clear: () => null,
    options: {
      languages: [],
      ecosystems: [],
    },
  },
});

export function ProjectsContextProvider({ children }: TProjectContext.Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<TProjectContext.Filter>({ ...TProjectContext.DEFAULT_FILTER });
  const [filtersOptions, setFiltersOptions] = useState<TProjectContext.FiltersOptions>({
    languages: [],
    ecosystems: [],
  });

  const getFiltersFromURL = () => {
    const urlParams = new URLSearchParams(searchParams.toString());
    const filters: TProjectContext.Filter = { ...TProjectContext.DEFAULT_FILTER };

    const tags = urlParams.getAll("tags");
    const languages = urlParams.getAll("languages");
    const ecosystems = urlParams.getAll("ecosystems");
    const search = urlParams.get("search");
    const sort = urlParams.get("sort");

    if (tags.length > 0) {
      filters.tags = tags as TProjectContext.Filter["tags"];
    }

    if (languages.length > 0) {
      // We have to map the languages to the correct format, because of the type of the filter - TSelectAutocomplete.Item[]
      filters.languages = languages.map(value => ({
        id: value,
        value,
      }));
    }

    if (ecosystems.length > 0) {
      // We have to map the ecosystems to the correct format, because of the type of the filter - TSelectAutocomplete.Item[]
      filters.ecosystems = ecosystems.map(value => ({
        id: value,
        value,
      }));
    }

    if (search) {
      filters.search = search!;
    }

    if (sort) {
      filters.sorting = sort as TProjectContext.Filter["sorting"];
    }

    return filters;
  };

  const updateURLWithFilters = (filters: TProjectContext.Filter) => {
    const urlParams = new URLSearchParams();

    filters.tags.forEach(tag => urlParams.append("tags", tag));
    filters.ecosystems.forEach(({ value }) => urlParams.append("ecosystems", value));
    filters.languages.forEach(({ value }) => urlParams.append("languages", value));

    if (filters.search) {
      urlParams.set("search", filters.search);
    }

    const hasOtherFilters =
      filters.tags.length > 0 || filters.ecosystems.length > 0 || filters.languages.length > 0 || filters.search;

    if (filters.sorting && (hasOtherFilters || filters.sorting !== TProjectContext.DEFAULT_SORTING)) {
      urlParams.set("sort", filters.sorting);
    }

    router.replace(`?${urlParams.toString()}`);
  };

  useEffect(() => {
    const initialFilters = getFiltersFromURL();
    setFilters(initialFilters);
  }, [searchParams]);

  const queryParams = useMemo(() => {
    const params: useInfiniteBaseQueryProps["queryParams"] = [
      filters.tags.length > 0 ? ["tags", filters.tags.join(",")] : null,
      filters.languages.length > 0 ? ["languages", filters.languages.map(({ value }) => value).join(",")] : null,
      filters.ecosystems.length > 0 ? ["ecosystemSlug", filters.ecosystems.map(({ value }) => value).join(",")] : null,
      filters.search ? ["search", filters.search] : null,
      filters.sorting ? ["sort", filters.sorting] : null,
    ].filter((param): param is string[] => Boolean(param));

    return params;
  }, [filters]);

  const debouncedQueryParams = useDebounce(queryParams, 300);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = ProjectApi.queries.useInfiniteList({
    queryParams: debouncedQueryParams,
  });

  const isCleared = useMemo(() => JSON.stringify(filters) == JSON.stringify(TProjectContext.DEFAULT_FILTER), [filters]);
  const count = useMemo(() => data?.pages[0]?.totalItemNumber || 0, [data]);

  const projects = useMemo(() => data?.pages?.flatMap(({ projects }) => projects) ?? [], [data]);
  const filtersCount = useMemo(() => {
    return filters.tags.length + filters.ecosystems.length + filters.languages.length;
  }, [filters]);

  function onFilterChange(newFilter: Partial<TProjectContext.Filter>) {
    const filtersValues = { ...filters, ...newFilter };
    setFilters(filtersValues);
    updateURLWithFilters(filtersValues);
  }

  function onClearFilter() {
    const clearFilters = {
      ...filters,
      tags: [],
      ecosystems: [],
      languages: [],
    };

    setFilters(clearFilters);
    updateURLWithFilters(clearFilters);
  }

  useEffect(() => {
    if (data?.pages[0]) {
      const newLanguages = data?.pages[0]?.languages;
      const newEcosystems = data?.pages[0]?.ecosystems;
      setFiltersOptions(prevOptions => ({
        ...prevOptions,
        languages: newLanguages?.length
          ? newLanguages.map(({ name, id }) => ({
              id,
              label: name,
              value: id,
            }))
          : prevOptions.languages,
        ecosystems: newEcosystems?.length
          ? newEcosystems.map(({ name, id, logoUrl, slug }) => ({
              id,
              label: name,
              value: slug,
              image: logoUrl,
            }))
          : prevOptions.ecosystems,
      }));
    }
  }, [data]);

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        fetchNextPage,
        isFetchingNextPage,
        isLoading,
        hasNextPage,
        count,
        filters: {
          values: filters,
          isCleared,
          set: onFilterChange,
          count: filtersCount,
          clear: onClearFilter,
          options: filtersOptions,
        },
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}
