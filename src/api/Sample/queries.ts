import { API_PATH } from "src/api/ApiPath";
import { UseQueryProps, useBaseQuery } from "src/api/useBaseQuery";

import { SAMPLE_TAGS } from "./tags";

const useSampleByIdQuery = ({ params, options = {} }: UseQueryProps<{ sample: string }, { rewardId?: string }>) => {
  return useBaseQuery<{ sample: string }>({
    resourcePath: API_PATH.SAMPLES,
    enabled: !!params?.rewardId,
    tags: SAMPLE_TAGS.detail(SAMPLE_TAGS.me(), params?.rewardId || ""),
    ...options,
  });
};

const useProjectSampleByIdQuery = ({
  params,
  options = {},
}: UseQueryProps<{ sample: string }, { rewardId?: string; projectId?: string }>) => {
  return useBaseQuery<{ sample: string }>({
    resourcePath: API_PATH.SAMPLES,
    enabled: !!params?.rewardId && !!params?.projectId,
    tags: SAMPLE_TAGS.detail(SAMPLE_TAGS.project(params?.projectId || ""), params?.rewardId || ""),
    ...options,
  });
};

export default { useProjectSampleByIdQuery, useSampleByIdQuery };
