import { Outlet, useParams } from "react-router-dom";
import { useMediaQuery } from "usehooks-ts";

import { components } from "src/__generated/api";
import ProjectApi from "src/api/Project";
import { FetchError } from "src/api/query.type";
import { useQueriesErrorBehavior } from "src/api/useQueriesError";
import Background, { BackgroundRoundedBorders } from "src/components/Background";
import SEO from "src/components/SEO";
import { viewportConfig } from "src/config";
import { cn } from "src/utils/cn";

import ProjectsSidebar from "./Sidebar";

export type OutletContext = {
  project: components["schemas"]["ProjectResponse"];
};
interface Props {
  padded?: boolean;
  contentClassName?: string;
}

export default function View({ padded = true, contentClassName }: Props) {
  const isXl = useMediaQuery(`(min-width: ${viewportConfig.breakpoints.xl}px)`);
  const { projectKey = "" } = useParams<{ projectKey: string }>();
  const { data, ...restProjectBySlugQueries } = ProjectApi.queries.useGetProjectBySlug({
    params: { slug: projectKey },
  });

  const errorHandlingComponent = useQueriesErrorBehavior({
    queries: {
      error: restProjectBySlugQueries.error as FetchError,
      isError: restProjectBySlugQueries.isError,
      refetch: restProjectBySlugQueries.refetch,
    },
  });

  if (errorHandlingComponent) {
    return errorHandlingComponent;
  }

  return (
    <>
      {data ? <SEO title={`${data?.name} — OnlyDust`} /> : null}
      <div
        className="flex w-full flex-1 flex-col overflow-hidden border-t-0 border-black pt-4 xl:h-0 xl:flex-row xl:pt-0"
        style={{ boxSizing: "border-box" }}
      >
        <ProjectsSidebar />
        <Background
          roundedBorders={isXl ? BackgroundRoundedBorders.Right : BackgroundRoundedBorders.Full}
          innerClassName={cn(isXl ? "h-full" : "h-auto")}
        >
          <div
            className={cn(
              "mx-auto flex h-full flex-1 flex-col gap-6",
              {
                "max-w-7xl gap-6 px-4 py-6 xl:px-8": padded,
              },
              contentClassName
            )}
          >
            <Outlet />
          </div>
        </Background>
      </div>
    </>
  );
}
