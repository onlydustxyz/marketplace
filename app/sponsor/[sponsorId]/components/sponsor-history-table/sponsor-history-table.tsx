import { SortDescriptor } from "@nextui-org/react";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { useLocalStorage } from "react-use";
import { Money } from "utils/Money/Money";

import { SponsorHistoryTransaction } from "app/sponsor/[sponsorId]/components/sponsor-history-transaction/sponsor-history-transaction";
import { useSponsorHistory } from "app/sponsor/[sponsorId]/hooks/use-sponsor-history";

import { Chip } from "src/components/Chip/Chip";
import { CurrencyIcons } from "src/components/Currency/CurrencyIcon";
import { Period } from "src/components/New/Field/Datepicker";
import { FilterDatepicker } from "src/components/New/Filter/FilterDatepicker";
import { ShowMore } from "src/components/Table/ShowMore";
import { useCurrenciesOrder } from "src/hooks/useCurrenciesOrder";
import { useIntl } from "src/hooks/useIntl";
import { allTime } from "src/utils/date";

import { Avatar } from "components/ds/avatar/avatar";
import { Card } from "components/ds/card/card";
import { TSelectAutocomplete } from "components/ds/form/select-autocomplete/select-autocomplete.types";
import { Table } from "components/ds/table/table";
import { TTable } from "components/ds/table/table.types";
import { FiltersCurrencies } from "components/features/filters/filters-currencies/filters-currencies";
import { FiltersProjects } from "components/features/filters/filters-projects/filters-projects";
import { Flex } from "components/layout/flex/flex";
import { Typography } from "components/layout/typography/typography";

const projects = [
  {
    id: 123,
    label: "test project",
    value: "test project",
  },
  {
    id: 1234,
    label: "test project",
    value: "test project",
  },
];

// const transactions = [
//   {
//     id: "deposit",
//     label: "Deposit",
//     value: "deposit",
//   },
//   {
//     id: "allocated",
//     label: "Allocated",
//     value: "allocated",
//   },
//   {
//     id: "unallocated",
//     label: "Unallocated",
//     value: "unallocated",
//   },
// ];

type Filters = {
  dateRange: DateRange;
  period: Period;
  transactions: TSelectAutocomplete.Item[];
  projects: TSelectAutocomplete.Item[];
  currency: TSelectAutocomplete.Item[];
};

const initialFilters: Filters = {
  dateRange: allTime,
  period: Period.AllTime,
  transactions: [],
  projects: [],
  currency: [],
};

export function SponsorHistoryTable() {
  const { T } = useIntl();

  const [filtersStorage, setFiltersStorage] = useLocalStorage("sponsor-table-filters", JSON.stringify(initialFilters));
  const [filters, setFilters] = useState<Partial<Filters>>(
    filtersStorage ? JSON.parse(filtersStorage) : initialFilters
  );
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>();
  const orderedCurrencies = useCurrenciesOrder({
    currencies: [
      {
        currency: Money.fromSchema({ code: Money.Static.Currency.USD }),
      },
    ],
  });

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } = useSponsorHistory();

  const transactions = useMemo(() => data?.pages.flatMap(({ transactions }) => transactions) ?? [], [data]);

  function updateState(prevState: Partial<Filters>, newState: Partial<Filters>) {
    const updatedState = { ...prevState, ...newState };

    setFiltersStorage(JSON.stringify(updatedState));

    return updatedState;
  }

  function updateDate(dateRange: DateRange) {
    setFilters(prevState => updateState(prevState, { dateRange }));
  }

  function updatePeriod(period: Period) {
    setFilters(prevState => updateState(prevState, { period }));
  }

  function updateCurrency(currency: TSelectAutocomplete.Item[]) {
    setFilters(prevState =>
      updateState(prevState, {
        currency,
      })
    );
  }

  function handleSort(sort: SortDescriptor) {
    setSortDescriptor(sort);
  }

  const columns: TTable.Column[] = useMemo(
    () => [
      {
        key: "DATE",
        children: T("v2.pages.sponsor.history.date"),
        width: "50%",
        allowsSorting: true,
      },
      {
        key: "TYPE",
        children: T("v2.pages.sponsor.history.transaction"),
        allowsSorting: true,
      },
      {
        key: "AMOUNT",
        children: T("v2.pages.sponsor.history.amount"),
        allowsSorting: true,
      },
      {
        key: "PROJECT",
        children: T("v2.pages.sponsor.history.project"),
        allowsSorting: true,
      },
    ],
    []
  );

  const rows: TTable.Row[] = useMemo(
    () =>
      transactions?.map((t, i) => ({
        key: t.id ?? String(i),
        DATE: format(new Date(t.date), "MMMM dd yyyy, KK:mm a"),
        TYPE: <SponsorHistoryTransaction type={t.type} />,
        AMOUNT: (
          <Flex className="gap-2" alignItems="center">
            <Chip solid className="h-5 w-5">
              <CurrencyIcons currency={t.amount.currency} className="h-5 w-5" />
            </Chip>
            <Typography variant={"body-s"}>
              {
                Money.format({
                  amount: t.amount.amount,
                  currency: t.amount.currency,
                  options: { currencyClassName: "text-body-xs" },
                }).html
              }
            </Typography>
          </Flex>
        ),
        PROJECT: t.project ? (
          <Avatar.Labelled
            avatarProps={{ src: t.project.logoUrl, alt: t.project.name, shape: "square" }}
            labelProps={{ title: t.project.name }}
            className={"max-w-[120px]"}
            truncate
          >
            {t.project.name}
          </Avatar.Labelled>
        ) : (
          "-"
        ),
      })) ?? ([] as TTable.Row[]),
    [transactions]
  );

  return (
    <Card background={"base"} className={"grid gap-5"}>
      <header className={"flex gap-3"}>
        <FilterDatepicker
          selected={filters.dateRange ?? initialFilters.dateRange}
          onChange={updateDate}
          selectedPeriod={filters.period ?? initialFilters.period}
          onPeriodChange={updatePeriod}
          hideLabel
          isElevated={false}
        />
        {/*<FiltersTransactions*/}
        {/*  transactions={transactions}*/}
        {/*  selected={[]}*/}
        {/*  onChange={() => {}}*/}
        {/*  hideLabel*/}
        {/*  isElevated={false}*/}
        {/*/>*/}
        <FiltersCurrencies
          selected={filters.currency ?? initialFilters.currency}
          onChange={updateCurrency}
          currencies={
            orderedCurrencies?.map(({ currency }) => ({
              id: currency.id,
              value: currency.id,
              label: currency.name,
              image: currency.logoUrl,
            })) ?? []
          }
          hideLabel
          isElevated={false}
        />
        <FiltersProjects projects={projects} selected={[]} onChange={() => {}} hideLabel isElevated={false} />
      </header>
      <Table
        label={T("v2.pages.sponsor.history.title")}
        columns={columns}
        rows={rows}
        sortDescriptor={sortDescriptor}
        onSortChange={handleSort}
        bottomContent={hasNextPage ? <ShowMore onClick={fetchNextPage} loading={isFetchingNextPage} /> : null}
      />
    </Card>
  );
}
