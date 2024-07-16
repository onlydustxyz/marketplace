"use client";

import { TInfoDropdown } from "app/hackathons/[hackathonSlug]/components/info-dropdown/info-dropdown.types";

import { Button } from "components/atoms/button/variants/button-default";
import { Link } from "components/atoms/link";
import { Popover } from "components/atoms/popover";
import { Tag } from "components/atoms/tag";
import { Typo } from "components/atoms/typo";
import { Translate } from "components/layout/translate/translate";

export function InfoDropdown({ targetLabel, dropdownTitleToken, links }: TInfoDropdown.Props) {
  return (
    <Popover closeOnBlur={false}>
      <Popover.Trigger>
        {() => (
          <div>
            <Tag
              as={"button"}
              style={"outline"}
              color={"white"}
              size={"s"}
              icon={{ remixName: "ri-arrow-down-s-line" }}
            >
              {targetLabel}
            </Tag>
          </div>
        )}
      </Popover.Trigger>
      <Popover.Content>
        {({ setIsOpen }) => (
          <div className={"grid gap-3"}>
            <div className={"flex items-center justify-between gap-3"}>
              <Typo size={"m"} translate={{ token: dropdownTitleToken }} />

              <Button variant={"secondary-light"} size={"s"} onClick={() => setIsOpen(false)}>
                <Translate token={"v2.pages.hackathons.details.info.close"} />
              </Button>
            </div>

            {links.map(l => (
              <Link key={l.url} href={l.url}>
                {l.value ?? l.url}
              </Link>
            ))}
          </div>
        )}
      </Popover.Content>
    </Popover>
  );
}