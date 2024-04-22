import { isString } from "lodash";
import { useMemo } from "react";

import { components } from "src/__generated/api";
import SponsorApi from "src/api/Sponsors";

import { SponsorSidePanels } from "components/features/sponsor/sponsor-side-panels";
import { Icon } from "components/layout/icon/icon";
import { Translate } from "components/layout/translate/translate";

import { useCurrentUser } from "hooks/users/use-current-user/use-current-user";

interface Props {
  project: components["schemas"]["ProjectResponse"];
}

export function SponsorProjectButton({ project }: Props) {
  const { user } = useCurrentUser();
  const { sponsors } = user ?? {};
  const [sponsor] = sponsors ?? [];
  const { id: sponsorId } = sponsor ?? {};

  const sponsorIdIsString = isString(sponsorId);

  const { data } = SponsorApi.queries.useGetSponsorById({
    params: {
      sponsorId: sponsorIdIsString ? sponsorId : "",
    },
    options: {
      enabled: sponsorIdIsString,
    },
  });

  const hasSponsorBudget = useMemo(() => (data?.availableBudgets.length ?? 0) > 0, [data]);

  return (
    <SponsorSidePanels
      panel={hasSponsorBudget ? "project" : "fillout"}
      project={project}
      buttonProps={{
        backgroundColor: "blue",
        size: "s",
        className: "flex-1 md:flex-initial",
        children: (
          <>
            <Icon remixName="ri-service-line" />
            <Translate token="v2.pages.project.details.header.buttons.sponsor" />
          </>
        ),
      }}
    />
  );
}
