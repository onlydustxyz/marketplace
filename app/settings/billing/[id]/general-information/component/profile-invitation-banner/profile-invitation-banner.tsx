import { useRouter } from "next/navigation";

import MeApi from "src/api/me";
import { useMutationAlert } from "src/api/useMutationAlert";
import { Spinner } from "src/components/Spinner/Spinner";
import { useIntl } from "src/hooks/useIntl";

import { Banner } from "components/ds/banner/banner";
import { Button } from "components/ds/button/button";
import { Flex } from "components/layout/flex/flex";
import { Icon } from "components/layout/icon/icon";
import { Translate } from "components/layout/translate/translate";

import { NEXT_ROUTER } from "constants/router";

import { TProfileInvitationBanner } from "./profile-invitation-banner.types";

export function ProfileInvitationBanner({ profile }: TProfileInvitationBanner.Props) {
  const { T } = useIntl();
  const router = useRouter();

  const {
    mutate: acceptInvitation,
    isPending: loadingAcceptInvitation,
    ...restAcceptInvitation
  } = MeApi.mutations.useAcceptOrDeclineInvitation({
    params: {
      billingProfileId: profile?.id || "",
    },
  });

  const { mutate: declineInvitation, isPending: loadingDeclineInvitation } =
    MeApi.mutations.useAcceptOrDeclineInvitation({
      params: {
        billingProfileId: profile?.id || "",
      },
      options: {
        onSuccess: () => {
          router.push(NEXT_ROUTER.settings.profile);
        },
      },
    });

  useMutationAlert({
    mutation: restAcceptInvitation,
    success: {
      message: T("v2.pages.settings.billing.information.invitation.alert.success", {
        name: profile?.name || "",
      }),
    },
    error: {
      message: T("v2.pages.settings.billing.information.invitation.alert.error", {
        name: profile?.name || "",
      }),
    },
  });

  function handleAccept() {
    acceptInvitation({
      accepted: true,
    });
  }

  function handleDecline() {
    declineInvitation({
      accepted: false,
    });
  }

  return (
    <Banner
      variant="rainbow"
      title={
        <Translate
          token="v2.pages.settings.billing.information.invitation.title"
          params={{
            name: profile?.name || "",
          }}
        />
      }
      description={<Translate token="v2.pages.settings.billing.information.invitation.description" />}
      icon={{ remixName: "ri-error-warning-line" }}
      endElement={
        <Flex alignItems="center" className="gap-3">
          <Button size="s" onClick={handleAccept} disabled={loadingAcceptInvitation || loadingDeclineInvitation}>
            {loadingAcceptInvitation ? <Spinner className="h-4 w-4" /> : <Icon remixName="ri-check-line" />}

            <Translate token="v2.pages.settings.billing.information.invitation.buttons.accept" />
          </Button>

          <Button
            variant="secondary"
            size="s"
            onClick={handleDecline}
            disabled={loadingAcceptInvitation || loadingDeclineInvitation}
          >
            {loadingDeclineInvitation ? <Spinner className="h-4 w-4" /> : <Icon remixName="ri-close-line" />}

            <Translate token="v2.pages.settings.billing.information.invitation.buttons.decline" />
          </Button>
        </Flex>
      }
    />
  );
}
