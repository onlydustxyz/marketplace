import { isString } from "lodash";
import { useParams } from "next/navigation";

import { SponsorBudgetCard } from "app/sponsor/[sponsorId]/components/sponsor-budget-card/sponsor-budget-card";
import { SponsorDepositCard } from "app/sponsor/[sponsorId]/components/sponsor-deposit-card/sponsor-deposit-card";

import SponsorApi from "src/api/Sponsors";

import { Translate } from "components/layout/translate/translate";
import { Typography } from "components/layout/typography/typography";

export function SponsorSectionBudget() {
  const { sponsorId } = useParams();

  const sponsorIdIsString = isString(sponsorId);

  const { data, isLoading } = SponsorApi.queries.useGetSponsorById({
    params: {
      sponsorId: sponsorIdIsString ? sponsorId : "",
    },
    options: {
      enabled: sponsorIdIsString,
    },
  });

  function renderBudgets() {
    if (isLoading) {
      return Array.from({ length: 4 }).map((_, i) => <SponsorBudgetCard.Skeleton key={i} />);
    }

    if (data) {
      return data.availableBudgets.map((budget, i) => <SponsorBudgetCard key={`${budget.amount}_${i}`} {...budget} />);
    }

    return null;
  }

  return (
    <section className={"grid gap-5"}>
      <Typography variant={"title-m"}>
        <Translate token="v2.pages.sponsor.budget.title" />
      </Typography>

      <div className={"grid gap-3 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"}>
        {renderBudgets()}
        <SponsorDepositCard />
      </div>
    </section>
  );
}