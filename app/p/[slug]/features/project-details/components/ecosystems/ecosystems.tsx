import { useMemo } from "react";

import { Avatar } from "components/ds/avatar/avatar";
import { Link } from "components/ds/link/link";
import { Flex } from "components/layout/flex/flex";
import { Typography } from "components/layout/typography/typography";

import { Section } from "../section/section";
import { TEcosystems } from "./ecosystems.types";

export function Ecosystems({ ecosystems }: TEcosystems.Props) {
  const sortedByName = useMemo(() => {
    return [...ecosystems].sort((a, b) => a.name.localeCompare(b.name));
  }, [ecosystems]);

  if (sortedByName.length === 0) {
    return null;
  }

  return (
    <Section
      title={{
        token: "project.details.overview.ecosystems",
        params: {
          count: sortedByName.length,
        },
      }}
      remixIconName="ri-global-line"
    >
      <Flex wrap="wrap" className="gap-1">
        {sortedByName.map(ecosystem => (
          <Link key={ecosystem.id} href={ecosystem.url} className="gap-2">
            <Avatar src={ecosystem.logoUrl} alt={ecosystem.name} size="s" />

            <Typography variant="body-s" className="truncate">
              {ecosystem.name}
            </Typography>
          </Link>
        ))}
      </Flex>
    </Section>
  );
}
