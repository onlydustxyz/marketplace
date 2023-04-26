import { Combobox } from "@headlessui/react";
import { GithubUserFragment, LiveGithubUserFragment } from "src/__generated/graphql";
import classNames from "classnames";
import Contributor from "src/components/Contributor";
import ArrowDownSLine from "src/icons/ArrowDownSLine";
import User3Line from "src/icons/User3Line";
import RoundedImage, { ImageSize, Rounding } from "src/components/RoundedImage";
import onlyDustLogo from "assets/img/onlydust-logo.png";
import { useIntl } from "src/hooks/useIntl";
import Badge, { BadgeIcon, BadgeSize } from "src/components/Badge";
import Tooltip from "src/components/Tooltip";
import { ContributorFragment } from "src/types";
import { Virtuoso } from "react-virtuoso";
import { forwardRef } from "react";

const MAX_CONTRIBUTOR_SELECT_SCROLLER_HEIGHT_PX = 240;
const CONTRIBUTOR_SELECT_LINE_HEIGHT_PX = 36;

interface ContributorSelectViewProps {
  selectedGithubHandle: string | null;
  setSelectedGithubHandle: (selectedGithubHandle: string | null) => void;
  githubHandleSubstring: string;
  setGithubHandleSubstring: (githubHandleSubstring: string) => void;
  filteredContributors: (GithubUserFragment[] & { unpaidMergedPullsCount?: number }) | undefined;
  filteredExternalContributors: LiveGithubUserFragment[] | undefined;
  isSearchGithubUsersByHandleSubstringQueryLoading: boolean;
  contributor: ContributorFragment | null | undefined;
  debouncedGithubHandleSubstring: string;
}

export default function ContributorSelectView({
  selectedGithubHandle,
  setSelectedGithubHandle,
  githubHandleSubstring,
  setGithubHandleSubstring,
  filteredContributors,
  filteredExternalContributors,
  isSearchGithubUsersByHandleSubstringQueryLoading,
  contributor,
  debouncedGithubHandleSubstring,
}: ContributorSelectViewProps) {
  const { T } = useIntl();

  const showExternalUsersSection = !!(githubHandleSubstring && githubHandleSubstring.length > 2);

  let lines: Line<ContributorFragment>[] = [];

  if (filteredContributors && filteredContributors.length > 0) {
    lines = lines.concat(
      filteredContributors.map(contributor => ({
        type: "contributor",
        contributor,
      }))
    );
  }

  if (showExternalUsersSection && filteredExternalContributors && filteredExternalContributors.length) {
    lines.push({ type: "separator" });
    lines = lines.concat(
      filteredExternalContributors.map(contributor => ({
        type: "contributor",
        contributor,
      }))
    );
  }

  lines.push({ type: "lastLine" });

  return (
    <Combobox
      value={selectedGithubHandle}
      onChange={value => {
        setSelectedGithubHandle(value);
      }}
    >
      {({ open }) => (
        <div className={classNames("absolute w-full top-0", { "bg-whiteFakeOpacity-5 rounded-2xl": open })}>
          <div
            className={classNames("flex flex-col gap-3", {
              "outline outline-1 outline-whiteFakeOpacity-12 rounded-2xl backdrop-blur-4xl overflow-hidden": open,
            })}
          >
            <Combobox.Button className="px-3 pt-4" as="div">
              {!open && (
                <div
                  className={classNames(
                    "flex flex-row items-center justify-between w-full rounded-2xl px-4 h-12 border border-greyscale-50/8 cursor-pointer",
                    {
                      "text-spaceBlue-200": !selectedGithubHandle,
                      "bg-white/5": selectedGithubHandle,
                    }
                  )}
                >
                  <div className="flex flex-row items-center w-full">
                    <div className="pr-2 text-2xl">
                      {contributor ? (
                        <div className="pr-0.5">
                          <RoundedImage
                            src={contributor.avatarUrl}
                            alt={contributor.login}
                            size={ImageSize.Sm}
                            rounding={Rounding.Circle}
                          />
                        </div>
                      ) : (
                        <div className="pt-1">
                          <User3Line />
                        </div>
                      )}
                    </div>
                    {!selectedGithubHandle && <div>{T("payment.form.contributor.select.placeholder")}</div>}
                    {selectedGithubHandle && (
                      <div className="font-medium" data-testid="contributor-selection-value">
                        {selectedGithubHandle}
                      </div>
                    )}
                    {contributor?.user?.userId && <img src={onlyDustLogo} className="w-3.5 ml-1.5" />}
                  </div>
                  <ArrowDownSLine />
                </div>
              )}
              {open && (
                <div
                  className={classNames(
                    "flex flex-row items-center justify-between w-full rounded-2xl px-4 h-12 border border-greyscale-50/8",
                    {
                      "text-greyscale-50 bg-white/5": githubHandleSubstring,
                      "bg-spacePurple-900 text-spacePurple-500 ring-solid ring-2 ring-spacePurple-500":
                        githubHandleSubstring === "",
                    }
                  )}
                >
                  <div className="flex flex-row items-center w-full cursor-default gap-2.5">
                    <div className="pt-1 text-2xl">
                      <User3Line />
                    </div>
                    <Combobox.Input
                      onChange={event => setGithubHandleSubstring(event.target.value)}
                      className={classNames("border-none outline-none w-full bg-transparent font-medium text-base")}
                      onFocus={() => {
                        setGithubHandleSubstring("");
                      }}
                      value={githubHandleSubstring}
                      data-testid="contributor-selection-input"
                    />
                  </div>
                  <ArrowDownSLine />
                </div>
              )}
            </Combobox.Button>
            <Combobox.Options>
              {githubHandleSubstring && githubHandleSubstring.length < 3 ? (
                <div className="pb-6">
                  <span className="text-greyscale-100 italic pb-6 px-4">
                    {T("payment.form.contributor.select.fallback.typeMoreCharacters")}
                  </span>
                </div>
              ) : filteredContributors &&
                filteredContributors.length === 0 &&
                !isSearchGithubUsersByHandleSubstringQueryLoading &&
                debouncedGithubHandleSubstring === githubHandleSubstring ? (
                <div className="pb-6">
                  <span className="text-greyscale-100 italic pb-6 px-4">
                    {T("payment.form.contributor.select.fallback.noUser")}
                  </span>
                </div>
              ) : lines.length > 0 ? (
                <VirtualizedContributorSubList lines={lines} />
              ) : (
                <div />
              )}
            </Combobox.Options>
          </div>
        </div>
      )}
    </Combobox>
  );
}

