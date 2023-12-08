import { Outlet, useMatch } from "react-router-dom";
import { Toaster } from "src/components/Toaster";
// import Header from "./Header";
import Tooltip from "src/components/Tooltip";
import { viewportConfig } from "src/config";
import { useMediaQuery } from "usehooks-ts";
import { RoutePaths } from "..";
import { Suspense, lazy } from "react";
import Skeleton from "src/components/Skeleton";

const Header = lazy(() => import("./Header"));

export default function Layout() {
  const isXl = useMediaQuery(`(min-width: ${viewportConfig.breakpoints.xl}px)`);
  const isSm = useMediaQuery(`(min-width: ${viewportConfig.breakpoints.sm}px)`);
  const isMatchProjectDetail = useMatch(`${RoutePaths.ProjectDetails}/*`);
  const isMatchProjectCreation = useMatch(`${RoutePaths.ProjectCreation}/*`);
  const hideHeader = isMatchProjectDetail && !isMatchProjectCreation && !isXl;

  return (
    <div className="flex h-[calc(100dvh)] w-screen flex-col xl:fixed">
      {!hideHeader && (
        <Suspense
          fallback={
            <div className="px-6 py-4 ">
              <Skeleton variant="header" />
            </div>
          }
        >
          <Header />
        </Suspense>
      )}
      <Outlet />
      <Toaster />
      {/* Hide tooltips on mobile */}
      {isSm && <Tooltip />}
    </div>
  );
}
