import { useAuth0 } from "@auth0/auth0-react";
import { QueryClient } from "@tanstack/react-query";
import { useImpersonation } from "components/features/impersonation/use-impersonation";
import { ReactNode } from "react";
import { usePosthog } from "src/hooks/usePosthog";

const queryClient = new QueryClient();

interface Props {
  customButton: ReactNode;
}

export function LogoutButton({ customButton }: Props) {
  const { capture, reset } = usePosthog();
  const { isImpersonating, clearImpersonateClaim } = useImpersonation();
  const { logout } = useAuth0();

  function handleClick() {
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

  return (
    <>
      {customButton ? (
        <div onClick={handleClick} data-testid="logout-button">
          {customButton}
        </div>
      ) : null}
    </>
  );
}
