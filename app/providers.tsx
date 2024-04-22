"use client";

import { NextUIProvider } from "@nextui-org/react";
import { NavigationStateProvider } from "providers/navigation-state/navigation-state";
import { PropsWithChildren } from "react";
import { useMediaQuery } from "usehooks-ts";

import OnboardingProvider from "src/App/OnboardingProvider";
import { Stacks } from "src/App/Stacks/Stacks";
import { Toaster } from "src/components/Toaster";
import Tooltip from "src/components/Tooltip";
import { viewportConfig } from "src/config";
import { IntlProvider } from "src/hooks/useIntl";
import { SidePanelProvider } from "src/hooks/useSidePanel";
import { SidePanelStackProvider } from "src/hooks/useSidePanelStack";
import { ToasterProvider } from "src/hooks/useToaster";
import { StackProvider } from "src/libs/react-stack";

import { QueryProvider } from "components/features/api/providers/query-provider";
import { Auth0ProviderWithNavigate } from "components/features/auth0/providers/auth0-provider-with-navigate";
import { ImpersonationProvider } from "components/features/impersonation/impersonation.provider";
import { PosthogProvider } from "components/features/posthog/providers/posthog.provider";

export default function Providers({ children }: PropsWithChildren) {
  const isSm = useMediaQuery(`(min-width: ${viewportConfig.breakpoints.sm}px)`);

  return (
    <PosthogProvider>
      <ImpersonationProvider>
        <Auth0ProviderWithNavigate>
          <IntlProvider>
            <QueryProvider>
              <NextUIProvider>
                <OnboardingProvider>
                  <NavigationStateProvider>
                    <StackProvider>
                      <SidePanelStackProvider>
                        <SidePanelProvider>
                          <ToasterProvider>
                            {children}
                            <Stacks />
                            <Toaster />
                            {/* Hide tooltips on mobile */ isSm && <Tooltip />}
                          </ToasterProvider>
                        </SidePanelProvider>
                      </SidePanelStackProvider>
                    </StackProvider>
                  </NavigationStateProvider>
                </OnboardingProvider>
              </NextUIProvider>
            </QueryProvider>
          </IntlProvider>
        </Auth0ProviderWithNavigate>
      </ImpersonationProvider>
    </PosthogProvider>
  );
}
