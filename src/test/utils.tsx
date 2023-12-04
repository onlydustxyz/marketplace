import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { PropsWithChildren, Suspense } from "react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { AuthProvider } from "src/hooks/useAuth";
import { render, RenderOptions } from "@testing-library/react";
import { IntlProvider } from "src/hooks/useIntl";
import { TokenSetProvider } from "src/hooks/useTokenSet";
import { SessionProvider } from "src/hooks/useSession";
import { ToasterProvider } from "src/hooks/useToaster";
import { Toaster } from "src/components/Toaster";
import { viewportConfig } from "src/config";
import { SuspenseCache } from "@apollo/client";
import { ImpersonationClaimsProvider } from "src/hooks/useImpersonationClaims";
import { SidePanelStackProvider } from "src/hooks/useSidePanelStack";
import { CommandsProvider } from "src/providers/Commands";
import { SidePanelProvider } from "src/hooks/useSidePanel";
import { StackProvider } from "src/libs/react-stack";

interface MemoryRouterProviderFactoryProps {
  route?: string;
  mocks?: ReadonlyArray<MockedResponse>;
  context?: unknown;
}

const suspenseCache = new SuspenseCache();

export const MemoryRouterProviderFactory =
  ({ route = "/", mocks, context }: MemoryRouterProviderFactoryProps) =>
  // eslint-disable-next-line react/display-name
  ({ children }: PropsWithChildren) =>
    (
      <Suspense>
        <ToasterProvider>
          <SessionProvider>
            <TokenSetProvider>
              <ImpersonationClaimsProvider>
                <MockedProvider
                  mocks={mocks}
                  addTypename={false}
                  suspenseCache={suspenseCache}
                  defaultOptions={{
                    query: { fetchPolicy: "no-cache" },
                    watchQuery: { fetchPolicy: "no-cache" },
                  }}
                >
                  <MemoryRouter initialEntries={[route]}>
                    <CommandsProvider>
                      <SidePanelStackProvider>
                        <SidePanelProvider>
                          {context ? (
                            <Routes>
                              <Route path="/" element={<Outlet context={context} />}>
                                <Route
                                  index
                                  element={
                                    <AuthProvider>
                                      <StackProvider>{children}</StackProvider>
                                    </AuthProvider>
                                  }
                                />
                              </Route>
                            </Routes>
                          ) : (
                            <AuthProvider>
                              <StackProvider>{children}</StackProvider>
                            </AuthProvider>
                          )}
                        </SidePanelProvider>
                      </SidePanelStackProvider>
                    </CommandsProvider>
                  </MemoryRouter>
                </MockedProvider>
              </ImpersonationClaimsProvider>
            </TokenSetProvider>
          </SessionProvider>
          <Toaster />
        </ToasterProvider>
      </Suspense>
    );

export const renderWithIntl = (ui: React.ReactElement, options?: RenderOptions) =>
  render(<IntlProvider>{ui}</IntlProvider>, options);

export const responsiveChromatic = {
  chromatic: {
    viewports: [viewportConfig.breakpoints.sm, viewportConfig.breakpoints.lg, viewportConfig.breakpoints.xl],
  },
};
