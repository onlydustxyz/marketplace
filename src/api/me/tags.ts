import { RESSOURCE_TAGS } from "src/api/ressource-tags";

export const ME_TAGS = {
  all: [RESSOURCE_TAGS.ME],
  user: [RESSOURCE_TAGS.ME, "user"],
  rewards: () => [RESSOURCE_TAGS.ME, "rewards"],
  githubOrganization: () => [RESSOURCE_TAGS.ME, "github-organization"],
  contributions: (tags: unknown[] = []) => [RESSOURCE_TAGS.ME, "contributions", ...tags],
  contributedProjects: () => [RESSOURCE_TAGS.ME, "contributed-projects"],
  contributedRepos: () => [RESSOURCE_TAGS.ME, "contributed-repos"],
  payoutInfo: () => [RESSOURCE_TAGS.ME, "payout-info"],
  profile: () => [RESSOURCE_TAGS.ME, "profile"],
  rewarded_currencies: () => [RESSOURCE_TAGS.ME, "rewarded_currencies"],
  rewarded_projects: () => [RESSOURCE_TAGS.ME, "rewarded_projects"],
  rewarded_pending_invoice: () => [RESSOURCE_TAGS.ME, "rewarded_pending_invoice"],
};
