import { Accordion, AccordionItem, Selection } from "@nextui-org/react";
import { useMemo, useState } from "react";

import { TOverviewAccordion } from "app/p/[slug]/features/good-first-issues/components/issue-card/components/overview-accordion/overview-accordion.types";

import MarkdownPreview from "src/components/MarkdownPreview";
import { cn } from "src/utils/cn";

import { Icon } from "components/layout/icon/icon";
import { Typography } from "components/layout/typography/typography";

export function OverviewAccordion({ body }: TOverviewAccordion.Props) {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set("1"));
  const renderContent = useMemo(() => {
    if (body) {
      return <MarkdownPreview>{body}</MarkdownPreview>;
    }
    return (
      <Typography
        variant="body-m"
        translate={{ token: "v2.pages.project.overview.goodFirstIssues.overview.empty" }}
        className="uppercase text-spaceBlue-200"
      />
    );
  }, [body]);
  return (
    <Accordion
      className="!p-0"
      selectedKeys={selectedKeys}
      onSelectionChange={setSelectedKeys}
      defaultSelectedKeys={["1"]}
    >
      <AccordionItem
        key="1"
        className="!rounded-2xl !border-1 !border-card-border-light !bg-card-background-medium !px-0 !shadow-none"
        classNames={{
          content: "!px-4 !py-4",
          trigger: "!px-4 justify-start items-center",
          startContent: "!flex-shrink gap-2",
          indicator: "text-snow",
        }}
        indicator={({ isOpen }) => (
          <Icon
            remixName="ri-arrow-down-s-line"
            className={cn("text-spaceBlue-200 transition-transform", { "rotate-180": isOpen })}
            size={24}
          />
        )}
        startContent={
          <div className="flex items-center gap-2">
            <Icon remixName="ri-bill-line" size={16} className="text-spaceBlue-100" />
            <Typography
              variant="body-m"
              translate={{ token: "v2.pages.project.overview.goodFirstIssues.overview.title" }}
              className="uppercase text-spaceBlue-100"
            />
          </div>
        }
        disableIndicatorAnimation
      >
        {renderContent}
      </AccordionItem>
    </Accordion>
  );
}
