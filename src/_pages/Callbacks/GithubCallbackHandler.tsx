import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { RoutePaths } from "src/App";
import { GithubState } from "src/utils/githubSetupLink";

function handleNavigation(searchParams: URLSearchParams, navigate: (path: string) => void) {
  const installationId = searchParams.get("installation_id");
  const state = searchParams.get("state");

  if (installationId && !state) {
    navigate(`${RoutePaths.ProjectCreation}?installation_id=${installationId}`);
  } else if (installationId && state) {
    const isEdit = state.includes(GithubState.edit);
    const isClaim = state.includes(GithubState.claim);
    if (isEdit) {
      navigate(`/p/${state.replace(GithubState.edit, "")}/edit?installation_id=${installationId}`);
    } else if (isClaim) {
      navigate(`/p/${state.replace(GithubState.claim, "")}?claim_callback=${installationId}`);
    }
  }
}

export default function GithubCallbackHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    handleNavigation(searchParams, navigate);
  }, [searchParams, navigate]);

  if (!searchParams.has("installation_id") && !searchParams.has("state")) {
    navigate(RoutePaths.Projects);
  }

  return null;
}
