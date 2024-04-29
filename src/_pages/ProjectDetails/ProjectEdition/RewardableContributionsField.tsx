import sub from "date-fns/sub";
import { ComponentProps, forwardRef, useState } from "react";

import { components } from "src/__generated/api";
import EyeCheckLine from "src/assets/icons/EyeCheckLine";
import IssueOpen from "src/assets/icons/IssueOpen";
import { FormOption, Size as FormOptionSize, Variant } from "src/components/FormOption/FormOption";
import { Datepicker, Period } from "src/components/New/Field/Datepicker";
import { Field } from "src/components/New/Field/Field";
import Flex from "src/components/Utils/Flex";
import GitPullRequestLine from "src/icons/GitPullRequestLine";
import InformationLine from "src/icons/InformationLine";
import { GithubContributionType } from "src/types";

import { useIntl } from "hooks/translate/use-translate";

type RewardableContributionsFieldProps = {
  value?: components["schemas"]["ProjectRewardSettings"];
  onChange: (data: components["schemas"]["ProjectRewardSettings"]) => void;
};

export const RewardableContributionsField = forwardRef(function RewardableContributionsField(
  { value, onChange }: RewardableContributionsFieldProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const { T } = useIntl();
  const [period, setPeriod] = useState(Period.AllTime);

  function handleContributionChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();

    value &&
      onChange({
        ...value,
        [e.target.name]: !value[e.target.name as keyof typeof value],
      });
  }

  function handleDateChange(date: ComponentProps<typeof Datepicker>["value"]) {
    onChange({ ...value, ignoreContributionsBefore: date?.toString() });
  }

  const typeOptions: { name: string; value: GithubContributionType; icon: JSX.Element; label: string }[] = [
    {
      name: "ignorePullRequests",
      value: GithubContributionType.PullRequest,
      icon: <GitPullRequestLine className="text-base leading-none" />,
      label: T("project.details.edit.fields.rewardableContributions.pullRequests"),
    },
    {
      name: "ignoreIssues",
      value: GithubContributionType.Issue,
      icon: <IssueOpen className="h-3.5 w-3.5" />,
      label: T("project.details.edit.fields.rewardableContributions.issues"),
    },
    {
      name: "ignoreCodeReviews",
      value: GithubContributionType.CodeReview,
      icon: <EyeCheckLine className="h-4 w-4" />,
      label: T("project.details.edit.fields.rewardableContributions.codeReviews"),
    },
  ];

  return (
    <Field
      label={T("project.details.edit.fields.rewardableContributions.label")}
      name="rewardable_contributions"
      infoMessage={{
        children: T("project.details.edit.fields.rewardableContributions.message"),
        icon: ({ className }) => <InformationLine className={className} />,
      }}
    >
      <Flex className="flex-col gap-4 md:flex-row md:items-center">
        <Flex className="gap-3 max-sm:flex-wrap">
          {typeOptions.map(option => (
            <div className="flex" key={option.value}>
              <FormOption
                ref={ref}
                as="button"
                size={FormOptionSize.Md}
                name={option.name}
                value={option.value}
                variant={value?.[option.name as keyof typeof value] ? Variant.Default : Variant.Active}
                onClick={handleContributionChange}
              >
                {option.icon}
                {option.label}
              </FormOption>
            </div>
          ))}
        </Flex>
        <Flex className="items-center gap-2">
          <span className="font-walsheim text-sm text-greyscale-300">
            {T("project.details.edit.fields.date.since")}
          </span>
          <div className="w-60">
            <Datepicker
              mode="single"
              value={value?.ignoreContributionsBefore ? new Date(value.ignoreContributionsBefore) : undefined}
              onChange={handleDateChange}
              selectedPeriod={period}
              onPeriodChange={setPeriod}
              periods={[
                {
                  id: Period.LastMonth,
                  label: T("common.periods.lastMonth"),
                  value: sub(new Date(), {
                    months: 1,
                  }),
                  isActive: period === Period.LastMonth,
                },
                {
                  id: Period.Last6Months,
                  label: T("common.periods.last6Months"),
                  value: sub(new Date(), {
                    months: 6,
                  }),
                  isActive: period === Period.Last6Months,
                },
                {
                  id: Period.LastYear,
                  label: T("common.periods.lastYear"),
                  value: sub(new Date(), {
                    years: 1,
                  }),
                  isActive: period === Period.LastYear,
                },
                {
                  id: Period.Forever,
                  label: T("common.periods.forever"),
                  value: new Date(0),
                  isActive: period === Period.Forever,
                },
              ]}
            />
          </div>
        </Flex>
      </Flex>
    </Field>
  );
});
