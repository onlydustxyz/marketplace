import { useMemo, useState } from "react";
import { FilterQueryParams } from "../Filter";
import MeApi from "src/api/me";
import useQueryParamsSorting from "src/components/RewardTable/useQueryParamsSorting";
import { Fields } from "src/components/UserRewardTable/Headers";
import { UserRewardsContextProps } from "./UserRewards.type";
import { UserRewardsContext } from "./UserRewards";

export function UserRewardsProvider({ children }: UserRewardsContextProps) {
  const [filterQueryParams, setFilterQueryParams] = useState<FilterQueryParams>({});

  const dateSorting = useQueryParamsSorting({
    field: Fields.Date,
    isAscending: false,
    storageKey: "myRewardsSorting",
  });

  const myRewardsInfiniteList = MeApi.queries.useMyRewardsInfiniteList({
    queryParams: {
      ...(dateSorting.queryParams as URLSearchParams),
      ...filterQueryParams,
    },
  });

  const rewards = useMemo(
    () => myRewardsInfiniteList.data?.pages.flatMap(page => page.rewards),
    [myRewardsInfiniteList]
  );

  const earning = useMemo(
    () => ({
      rewardedAmount: myRewardsInfiniteList.data?.pages[0].rewardedAmount,
      pendingAmount: myRewardsInfiniteList.data?.pages[0].pendingAmount,
      receivedRewards: {
        count: myRewardsInfiniteList.data?.pages[0].receivedRewardsCount,
        total: myRewardsInfiniteList.data?.pages[0].rewardedContributionsCount,
      },
      rewardingProjectsCount: myRewardsInfiniteList.data?.pages[0].rewardingProjectsCount,
    }),
    [myRewardsInfiniteList]
  );

  return (
    <UserRewardsContext.Provider
      value={{
        earning,
        rewards,
        filterQueryParams,
        setFilterQueryParams,
        dateSorting,
        query: myRewardsInfiniteList,
      }}
    >
      {children}
    </UserRewardsContext.Provider>
  );
}
