"use client";

import { Auth0ClientAdapter } from "core/application/auth0-client-adapter";
import { bootstrap } from "core/bootstrap";

import { Cta } from "../../components/cta/cta";

export function SignupCtas() {
  function handleSignin(userType: "contributor" | "maintainer" | "sponsor") {
    const { loginWithRedirect } = bootstrap.getAuthProvider() ?? {};

    if (loginWithRedirect)
      Auth0ClientAdapter.helpers.handleLoginWithRedirect(loginWithRedirect, { queryParam: { userType } });
  }

  return (
    <div className="flex flex-col gap-3">
      <Cta
        title={"v2.pages.signup.signupSection.contributor.title"}
        subtitle={"v2.pages.signup.signupSection.contributor.subtitle"}
        iconProps={{
          remixName: "ri-github-line",
          className: "bg-brand-2",
        }}
        wrapperProps={{
          as: "button",
          htmlProps: {
            type: "button",
            onClick: () => handleSignin("contributor"),
          },
        }}
      />
      <Cta
        title={"v2.pages.signup.signupSection.maintainer.title"}
        subtitle={"v2.pages.signup.signupSection.maintainer.subtitle"}
        iconProps={{
          remixName: "ri-github-line",
          className: "bg-brand-2",
        }}
        wrapperProps={{
          as: "button",
          htmlProps: {
            type: "button",
            onClick: () => handleSignin("maintainer"),
          },
        }}
      />
      <Cta
        title={"v2.pages.signup.signupSection.sponsor.title"}
        subtitle={"v2.pages.signup.signupSection.sponsor.subtitle"}
        iconProps={{
          remixName: "ri-github-line",
          className: "bg-brand-2",
        }}
        wrapperProps={{
          // TODO @mehdi activate once ready
          // as: "button",
          // htmlProps: {
          //   type: "button",
          //   onClick: () => handleSignin("sponsor"),
          // },
          classNames: { base: "opacity-50" },
        }}
      />
    </div>
  );
}