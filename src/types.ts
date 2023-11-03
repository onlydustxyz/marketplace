import { GetAllContributionsQuery, GithubIssueStatus } from "src/__generated/graphql";
import { components } from "./__generated/api";

export type Branded<T, B> = T & { __brand: B };

// https://stackoverflow.com/questions/41253310/typescript-retrieve-element-type-information-from-array-type
export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[]
  ? ElementType
  : never;

//https://stackoverflow.com/a/47914631
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export enum HasuraUserRole {
  Public = "public",
  RegisteredUser = "registered_user",
  Admin = "admin",
}

export enum CustomUserRole {
  ProjectLead = "projectLead",
}

export type UserRole = HasuraUserRole | CustomUserRole;

export type TokenSet = {
  accessToken: AccessToken;
  accessTokenExpiresIn: number;
  creationDate: Date;
  refreshToken: RefreshToken;
  user: TokenSetUser;
};

export type AccessToken = Branded<string, "AccessToken">;
export type RefreshToken = Branded<Uuid, "RefreshToken">;

export type ImpersonationSet = {
  password: string;
  userId: Uuid;
};

export type TokenSetUser = {
  id: Uuid;
  createdAt: Date;
  email: string;
  locale: Locale;
  isAnonymous: boolean;
  defaultRole: HasuraUserRole;
  emailVerified: boolean;
  phoneNumber: PhoneNumber | null;
  phoneNumberVerified: boolean;
  activeMfaType: string | null;
  roles: HasuraUserRole[];
};

export type User = TokenSetUser & {
  login: string;
  avatarUrl: Url | null;
};

type Url = string;
type Uuid = string;
export type Email = string;
export type PhoneNumber = string;

export enum Currency {
  USD = "USD",
  ETH = "ETH",
  STARK = "STARK",
  APT = "APT",
  OP = "OP",
}

export enum PaymentStatus {
  COMPLETE = "COMPLETE",
  PENDING_INVOICE = "PENDING_INVOICE",
  PENDING_SIGNUP = "PENDING_SIGNUP",
  PROCESSING = "PROCESSING",
  MISSING_PAYOUT_INFO = "MISSING_PAYOUT_INFO",
}

export type Locale = "en" | "fr";

export const CLAIMS_KEY = "https://hasura.io/jwt/claims";
export const PROJECTS_LED_KEY = "x-hasura-projectsLeaded";
export const GITHUB_USERID_KEY = "x-hasura-githubUserId";

export interface HasuraJWT {
  [CLAIMS_KEY]?: {
    [PROJECTS_LED_KEY]?: string;
    [GITHUB_USERID_KEY]?: string;
  };
}

export type LanguageMap = { [languageName: string]: number };

export type PayoutSettings = {
  EthTransfer?: {
    Address?: string;
    Name?: string;
  };
  WireTransfer?: {
    IBAN?: string;
    BIC?: string;
  };
};

export type Contributor = {
  githubUserId: number;
  login: string;
  avatarUrl: string | null;
  userId?: string;
};

export enum GithubIssueType {
  Issue,
  PullRequest,
}

export enum GithubPullRequestStatus {
  Merged = "MERGED",
  Open = "OPEN",
  Closed = "CLOSED",
}

export enum GithubCodeReviewStatus {
  Pending = "PENDING",
  ChangeRequested = "CHANGE_REQUESTED",
  Completed = "COMPLETED",
}

export enum GithubCodeReviewOutcome {
  Approved = "approved",
  ChangesRequested = "changes_requested",
}

export enum GithubContributionType {
  Issue = "ISSUE",
  PullRequest = "PULL_REQUEST",
  CodeReview = "CODE_REVIEW",
}

export enum GithubContributionStatus {
  InProgress = "in_progress",
  Completed = "complete",
  Canceled = "canceled",
}

export enum GithubContributionStatusREST {
  InProgress = "IN_PROGRESS",
  Completed = "COMPLETED",
  Cancelled = "CANCELLED",
}

