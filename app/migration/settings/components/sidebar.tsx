"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { useBillingProfiles } from "app/migration/settings/hooks/useBillingProfile";
import { useBillingStatus } from "app/migration/settings/hooks/useBillingStatus";

import GithubLink, { Variant as GithubLinkVariant } from "src/App/Layout/Header/GithubLink";
import { cn } from "src/utils/cn";

import { Flex } from "components/layout/flex/flex";
import { Icon } from "components/layout/icon/icon";
import { MenuItem } from "components/layout/sidebar/menu-item/menu-item";
import { TMenuItem } from "components/layout/sidebar/menu-item/menu-item.types";
import { Sidebar as LayoutSidebar } from "components/layout/sidebar/sidebar";
import { Translate } from "components/layout/translate/translate";
import { Typography } from "components/layout/typography/typography";

export function Sidebar() {
  const { isAuthenticated, user } = useAuth0();
  const pathname = usePathname();
  const { validBillingProfile, billingProfile } = useBillingProfiles();
  const { isWarning, isError } = useBillingStatus(validBillingProfile, billingProfile?.status);

  const menuItems: TMenuItem.Props[] = useMemo(
    () => [
      {
        label: <Translate token="v2.features.sidebar.settings.publicProfile" />,
        href: "/migration/settings/profile",
        isActive: false,
      },
      {
        label: <Translate token="v2.features.sidebar.settings.payoutPreferences" />,
        href: "/migration/settings/payout",
        isActive: false,
      },
      {
        label: <Translate token="v2.features.sidebar.settings.billingProfile" />,
        href: "/migration/settings/billing",
        isActive: false,
        endIcon:
          isWarning || isError ? (
            <Icon
              size={16}
              remixName="ri-information-line"
              className={cn({
                "text-orange-500": isWarning,
                "text-github": isError,
              })}
            />
          ) : undefined,
      },
      {
        label: <Translate token="v2.features.sidebar.settings.verifyAccount" />,
        href: "/migration/settings/verify",
        isActive: false,
      },
    ],
    [isWarning, isError]
  );

  return (
    <LayoutSidebar
      // TODO: mobile header
      mobileHeader={<div>Mobile header</div>}
    >
      {({ closePanel }) => (
        <div className="flex w-full flex-col gap-4 xl:gap-6">
          <Flex
            alignItems="center"
            className="gap-4 rounded-xl border-1 border-greyscale-50/8 bg-greyscale-900 p-3 shadow-light"
          >
            <img
              src={user?.picture}
              alt={user?.nickname}
              className="h-8 w-8 rounded-xl border-2 border-greyscale-50/12"
            />

            <Typography variant="body-l-bold" className="truncate">
              {user?.nickname}
            </Typography>
          </Flex>

          <div className="align-start flex flex-col gap-4 text-xl font-medium">
            {menuItems.map(menu => (
              <MenuItem {...menu} key={menu.href} onClick={closePanel} isActive={pathname === menu.href} />
            ))}

            {!isAuthenticated ? (
              <div className="border-t border-card-border-medium pt-4 text-base xl:hidden">
                <GithubLink variant={GithubLinkVariant.GreyNoise} />
              </div>
            ) : null}
          </div>
        </div>
      )}
    </LayoutSidebar>
  );
}
