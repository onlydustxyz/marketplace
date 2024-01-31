import { Ownership, useProjectFilter } from "src/_pages/Projects/useProjectFilter";
import FilterIcon from "src/assets/icons/FilterIcon";
import { useIntl } from "src/hooks/useIntl";
import { cn } from "src/utils/cn";

type Props = {
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
};

export function FilterButton({ panelOpen, setPanelOpen }: Props) {
  const { T } = useIntl();

  const { projectFilter } = useProjectFilter();
  const filterCount =
    projectFilter.sponsors.length +
    projectFilter.technologies.length +
    (projectFilter.ownership === Ownership.Mine ? 1 : 0);

  return (
    <button
      className={cn("flex items-center gap-2 rounded-xl border px-4 py-2 font-walsheim text-sm font-semibold", {
        "border-fuchsia-500 bg-slate-900 text-fuchsia-300": panelOpen,
      })}
      onClick={() => setPanelOpen(true)}
    >
      <FilterIcon />{" "}
      {T("filter.mobileButton", {
        count: filterCount,
      })}
    </button>
  );
}