export enum GithubContributionReviewStatus {
  PendingReviewer = "pendingReviewer",
  UnderReview = "underReview",
  Approved = "approved",
  ChangesRequested = "changesRequested",
}

export enum GithubPullRequestDraft {
  Draft = "DRAFT",
}

export type GithubItemStatus =
  | GithubPullRequestStatus
  | GithubIssueStatus
  | GithubCodeReviewStatus
  | GithubPullRequestDraft
  | RewardItemStatus;

type RewardItemStatus = components["schemas"]["RewardItemResponse"]["status"];

type GithubPullRequestTypeStatusDict<T> = Record<
  GithubContributionType.PullRequest,
  Record<GithubPullRequestStatus | GithubPullRequestDraft | RewardItemStatus, T>
>;

type GithubIssueTypeStatusDict<T> = Record<
  GithubContributionType.Issue,
  Record<GithubIssueStatus | RewardItemStatus, T>
>;

type GithubCodeReviewTypeStatusDict<T> = Record<
  GithubContributionType.CodeReview,
  Record<GithubCodeReviewStatus | RewardItemStatus, T>
>;

export type GithubTypeStatusDict<T> = GithubPullRequestTypeStatusDict<T> &
  GithubIssueTypeStatusDict<T> &
  GithubCodeReviewTypeStatusDict<T>;

export type QueryContribution = GetAllContributionsQuery["contributions"][number];

export interface Leader {
  id: string;
  githubUserId: number;
  login: string;
  htmlUrl: string | null;
  avatarUrl: string;
}
export interface Sponsor {
  id: string | null;
  name: string | null;
  url: string | null;
  logoUrl: string | null;
}
export interface Technologies {
  [key: string]: number;
}

export interface TopContributor {
  githubUserId: number;
  login: string;
  htmlUrl: string;
  avatarUrl: string;
}

interface Languages {
  [key: string]: number;
}

export interface Repo {
  id: number;
  owner: string;
  name: string;
  description: string;
  stars: number;
  forkCount: number;
  htmlUrl: string;
  hasIssues: boolean;
  languages?: Languages;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  longDescription?: string;
  logoUrl: string;
  moreInfoUrl: string;
  hiring: boolean;
  visibility: string;
  repoCount: number;
  contributorCount: number;
  leaders: Leader[];
  sponsors: Sponsor[];
  technologies: Technologies;
  topContributors: TopContributor[];
  repos: Repo[];
  isInvitedAsProjectLead: boolean;
  remainingUsdBudget: number;
}

export type Reward = {
  paymentId: string;
  paymentRequest: {
    amount: number;
    currency: string;
    hoursWorked: number;
    invoiceReceivedAt: Date | null;
    payments: {
      processedAt: Date;
    }[];
    paymentsAggregate: {
      aggregate: {
        sum: {
          amount: number | null;
        };
      };
    };
    recipientId: number;
    requestedAt: Date;
    requestor: {
      avatarUrl: string;
      githubUserId: number;
      htmlUrl: string;
      login: string;
    };
  };
};

export type ContributorT = {
  avatarUrl: string | null;
  codeReviewToReward: number | null;
  contributionCount: number;
  contributionToRewardCount: number | null; // not rewarded yet
  earned: {
    details?: {
      currency: "APT" | "ETH" | "OP" | "STARK" | "USD";
      totalAmount: number;
      totalDollarsEquivalent?: number;
    }[];
    totalAmount?: number;
  };
  githubUserId: number;
  issueToReward: number | null;
  login: string;
  pullRequestToReward: number | null;
  rewardCount: number; // already rewarded
  isRegistered?: boolean;
};

export type Contributors = {
  contributors: ContributorT[];
  totalItemNumber: number;
  totalPageNumber: number;
  nextPageIndex: number;
  hasMore: boolean;
};

export type Sorting = {
  field: string | undefined;
  isAscending: boolean | undefined;
};
