import { EcosystemProject } from "api-client/resources/ecosystems/types";

export namespace TMoreProject {
  type TagUnion =
    | "HOT_COMMUNITY"
    | "NEWBIES_WELCOME"
    | "LIKELY_TO_REWARD"
    | "WORK_IN_PROGRESS"
    | "FAST_AND_FURIOUS"
    | "BIG_WHALE"
    | "UPDATED_ROADMAP";
  export interface MoreProjectItemProps {
    project: EcosystemProject;
  }
  export interface MoreProjectProps {
    ecosystemSlug: string;
    className?: string;
    tag: TagUnion;
  }
}