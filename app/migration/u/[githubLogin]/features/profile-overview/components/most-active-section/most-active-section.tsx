import { Flex } from "components/layout/flex/flex";
import { Icon } from "components/layout/icon/icon";
import { Typography } from "components/layout/typography/typography";

import { MostActiveCard } from "./most-active-card/most-active-card";
import { TMostActiveSection } from "./most-active-section.types";

export function MostActiveSection({ icon, title, list }: TMostActiveSection.Props) {
  return (
    <Flex direction="col" className="gap-3" width="full">
      <Flex alignItems="center" className="gap-2">
        <Icon {...icon} size={20} />
        <Typography {...title} variant="body-m-bold" />
      </Flex>

      <Flex alignItems="center" wrap="wrap" className="gap-3">
        {list.map(data => (
          <MostActiveCard key={data.name} {...data} />
        ))}
      </Flex>
    </Flex>
  );
}
