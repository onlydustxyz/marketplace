import Button, { ButtonSize, ButtonType } from "src/components/Button";
import { useLazyGetUserPermissions } from "src/hooks/useGithubUserPermissions/useGithubUserPermissions";

import { useIntl } from "src/hooks/useIntl";
import MagicLine from "src/icons/MagicLine";
import { useAuth0 } from "@auth0/auth0-react";
import { handleLoginWithRedirect } from "components/features/auth0/handlers/handle-login";

type ClaimButton = { callback: () => void };

export function ClaimButton({ callback }: ClaimButton) {
  const { T } = useIntl();
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const [getPermission] = useLazyGetUserPermissions();

  const startprojectClaim = async () => {
    if (isAuthenticated) {
      callback();
    } else {
      await handleLoginWithRedirect(loginWithRedirect);
    }
  };

  return (
    <Button type={ButtonType.Primary} size={ButtonSize.Sm} onClick={startprojectClaim}>
      <MagicLine className="text-xl font-normal text-black" />
      {T("project.claim.banner.button")}
    </Button>
  );
}
