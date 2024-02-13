"use client";

import { Tabs as NextTabs } from "@nextui-org/react";
import { Tab as NextTab } from "@nextui-org/tabs";
import { Key, useMemo, useState } from "react";
import { useMediaQuery } from "usehooks-ts";

import { viewportConfig } from "src/config";
import { cn } from "src/utils/cn";

import { BottomSheet } from "components/ds/modals/bottom-sheet/bottom-sheet";
import { tabsVariants } from "components/ds/tabs/tabs.variants";

import { Tab } from "./tab/tab";
import { TTabs } from "./tabs.types";

export function Tabs<T extends Key>({ tabs, color, border, mobile, controlled }: TTabs.Props<T>) {
  const [selected, setSelected] = useState<Key>(tabs[0]?.key);
  const slots = tabsVariants({ border });
  const isXl = useMediaQuery(`(min-width: ${viewportConfig.breakpoints.xl}px)`);
  const [openMobilePanel, setOpenMobilePanel] = useState(false);

  function onSelectTab(tab: Key) {
    if (controlled) {
      controlled.onSelect(tab as T);
    } else {
      setSelected(tab);
    }
  }

  const getSelectedChildren = useMemo(() => {
    if (controlled?.selected) {
      return tabs.find(tab => tab.key === controlled.selected)?.children?.(controlled.selected);
    }
    if (selected) {
      return tabs.find(tab => tab.key === selected)?.children?.(selected as T);
    }

    return tabs[0]?.children?.(selected as T);
  }, [controlled, selected, tabs]);

  if (!isXl && mobile) {
    return (
      <>
        <div className="cursor-pointer" onClick={() => setOpenMobilePanel(true)}>
          {mobile.trigger}
        </div>
        <BottomSheet
          background={color}
          onClose={() => setOpenMobilePanel(false)}
          open={openMobilePanel}
          title={mobile.title}
          hasCloseButton={false}
        >
          {tabs.map((tab, i) => (
            <button
              key={i}
              type="button"
              className={cn("flex items-center gap-3 p-4", {
                "is-active rounded-xl bg-white/8": selected === tab.key,
              })}
              onClick={() => {
                onSelectTab(tab.key);
                setOpenMobilePanel(false);
              }}
            >
              <Tab color={color} {...tab} />
            </button>
          ))}
        </BottomSheet>
      </>
    );
  }

  return (
    <>
      <NextTabs
        aria-label="Options"
        variant="underlined"
        selectedKey={controlled?.selected || selected}
        onSelectionChange={onSelectTab}
        classNames={{
          base: "w-full",
          tabList: cn("gap-8 w-full relative rounded-none p-0 px-4", slots.tabList()),
          cursor: "w-full bg-underline h-1",
          tab: "relative max-w-fit px-0 h-auto pt-[2px] pb-2.5 data-[hover=true]:opacity-100",
          tabContent: "",
        }}
      >
        {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
        {tabs.map(({ children, ...t }) => (
          <NextTab {...t} key={t.key} title={<Tab color={color} {...t} />} />
        ))}
      </NextTabs>
      <div className="h-3 w-full" />
      {getSelectedChildren}
    </>
  );
}
