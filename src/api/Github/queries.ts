import { components } from "src/__generated/api";
import { API_PATH } from "src/api/ApiPath";
import { UseQueryProps, useBaseQuery } from "src/api/useBaseQuery";

import { GITHUB_TAGS } from "./tags";

export type useInstallationByIdResponse = components["schemas"]["InstallationResponse"];

const useInstallationById = ({
  params,
  options = {},
}: UseQueryProps<useInstallationByIdResponse, { installation_id?: string }>) => {
  return useBaseQuery<useInstallationByIdResponse>({
    resourcePath: API_PATH.GITHUB_INSTALLATIONS(params?.installation_id || ""),
    enabled: !!params?.installation_id,
    tags: GITHUB_TAGS.installation(params?.installation_id || ""),
    ...options,
  });
};

export default { useInstallationById };
