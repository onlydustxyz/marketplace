import { TDescription } from "app/hackathons/[hackathonSlug]/features/description/description.types";

import MarkdownPreview from "src/components/MarkdownPreview";

import { Paper } from "components/atoms/paper";
import { Typo } from "components/atoms/typo";

export function Description({ title, description }: TDescription.Props) {
  return (
    <Paper size={"m"} container={"2"} classNames={{ base: "grid gap-2" }}>
      <Typo variant={"brand"} size={"xl"}>
        {title}
      </Typo>
      <Typo size={"s"}>
        <MarkdownPreview>{description}</MarkdownPreview>
      </Typo>
    </Paper>
  );
}