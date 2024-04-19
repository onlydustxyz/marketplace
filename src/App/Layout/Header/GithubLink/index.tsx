import { useAuth0 } from "@auth0/auth0-react";

import { useIntl } from "src/hooks/useIntl";
import GithubLogo, { Size } from "src/icons/GithubLogo";
import { cn } from "src/utils/cn";

import { handleLoginWithRedirect } from "components/features/auth0/handlers/handle-login";

export enum Variant {
  Default = "default",
  GreyNoise = "greyNoise",
}

export default function GithubLink({
  variant = Variant.Default,
  showText = true,
}: {
  variant?: Variant;
  showText?: boolean;
}) {
  const { T } = useIntl();
  const { loginWithRedirect } = useAuth0();
  const loginHandler = () => {
    handleLoginWithRedirect(loginWithRedirect);
  };

  return (
    <button className="z-10" onClick={loginHandler} data-testid="github-signin-button">
      <div className="m-px w-fit overflow-hidden rounded-full p-px blur-0 duration-300 transition hover:m-0 hover:p-0.5">
        <div
          className={cn(
            "relative flex w-fit items-center justify-center rounded-full before:absolute before:-z-10 before:h-[calc(100dvh)] before:w-screen before:bg-multi-color-gradient hover:before:animate-spin-invert-slow",
            {
              "bg-black hover:bg-spacePurple-900": variant === Variant.Default,
              "bg-greyscale-900": variant === Variant.GreyNoise,
            }
          )}
        >
          <div
            className={cn("flex w-fit flex-row items-center gap-2 px-2 py-0.5", {
              "bg-white/4 bg-noise-medium": variant === Variant.GreyNoise,
            })}
          >
            <GithubLogo size={Size.Large} />
            {showText && <div className="mr-1 flex font-belwe">{T("navbar.signInWithGithub")}</div>}
          </div>
        </div>
      </div>
    </button>
  );
}
