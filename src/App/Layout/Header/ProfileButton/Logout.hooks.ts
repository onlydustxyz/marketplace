import { useAuth0 } from "@auth0/auth0-react";
import { QueryClient } from "@tanstack/react-query";

import { usePosthog } from "src/hooks/usePosthog";

import { useImpersonation } from "components/features/impersonation/use-impersonation";

const queryClient = new QueryClient();

export function useLogout() {
  const { capture, reset } = usePosthog();
  const { isImpersonating, clearImpersonateClaim } = useImpersonation();
  const { logout } = useAuth0();

  function handleLogout() {
    capture("user_logged_out");
    reset();

    if (isImpersonating) {
      clearImpersonateClaim();
      queryClient.invalidateQueries();
      window.location.reload();
    } else {
      logout({
        logoutParams: {
          returnTo: process.env.NEXT_PUBLIC_AUTH0_CALLBACK_URL || "/",
        },
      });
    }
  }

  return { handleLogout };
}
