import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { useParams } from "react-router-dom";
import { useLocalStorage } from "usehooks-ts";

import ProjectApi from "src/api/Project";
import { Period } from "src/components/New/Field/Datepicker";
import { FilterPosition } from "src/components/New/Filter/DesktopView";
import { Filter } from "src/components/New/Filter/Filter";
import { FilterDatepicker } from "src/components/New/Filter/FilterDatepicker";
import { useDatepickerPeriods } from "src/components/New/Filter/FilterDatepicker.hooks";
import { useCurrenciesOrder } from "src/hooks/useCurrenciesOrder";
import { allTime, formatDateQueryParam } from "src/utils/date";

import { FiltersCurrencies } from "components/features/filters/filters-currencies/filters-currencies";
import { FiltersUsers } from "components/features/filters/filters-users/filters-users";
import { TSelectAutocomplete } from "components/ds/form/select-autocomplete/select-autocomplete.types";

type Filters = {
  period: Period;
  dateRange: DateRange;
  contributors: TSelectAutocomplete.Item[];
  currency: TSelectAutocomplete.Item[];
};

const initialFilters: Filters = {
  period: Period.AllTime,
  dateRange: allTime,
  contributors: [],
  currency: [],
};

export type FilterQueryParams = {
  fromDate?: string;
  toDate?: string;
  contributors?: string;
  currencies?: string;
};

export type ProjectRewardsFilterRef = {
  reset: () => void;
  hasActiveFilters: boolean;
};

export const ProjectRewardsFilter = forwardRef(function ProjectRewardsFilter(
  {
    onChange,
    position,
  }: {
    onChange: (filterQueryParams: FilterQueryParams) => void;
    position?: FilterPosition;
  },
  ref: React.Ref<ProjectRewardsFilterRef>
) {
  const { projectKey = "" } = useParams<{ projectKey?: string }>();

  const { data: project } = ProjectApi.queries.useGetProjectBySlug({
    params: { slug: projectKey },
  });

  const { data: projectBudget } = ProjectApi.queries.useProjectBudget({
    params: { projectId: project?.id },
  });

  const orderedCurrencies = useCurrenciesOrder({ currencies: projectBudget?.budgets });

  const [filtersStorage, setFiltersStorage] = useLocalStorage(
    `project-rewards-table-filters-${projectKey}-v2-0-0`,
    JSON.stringify(initialFilters)
  );

  const contributorsQueryState = useState<string>();
  const [contributorsQuery] = contributorsQueryState;

  // Type of partial Filters is required as the shape required by the state may not exist in the user's local storage
  const [filters, setFilters] = useState<Partial<Filters>>(
    filtersStorage ? JSON.parse(filtersStorage) : initialFilters
  );

  const allPeriods = useDatepickerPeriods({ selectedPeriod: filters.period ?? initialFilters.period });

  useEffect(() => {
    const { dateRange, period, contributors, currency } = filters;

    const filterQueryParams: FilterQueryParams = {};

    if (contributors?.length) {
      filterQueryParams.contributors = contributors?.map(({ id }) => String(id)).join(",");
    }
    if (currency?.length) {
      filterQueryParams.currencies = currency.map(({ value }) => String(value)).join(",");
    }

    // If a predefined period is selected, use the predefined period's date range
    if (period !== Period.Custom) {
      const { value } = allPeriods.find(({ id }) => id === period) ?? {};

      if (value?.from && value?.to) {
        filterQueryParams.fromDate = formatDateQueryParam(value.from);
        filterQueryParams.toDate = formatDateQueryParam(value.to);

        onChange(filterQueryParams);

        // Return early to avoid updating the date range twice
        return;
      }
    }

    // If a custom date range is selected, use the custom date range
    if (dateRange) {
      if (dateRange?.from && dateRange?.to) {
        filterQueryParams.fromDate = formatDateQueryParam(dateRange.from);
        filterQueryParams.toDate = formatDateQueryParam(dateRange.to);
      }
    } else {
      // If no date range is selected, use all time
      updateDate(initialFilters.dateRange);
    }

    onChange(filterQueryParams);
  }, [filters]);

  const hasActiveFilters = Boolean(
    filters.period !== initialFilters.period || filters.contributors?.length || filters.currency?.length
  );

  const { data: contributorsData } = ProjectApi.queries.useProjectContributorsInfiniteList({
    params: { projectId: project?.id ?? "", pageSize: 20, queryParams: { login: contributorsQuery ?? "" } },
    options: { enabled: Boolean(project?.id) },
  });
  const contributors = contributorsData?.pages.flatMap(({ contributors }) => contributors) ?? [];

  function resetFilters() {
    setFilters(initialFilters);
    setFiltersStorage(JSON.stringify(initialFilters));
  }

  function updateState(prevState: Partial<Filters>, newState: Partial<Filters>) {
    const updatedState = { ...prevState, ...newState };

    const removeCurrenciesJsx = updatedState.currency?.map(c => ({
      ...c,
      label: "",
    }));

    setFiltersStorage(JSON.stringify({ ...updatedState, currency: removeCurrenciesJsx }));

    return updatedState;
  }

  function updateDate(dateRange: DateRange) {
    setFilters(prevState => updateState(prevState, { dateRange }));
  }

  function updatePeriod(period: Period) {
    setFilters(prevState => updateState(prevState, { period }));
  }

  function updateContributors(contributors: TSelectAutocomplete.Item[]) {
    setFilters(prevState => updateState(prevState, { contributors }));
  }

  function updateCurrency(currency: TSelectAutocomplete.Item[]) {
    setFilters(prevState =>
      updateState(prevState, {
        currency,
      })
    );
  }

  useImperativeHandle(
    ref,
    () => {
      return {
        reset: resetFilters,
        hasActiveFilters,
      };
    },
    [hasActiveFilters]
  );

  const filterCount = useMemo(() => {
    let count = 0;

    if (filters.contributors?.length) {
      count += 1;
    }

    if (filters.currency?.length) {
      count += 1;
    }

    if (filters.period !== initialFilters.period) {
      count += 1;
    }
    return count;
  }, [filters]);

  return (
    <Filter isActive={hasActiveFilters} onClear={resetFilters} position={position} count={filterCount}>
      <div className="focus-within:z-10">
        <FilterDatepicker
          selected={filters.dateRange ?? initialFilters.dateRange}
          selectedPeriod={filters.period ?? initialFilters.period}
          onChange={updateDate}
          onPeriodChange={updatePeriod}
        />
      </div>
      <div className="focus-within:z-10">
        <FiltersUsers
          users={contributors.map(({ login, githubUserId, avatarUrl }) => ({
            id: githubUserId,
            value: `${githubUserId}`,
            label: login,
            image: avatarUrl,
          }))}
          selected={filters.contributors ?? initialFilters.contributors}
          onChange={updateContributors}
        />
      </div>
      <div className="focus-within:z-10">
        {projectBudget ? (
          <FiltersCurrencies
            selected={filters.currency ?? initialFilters.currency}
            onChange={updateCurrency}
            currencies={
              orderedCurrencies?.map(currency => ({
                id: currency.currency,
                value: currency.currency,
              })) ?? []
            }
          />
        ) : null}
      </div>
    </Filter>
  );
});
