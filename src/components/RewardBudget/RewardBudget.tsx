import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";
import { RewardBudgetSelect } from "./RewardBudgetSelect/RewardBudgetSelect";
import { RewardBudgetProps, WorkEstimationBudgetDetails } from "./RewardBudget.type";
import { FieldInput } from "src/components/New/Field/Input";
import { FieldInfoMessage } from "src/components/New/Field/InfoMessage";
import { useIntl } from "src/hooks/useIntl";
import InformationLine from "src/icons/InformationLine";
import RewardBudgetDetails from "./Details/RewardBudgetDetails";
import Button from "src/components/Button";
import { Width } from "src/components/Button";
import CheckLine from "src/icons/CheckLine";
import RewardBudgetBar from "./BudgetBar/RewardBudgetBar";
import { RewardBudgetUtils } from "./RewardBudget.utils";

export const RewardBudget: FC<RewardBudgetProps> = props => {
  const { T } = useIntl();
  const [selectedBudget, setSelectedBudget] = useState<WorkEstimationBudgetDetails>(props.budgets[0]);
  const [amount, setAmount] = useState<number | undefined>(0);
  const withDefaultAmount = useMemo(() => amount || 0, [amount]);

  useEffect(() => {
    if (props.preferedCurrency) {
      const find = props.budgets.find(b => b.currency === props.preferedCurrency);
      if (find) {
        setSelectedBudget(find);
      }
    }
  }, [props.preferedCurrency, selectedBudget]);

  const onSelectedBudgetChange = (newBudget: WorkEstimationBudgetDetails) => {
    setSelectedBudget(newBudget);
    setAmount(0);
  };

  const onChangeAmount = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "") {
      setAmount(undefined);
    }
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setAmount(value);
    }
  };

  const handleSave = () => {
    if (props.onChange && selectedBudget.remaining > 0 && selectedBudget.remaining - withDefaultAmount > 0) {
      props.onChange({
        amount: withDefaultAmount,
        currency: selectedBudget.currency,
      });
    }
  };

  const selectedBudgetDollarEquivalent = useMemo(
    () =>
      RewardBudgetUtils.getDollarEquivalent({ rate: selectedBudget.dollarsConversionRate, amount: withDefaultAmount }),
    [selectedBudget, withDefaultAmount]
  );

  const canRewards = useMemo(
    () => RewardBudgetUtils.canRewards({ remaining: selectedBudget.remaining, amount: withDefaultAmount }),
    [selectedBudget, withDefaultAmount]
  );

  return (
    <div className="flex w-full flex-col rounded-2xl border border-greyscale-50/8 bg-white/5 shadow-light">
      <div className="flex w-full flex-col px-8 pb-2 pt-4">
        <div className="flex w-full flex-col gap-2">
          <div className="z-50 flex flex-1 flex-row items-stretch justify-between gap-4">
            <RewardBudgetSelect {...props} value={selectedBudget} onChange={onSelectedBudgetChange} />
            <FieldInput
              name="budget-amount-input"
              type="number"
              value={amount}
              fieldClassName="flex-1 max-w-[60px] min-w-[60px] w-[60px]"
              className="h-full flex-1"
              onChange={onChangeAmount}
              inputClassName="text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
          <FieldInfoMessage icon={({ className }) => <InformationLine className={className} />}>
            {T("currencies.network.label", { currency: T(`currencies.currency.${selectedBudget.currency}`) })}
          </FieldInfoMessage>
        </div>
      </div>
      <div className="flex w-full flex-col px-8 pb-3 pt-3">
        <RewardBudgetBar
          total={selectedBudget.initialAmount || 0}
          spending={withDefaultAmount}
          remaining={selectedBudget.remaining || 0}
        />
      </div>
      <div className="flex w-full flex-col border-b-[1px] border-greyscale-50/8 px-8 pb-6 pt-3">
        <RewardBudgetDetails
          amount={withDefaultAmount}
          budget={selectedBudget}
          initialDollarsEquivalent={props.initialDollarsEquivalent}
          remainingDollarsEquivalent={props.remainingDollarsEquivalent}
          selectedBudgetDollarEquivalent={selectedBudgetDollarEquivalent}
        />
      </div>
      <div className="flex w-full flex-col px-6 pb-6 pt-4">
        <Button width={Width.Full} disabled={!canRewards} onClick={handleSave}>
          <CheckLine />
          {T("rewardBudget.submit")}
        </Button>
      </div>
    </div>
  );
};
