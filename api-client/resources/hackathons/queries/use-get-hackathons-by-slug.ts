"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
import { useReactQueryAdapter } from "api-client/adapter/react-query/react-query-adapter";
import { getHackathonBySlug } from "api-client/resources/hackathons/fetch";
import { GetHackathonDetailsReponse } from "api-client/resources/hackathons/types";

export const useGetHackathonBySlug = (slug: string) => {
  const fetcher = useReactQueryAdapter<GetHackathonDetailsReponse>(getHackathonBySlug(slug));
  const { isAuthenticated } = useAuth0();

  return useQuery<GetHackathonDetailsReponse>({
    queryKey: [fetcher.tag],
    queryFn: () => fetcher.request(),
    enabled: isAuthenticated,
  });
};