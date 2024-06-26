import { applicationsApiClient } from "api-client/resources/applications";
import { debounce } from "lodash";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import ProjectApi from "src/api/Project";

import { TUseApplications } from "./use-applications.types";

export function UseApplications({ search }: TUseApplications.Props): TUseApplications.Return {
  const { slug = "", contributionId = "" } = useParams<{ slug?: string; contributionId?: string }>();

  const [debouncedSearch, setDebouncedSearch] = useState<string>(search);

  const debounceSearch = useCallback(
    debounce(newSearch => {
      setDebouncedSearch(newSearch);
    }, 300),
    []
  );

  useEffect(() => {
    debounceSearch(search);
  }, [search, debounceSearch]);

  const { data: project } = ProjectApi.queries.useGetProjectBySlug({
    params: { slug },
  });

  const {
    data: newComersApplicationsData,
    fetchNextPage: newComersFetchNextPage,
    hasNextPage: newComersHasNextPage,
    isFetchingNextPage: newComersIsFetchingNextPage,
    isPending: newComersIsPending,
  } = applicationsApiClient.queries.useInfiniteGetAllApplications({
    queryParams: {
      projectId: project?.id,
      issueId: Number(contributionId),
      isApplicantProjectMember: false,
      applicantLoginSearch: debouncedSearch,
    },
    options: { enabled: !!project?.id },
  });

  const {
    data: projectMembersApplicationsData,
    fetchNextPage: projectMembersFetchNextPage,
    hasNextPage: projectMembersHasNextPage,
    isFetchingNextPage: projectMembersIsFetchingNextPage,
    isPending: projectMembersIsPending,
  } = applicationsApiClient.queries.useInfiniteGetAllApplications({
    queryParams: {
      projectId: project?.id,
      issueId: Number(contributionId),
      isApplicantProjectMember: true,
      applicantLoginSearch: debouncedSearch,
    },
    options: { enabled: !!project?.id },
  });

  const newComersApplications = useMemo(
    () => newComersApplicationsData?.pages.flatMap(page => page.applications),
    [newComersApplicationsData]
  );

  const projectMembersApplications = useMemo(
    () => projectMembersApplicationsData?.pages.flatMap(page => page.applications),
    [projectMembersApplicationsData]
  );

  const title = useMemo(() => {
    if (newComersApplications?.length) return newComersApplications[0].issue.title;
    if (projectMembersApplications?.length) return projectMembersApplications[0].issue.title;

    return "";
  }, [newComersApplications, projectMembersApplications]);

  return {
    newComers: {
      applications: newComersApplications,
      fetchNextPage: newComersFetchNextPage,
      hasNextPage: newComersHasNextPage,
      isFetchingNextPage: newComersIsFetchingNextPage,
      isPending: newComersIsPending,
    },
    projectMembers: {
      applications: projectMembersApplications,
      fetchNextPage: projectMembersFetchNextPage,
      hasNextPage: projectMembersHasNextPage,
      isFetchingNextPage: projectMembersIsFetchingNextPage,
      isPending: projectMembersIsPending,
    },
    title,
  };
}
