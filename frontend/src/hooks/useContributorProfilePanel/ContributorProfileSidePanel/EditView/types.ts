import { merge } from "lodash";
import {
  AllocatedTime,
  Channel,
  UpdateUserProfileMutationVariables,
  UserProfileFragment,
} from "src/__generated/graphql";
import { LanguageMap } from "src/types";

export type UserProfileInfo = {
  location: string;
  bio: string;
  website: string;
  githubHandle: string;
  isGithubHandlePublic: boolean;
  email: string;
  isEmailPublic: boolean;
  telegram: string;
  isTelegramPublic: boolean;
  twitter: string;
  isTwitterPublic: boolean;
  discord: string;
  isDiscordPublic: boolean;
  linkedin: string;
  isLinkedInPublic: boolean;
  languages: LanguageMap;
  weeklyAllocatedTime: AllocatedTime;
  lookingForAJob: boolean;
};

export const DefaultUserProfileInfo: UserProfileInfo = {
  location: "",
  bio: "",
  website: "",
  githubHandle: "",
  isGithubHandlePublic: true,
  email: "",
  isEmailPublic: true,
  telegram: "",
  isTelegramPublic: true,
  twitter: "",
  isTwitterPublic: true,
  discord: "",
  isDiscordPublic: true,
  linkedin: "",
  isLinkedInPublic: true,
  languages: {},
  weeklyAllocatedTime: AllocatedTime.None,
  lookingForAJob: true,
};

export const fromFragment = (fragment: UserProfileFragment): UserProfileInfo =>
  merge(DefaultUserProfileInfo, {
    bio: fragment.bio,
    location: fragment.location,
    website: fragment.website,
    githubHandle: fragment.login,
    email: fragment.email.at(0)?.contact,
    isEmailPublic: fragment.email.at(0)?.public,
    telegram: fragment.telegram.at(0)?.contact,
    isTelegramPublic: fragment.telegram.at(0)?.public,
    twitter: fragment.twitter.at(0)?.contact,
    isTwitterPublic: fragment.twitter.at(0)?.public,
    discord: fragment.discord.at(0)?.contact,
    isDiscordPublic: fragment.discord.at(0)?.public,
    linkedin: fragment.linkedin.at(0)?.contact,
    isLinkedInPublic: fragment.linkedin.at(0)?.public,
    languages: fragment.languages,
    weeklyAllocatedTime: translateTimeAllocation(fragment.weeklyAllocatedTime),
    lookingForAJob: fragment.lookingForAJob,
  });

export const toVariables = (profile: UserProfileInfo): UpdateUserProfileMutationVariables => ({
  bio: profile.bio,
  contactInformations: [
    { channel: Channel.Email, contact: profile.email, public: profile.isEmailPublic },
    { channel: Channel.Telegram, contact: profile.telegram, public: profile.isTelegramPublic },
    { channel: Channel.Twitter, contact: profile.twitter, public: profile.isTwitterPublic },
    { channel: Channel.Discord, contact: profile.discord, public: profile.isDiscordPublic },
    { channel: Channel.LinkedIn, contact: profile.linkedin, public: profile.isLinkedInPublic },
  ],
  languages: Object.entries(profile.languages).map(([name, weight]) => ({ name, weight })),
  location: profile.location,
  lookingForAJob: profile.lookingForAJob,
  website: profile.website,
  weeklyAllocatedTime: profile.weeklyAllocatedTime,
});

const translateTimeAllocation = (timeAllocation: string): AllocatedTime | undefined => {
  switch (timeAllocation) {
    case "none":
      return AllocatedTime.None;
    case "lt1day":
      return AllocatedTime.LessThanOneDay;
    case "1to3days":
      return AllocatedTime.OneToThreeDays;
    case "gt3days":
      return AllocatedTime.MoreThanThreeDays;
    default:
      return undefined;
  }
};
