import { apiResources } from "api-client/config/resources";
import { EcosystemProjectsPathParams, EcosystemProjectsQueryParams } from "api-client/resources/ecosystems/types";

export default {
  root: `${apiResources.ecosystems}-root`,
  projects_by_slug: (pathParams: EcosystemProjectsPathParams, queryParams: EcosystemProjectsQueryParams) =>
    `${apiResources.ecosystems}-projects-by-slug-${JSON.stringify(pathParams)}-${JSON.stringify(queryParams)}`,
};