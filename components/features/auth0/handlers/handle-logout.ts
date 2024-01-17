import { LogoutOptions } from "@auth0/auth0-react/src/auth0-context";
import { QueryClient } from "@tanstack/react-query";
import posthog from "posthog-js";

export function handleLogout(
  logout: (options?: LogoutOptions) => Promise<void>,
  isImpersonating: boolean,
  clearImpersonateClaim: () => void
) {
  const queryClient = new QueryClient();
  if (isImpersonating) {
    clearImpersonateClaim();
    queryClient.invalidateQueries();
    window.location.reload();
  } else {
    posthog.capture("user_logged_out");
    logout({
      logoutParams: {
        returnTo: process.env.NEXT_PUBLIC_AUTH0_CALLBACK_URL || "/",
      },
    });
  }
}
