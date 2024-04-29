"use client";

import { isInMaintenanceMode } from "utils/maintenance/maintenance";

import { useOnboarding } from "src/App/OnboardingProvider";
import MeApi from "src/api/me";
import { calculateUserCompletionScore } from "src/utils/calculateCompletionScore";

import { useImpersonation } from "components/features/impersonation/use-impersonation";
import { withClientOnly } from "components/layout/client-only/client-only";

import { NEXT_ROUTER } from "constants/router";

import { useMatchPath } from "hooks/router/useMatchPath";
import { useIntl } from "hooks/translate/use-translate";
import { useCurrentUser } from "hooks/users/use-current-user/use-current-user";

import View from "./View";

function Header() {
  const { githubUserId } = useCurrentUser();
  const { T } = useIntl();

  const { isImpersonating } = useImpersonation();

  const { onboardingInProgress } = useOnboarding();

  const { data: myProfileInfo } = MeApi.queries.useGetMyProfileInfo({});

  const rewardsMenuItem = githubUserId && !onboardingInProgress ? T("v2.features.menu.rewards") : undefined;
  const hackathonsMenuItem = T("v2.features.menu.hackathons");
  const contributionsMenuItem = githubUserId && !onboardingInProgress ? T("v2.features.menu.contributions") : undefined;
  const projectsMenuItem = T("v2.features.menu.projects");

  const isMatchUserProfile = useMatchPath(NEXT_ROUTER.publicProfile.root(""), { exact: false });
  const isMatchMaintenance = useMatchPath(NEXT_ROUTER.maintenance, { exact: false });

  const { inMaintenance } = isInMaintenanceMode();

  if (isMatchUserProfile || isMatchMaintenance || inMaintenance) {
    return null;
  }

  return (
    <View
      menuItems={{
        [NEXT_ROUTER.projects.all]: projectsMenuItem,
        [NEXT_ROUTER.contributions.all]: contributionsMenuItem,
        [NEXT_ROUTER.rewards.all]: rewardsMenuItem,
        [NEXT_ROUTER.hackathons.root]: hackathonsMenuItem,
      }}
      impersonating={isImpersonating}
      profileCompletionScore={myProfileInfo ? calculateUserCompletionScore(myProfileInfo) : undefined}
    />
  );
}

export default withClientOnly(Header);
