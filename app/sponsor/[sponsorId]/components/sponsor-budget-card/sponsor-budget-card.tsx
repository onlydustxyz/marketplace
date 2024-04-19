import { useMediaQuery } from "usehooks-ts";
import { Money } from "utils/Money/Money";

import { TSponsorBudgetCard } from "app/sponsor/[sponsorId]/components/sponsor-budget-card/sponsor-budget-card.types";

import { viewportConfig } from "src/config";

import { Avatar } from "components/ds/avatar/avatar";
import { Card } from "components/ds/card/card";
import { SkeletonEl } from "components/ds/skeleton/skeleton";
import { Typography } from "components/layout/typography/typography";

export function SponsorBudgetCard({ currency, amount }: TSponsorBudgetCard.Props) {
  return (
    <Card background={"base"}>
      <div className={"flex items-center justify-between sm:hidden"}>
        <Typography variant={"body-l-bold"}>
          {
            Money.format({
              amount,
              currency,
              options: { currencyClassName: "od-text-body-m" },
            }).html
          }
        </Typography>

        <Avatar src={currency.logoUrl} alt={currency.name} size={"s"} />
      </div>

      <div className={"hidden justify-center gap-5 text-center sm:grid"}>
        <div className={"grid justify-items-center gap-2"}>
          <Avatar src={currency.logoUrl} alt={currency.name} size={"l"} />
          <Typography variant={"body-l"}>{currency.name}</Typography>
        </div>

        <Typography variant={"body-xl-bold"}>
          {
            Money.format({
              amount,
              currency,
              options: { currencyClassName: "od-text-body-l-bold" },
            }).html
          }
        </Typography>
      </div>
    </Card>
  );
}

export function SponsorBudgetCardSkeleton() {
  const isSm = useMediaQuery(`(min-width: ${viewportConfig.breakpoints.sm}px)`);
  const height = isSm ? "174px" : "62px";
  return <SkeletonEl width="100%" height={height} variant="rounded" />;
}
