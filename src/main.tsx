import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import TagManager from "react-gtm-module";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "src/hooks/useAuth";
import ApolloWrapper from "src/providers/ApolloWrapper";
import App from "./App";
import OnboardingProvider from "./App/OnboardingProvider";
import "./datadog";
import "remixicon/fonts/remixicon.css";
import "src/assets/css/index.css";
import "src/assets/fonts/Alfreda/stylesheet.css";
import "src/assets/fonts/Belwe/stylesheet.css";
import "src/assets/fonts/GTWalsheimPro/stylesheet.css";
import { ContributionDetailPanelProvider } from "src/hooks/useContributionDetailPanel";
import { ImpersonationClaimsProvider } from "src/hooks/useImpersonationClaims";
import { IntlProvider } from "src/hooks/useIntl";
import { TokenSetProvider } from "src/hooks/useTokenSet";
import ErrorFallback from "./ErrorFallback";
import Maintenance from "./Maintenance";
import SEO from "./components/SEO";
import config from "./config";
import { ContributorProfilePanelProvider } from "./hooks/useContributorProfilePanel";
import { RewardDetailPanelProvider } from "./hooks/useRewardDetailPanel";
import { SessionProvider } from "./hooks/useSession";
import { SidePanelProvider } from "./hooks/useSidePanel";
import { SidePanelStackProvider } from "./hooks/useSidePanelStack";
import { ToasterProvider } from "./hooks/useToaster";
import { CommandsProvider } from "./providers/Commands";
import { Stacks } from "./App/Stacks";
import { StackProvider } from "./libs/react-stack";

if (config.GTM_ID) {
  TagManager.initialize({
    gtmId: config.GTM_ID,
  });
}

// Create a client
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <IntlProvider>
    <BrowserRouter>
      <SEO />
      <ErrorBoundary FallbackComponent={ErrorFallback} onError={console.error}>
        <SessionProvider>
          <ImpersonationClaimsProvider>
            <TokenSetProvider>
              <ToasterProvider>
                <ApolloWrapper>
                  <QueryClientProvider client={queryClient}>
                    <CommandsProvider>
                      <AuthProvider>
                        <StackProvider>
                          <SidePanelStackProvider>
                            <SidePanelProvider>
                              <ContributorProfilePanelProvider>
                                <RewardDetailPanelProvider>
                                  <ContributionDetailPanelProvider>
                                    {config.MAINTENANCE ? (
                                      <Maintenance />
                                    ) : (
                                      <OnboardingProvider>
                                        <Stacks />
                                        <App />
                                      </OnboardingProvider>
                                    )}
                                  </ContributionDetailPanelProvider>
                                </RewardDetailPanelProvider>
                              </ContributorProfilePanelProvider>
                            </SidePanelProvider>
                          </SidePanelStackProvider>
                        </StackProvider>
                      </AuthProvider>
                    </CommandsProvider>
                  </QueryClientProvider>
                </ApolloWrapper>
              </ToasterProvider>
            </TokenSetProvider>
          </ImpersonationClaimsProvider>
        </SessionProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </IntlProvider>
);