type Line<T extends ContributorFragment> =
  | { type: "contributor"; contributor: T & { unpaidMergedPullsCount?: number } }
  | { type: "separator" }
  | { type: "lastLine" };

interface ContributorSubListProps<T extends ContributorFragment> {
  lines?: Line<T>[];
}

const List = forwardRef<HTMLDivElement>((props, ref) => {
  return <div className="divide-y divide-greyscale-50/8 pt-2.5 px-4" {...props} ref={ref} />;
});

List.displayName = "List";

const Scroller = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div
      className="scrollbar-thin scrollbar-w-1.5 scrollbar-thumb-spaceBlue-500 scrollbar-thumb-rounded overflow-y-auto overflow-x-hidden"
      {...props}
      ref={ref}
    />
  );
});

Scroller.displayName = "Scroller";

function VirtualizedContributorSubList<T extends ContributorFragment>({ lines }: ContributorSubListProps<T>) {
  const { T } = useIntl();

  return (
    <Virtuoso
      style={{
        height: Math.min(
          lines?.length ? lines.length * CONTRIBUTOR_SELECT_LINE_HEIGHT_PX : MAX_CONTRIBUTOR_SELECT_SCROLLER_HEIGHT_PX,
          MAX_CONTRIBUTOR_SELECT_SCROLLER_HEIGHT_PX
        ),
      }}
      data={lines}
      components={{ List, Scroller }}
      itemContent={(_, line) => {
        if (line.type === "contributor") {
          const contributor = line.contributor;
          return (
            <Combobox.Option key={contributor.id} value={contributor.login}>
              {({ active }) => (
                <li
                  className={classNames("p-2 flex items-center justify-between", {
                    "bg-white/4 cursor-pointer": active,
                  })}
                >
                  <Contributor
                    contributor={{
                      avatarUrl: contributor.avatarUrl,
                      login: contributor.login,
                      isRegistered: !!contributor.user?.userId,
                    }}
                  />
                  {contributor.unpaidMergedPullsCount && (
                    <>
                      <Badge
                        id={`pr-count-badge-${contributor.id}`}
                        value={contributor.unpaidMergedPullsCount}
                        icon={BadgeIcon.GitMerge}
                        size={BadgeSize.Small}
                      />
                      <Tooltip anchorId={`pr-count-badge-${contributor.id}`}>
                        {T("payment.form.contributor.unpaidMergedPrCountTooltip")}
                      </Tooltip>
                    </>
                  )}
                </li>
              )}
            </Combobox.Option>
          );
        } else if (line.type === "separator") {
          return (
            <div className="font-medium text-md pb-1 pt-4 text-spaceBlue-200">
              {T("payment.form.contributor.select.externalUsers")}
            </div>
          );
        } else {
          return <div className="pb-6" />;
        }
      }}
    />
  );
}
