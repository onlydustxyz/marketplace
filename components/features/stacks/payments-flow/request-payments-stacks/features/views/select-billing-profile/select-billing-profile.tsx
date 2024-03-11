import { useMemo } from "react";

import { IMAGES } from "src/assets/img";
import { Spinner } from "src/components/Spinner/Spinner";

import { Button } from "components/ds/button/button";
import { RadioGroupCustom } from "components/ds/form/radio-group-custom/radio-group-custom";
import { SelectableBillingProfile } from "components/features/stacks/payments-flow/request-payments-stacks/components/billing-profile/selectable-billing-profile/selectable-billing-profile";
import { SelectableBillingProfileLoading } from "components/features/stacks/payments-flow/request-payments-stacks/components/billing-profile/selectable-billing-profile/selectable-billing-profile.loading";
import { UseBillingProfileIcons } from "components/features/stacks/payments-flow/request-payments-stacks/hooks/use-billing-profile-icons/use-billing-profile-icons";
import { TRequestPaymentsStacks } from "components/features/stacks/payments-flow/request-payments-stacks/request-payments-stacks.types";
import { Flex } from "components/layout/flex/flex";
import { ScrollView } from "components/layout/pages/scroll-view/scroll-view";
import { EmptyState } from "components/layout/placeholders/empty-state/empty-state";
import { Translate } from "components/layout/translate/translate";
import { Typography } from "components/layout/typography/typography";

import { TSelectBillingProfile } from "./select-billing-profile.types";

export function SelectBillingProfile({
  billingProfiles,
  isLoading,
  onSelectBillingProfile,
  selectedBillingProfileId,
  goTo,
}: TSelectBillingProfile.Props) {
  function handleNext() {
    goTo({ to: TRequestPaymentsStacks.Views.SelectRewards });
  }

  const { billingProfilesIcons } = UseBillingProfileIcons();

  const renderBillingProfiles = useMemo(() => {
    if (isLoading) {
      return (
        <Flex justifyContent="start" direction={"col"} className="gap-4">
          <SelectableBillingProfileLoading />
          <SelectableBillingProfileLoading />
        </Flex>
      );
    }
    if (!billingProfiles?.length) {
      return (
        <div className="flex w-full flex-col py-6">
          <EmptyState
            illustrationSrc={IMAGES.global.categories}
            title={{ token: "v2.pages.stacks.request_payments.selectBillingProfile.emptyState.title" }}
            description={{ token: "v2.pages.stacks.request_payments.selectBillingProfile.emptyState.description" }}
          />
        </div>
      );
    }
    return (
      <>
        <Typography
          variant={"special-label"}
          translate={{ token: "v2.pages.stacks.request_payments.selectBillingProfile.title" }}
          className="mb-4 text-spaceBlue-200"
        />
        <Flex justifyContent="start" direction={"col"} className="gap-4">
          <RadioGroupCustom onChange={onSelectBillingProfile} value={selectedBillingProfileId}>
            {({ onChange }) =>
              billingProfiles?.map(profile => (
                <SelectableBillingProfile
                  key={profile.id}
                  title={profile.name}
                  count={profile.rewardCount ?? 0}
                  icon={{ remixName: billingProfilesIcons[profile.type] }}
                  disabled={profile.rewardCount === 0}
                  onChange={onChange}
                  selected={profile.id === selectedBillingProfileId}
                  value={profile.id}
                />
              ))
            }
          </RadioGroupCustom>
        </Flex>
      </>
    );
  }, [isLoading, billingProfiles, selectedBillingProfileId, onSelectBillingProfile]);

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex h-full flex-col overflow-hidden px-1">
        <ScrollView>
          <div className="px-3 pb-[250px]">
            <div className="mb-8">
              <Typography
                variant={"title-m"}
                translate={{ token: "v2.pages.stacks.request_payments.title" }}
                className="text-greyscale-50"
              />
            </div>

            {renderBillingProfiles}
          </div>
          <div className="absolute bottom-0 left-0 w-full bg-greyscale-900">
            <div className="flex h-auto w-full items-center justify-between gap-5 border-t border-card-border-light bg-card-background-light px-8 py-6">
              {isLoading ? <Spinner /> : <div />}
              <div className="flex items-center justify-end gap-5">
                <Button
                  variant="primary"
                  size="m"
                  className="w-full"
                  onClick={handleNext}
                  disabled={!selectedBillingProfileId}
                >
                  <Translate token="v2.pages.stacks.request_payments.selectBillingProfile.next" />
                </Button>
              </div>
            </div>
          </div>
        </ScrollView>
      </div>
    </div>
  );
}
