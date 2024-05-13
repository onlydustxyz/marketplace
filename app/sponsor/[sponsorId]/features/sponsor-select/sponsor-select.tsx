import { Selection } from "@nextui-org/react";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

import { Select } from "components/ds/form/select/select";

import { NEXT_ROUTER } from "constants/router";

import { useIntl } from "hooks/translate/use-translate";
import { useCurrentUser } from "hooks/users/use-current-user/use-current-user";

export function SponsorSelect() {
  const { T } = useIntl();
  const router = useRouter();
  const { sponsorId = "" } = useParams<{ sponsorId: string }>();

  const { user } = useCurrentUser();

  const sponsors = useMemo(
    () =>
      user?.sponsors?.map(s => ({
        label: s.name,
        value: s.id,
      })) ?? [],
    [user]
  );

  function handleSponsorChange(keys: Selection) {
    const [sponsorId] = keys;

    if (typeof sponsorId === "string") {
      router.push(NEXT_ROUTER.sponsor.details.root(sponsorId));
    }
  }

  return (
    <Select
      aria-label={T("v2.pages.sponsor.selectSponsor")}
      defaultSelectedKeys={[sponsorId]}
      items={sponsors}
      onSelectionChange={handleSponsorChange}
      classNames={{
        base: "w-full sm:w-[200px]",
      }}
      size={"sm"}
    />
  );
}
