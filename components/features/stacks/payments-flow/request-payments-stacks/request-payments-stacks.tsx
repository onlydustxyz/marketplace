import { useMemo, useState } from "react";

import { useStackRequestPayments } from "src/App/Stacks/Stacks";
import MeApi from "src/api/me";
import BillingApi from "src/api/me/billing";

import { GenerateInvoice } from "components/features/stacks/payments-flow/request-payments-stacks/features/views/generate-invoice/generate-invoice";
import { Mandate } from "components/features/stacks/payments-flow/request-payments-stacks/features/views/mandate/mandate";
import { SelectBillingProfile } from "components/features/stacks/payments-flow/request-payments-stacks/features/views/select-billing-profile/select-billing-profile";
import { SelectRewards } from "components/features/stacks/payments-flow/request-payments-stacks/features/views/select-rewards/select-rewards";
import { UploadInvoice } from "components/features/stacks/payments-flow/request-payments-stacks/features/views/upload-invoice/upload-invoice";
import { TRequestPaymentsStacks } from "components/features/stacks/payments-flow/request-payments-stacks/request-payments-stacks.types";

export function RequestPaymentsStacks() {
  const [view, setView] = useState<TRequestPaymentsStacks.Views>(TRequestPaymentsStacks.Views.SelectBillingProfile);
  const [excludedRewardsIds, setExcludedRewardsIds] = useState<string[]>([]);
  const [selectedBillingProfileId, setSelectedBillingProfileId] = useState("");
  const [, closeRequestPanel] = useStackRequestPayments();
  const { data } = MeApi.queries.useGetMePendingInvoices({});

  const { data: billingProfilesData, isLoading: isLoadingBillingProfiles } = BillingApi.queries.useAllBillingProfiles(
    {}
  );

  const excludeNonLiquidToken = useMemo(
    () =>
      (data?.rewards || []).filter(
        reward => !!reward.amount.dollarsEquivalent || reward.amount.dollarsEquivalent === 0
      ),
    [data]
  );

  const excludedRewards = useMemo(
    () => excludeNonLiquidToken.filter(reward => excludedRewardsIds.includes(reward.id)),
    [data, excludedRewardsIds]
  );

  const includedRewards = useMemo(
    () => excludeNonLiquidToken.filter(reward => !excludedRewardsIds.includes(reward.id)),
    [excludeNonLiquidToken, excludedRewardsIds]
  );

  const selectedBillingProfile = useMemo(
    () => billingProfilesData?.billingProfiles?.find(profile => profile.id === selectedBillingProfileId),
    [billingProfilesData, selectedBillingProfileId]
  );

  function onExclude(id: string) {
    setExcludedRewardsIds(prev => [...prev, id]);
  }

  function onInclude(id: string) {
    setExcludedRewardsIds(prev => prev.filter(i => i !== id));
  }

  function onSelectBillingProfile(id: string) {
    setSelectedBillingProfileId(id);
  }
  function onNextView({ to }: TRequestPaymentsStacks.onNextViewProps) {
    if (to === "close") {
      closeRequestPanel();
    } else {
      setView(to);
    }
  }

  if (view === TRequestPaymentsStacks.Views.SelectRewards) {
    return (
      <SelectRewards
        goTo={onNextView}
        onExclude={onExclude}
        onInclude={onInclude}
        includedRewards={includedRewards}
        excludedRewards={excludedRewards}
        selectedBillingProfile={selectedBillingProfile}
        isMandateAccepted={selectedBillingProfile?.invoiceMandateAccepted ?? false}
      />
    );
  }

  if (view === TRequestPaymentsStacks.Views.Mandate) {
    return <Mandate goTo={onNextView} billingProfileId={selectedBillingProfileId} />;
  }

  if (view === TRequestPaymentsStacks.Views.Upload) {
    return (
      <UploadInvoice
        goTo={onNextView}
        rewardIds={includedRewards.map(({ id }) => id)}
        billingProfileId={selectedBillingProfileId}
        billingProfileType={billingProfilesData?.billingProfiles?.[0].type}
      />
    );
  }

  if (view === TRequestPaymentsStacks.Views.Generate) {
    return (
      <GenerateInvoice
        goTo={onNextView}
        rewardIds={includedRewards.map(({ id }) => id)}
        billingProfileId={selectedBillingProfileId}
        billingProfileType={billingProfilesData?.billingProfiles?.[0].type}
      />
    );
  }

  return (
    <SelectBillingProfile
      goTo={onNextView}
      billingProfiles={billingProfilesData?.billingProfiles ?? []}
      isLoading={isLoadingBillingProfiles}
      onSelectBillingProfile={onSelectBillingProfile}
      selectedBillingProfileId={selectedBillingProfileId}
    />
  );
}
