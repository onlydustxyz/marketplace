import { Money } from "utils/Money/Money";
import { describe, expect, it } from "vitest";

import { Channel } from "src/App/Stacks/ContributorProfileSidePanel/EditView/types";

import isContactInfoProvided from "./isContactInfoProvided";

const userProfile = {
  avatarUrl: "https://avatars.githubusercontent.com/u/595505?v=4",
  bio: "Contributing to awesome open source projects.",
  contacts: [
    {
      channel: "DISCORD" as const,
      contact: "foobar@gmail.com",
      visibility: "private" as const,
    },
    {
      channel: "LINKEDIN" as const,
      contact: "linkedin.com",
      visibility: "private" as const,
    },
    {
      channel: "TELEGRAM" as const,
      contact: "telegram.com",
      visibility: "private" as const,
    },
    {
      channel: "TWITTER" as const,
      contact: "twitter.com",
      visibility: "private" as const,
    },
  ],
  createdAt: "2023-11-23T21:07:49.749Z",
  firstContributedAt: "2023-11-23T21:07:49.749Z",
  githubUserId: 595505,
  htmlUrl: "string",
  id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  lastSeenAt: "2023-11-23T21:07:49.749Z",
  location: "Paris, France",
  login: "ofux",
  projects: [
    {
      contributorCount: 163,
      id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      isLead: false,
      leadSince: "2023-11-23T21:07:49.749Z",
      logoUrl: "https://onlydust-app-images.s3.eu-west-1.amazonaws.com/2529199823275297272.jpg",
      name: "Verkle Tries",
      slug: "string",
      totalGranted: 25400,
      userContributionCount: 34,
      userLastContributedAt: "2023-11-23T21:07:49.749Z",
      visibility: "PRIVATE" as const,
    },
  ],
  stats: {
    contributedProjectCount: 2,
    contributionCount: 104,
    contributionCountPerWeeks: [
      {
        codeReviewCount: 0,
        issueCount: 0,
        pullRequestCount: 0,
        week: 34,
        year: 2023,
      },
    ],
    contributionCountVariationSinceLastWeek: 0,
    leadedProjectCount: 1,
    totalsEarned: {
      details: [
        {
          currency: Money.fromSchema({ code: "APT" }),
          amount: 0,
          prettyAmount: 0,
          usdEquivalent: 0,
        },
      ],
      totalAmount: 0,
    },
  },
  website: "string",
  allocatedTimeToContribute: "GREATER_THAN_THREE_DAYS" as const,
  isLookingForAJob: false,
};

describe("isContactInfoProvided", () => {
  it("should return true if contact info is provided", () => {
    const result = isContactInfoProvided(userProfile, [
      Channel.Telegram,
      Channel.Twitter,
      Channel.Discord,
      Channel.LinkedIn,
    ]);

    expect(result).toEqual(true);
  });

  it("should return false if contact info is not provided", () => {
    const result = isContactInfoProvided(userProfile, Channel.Whatsapp);

    expect(result).toEqual(false);
  });
});
