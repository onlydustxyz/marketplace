"use client";

import { withAuthenticationRequired } from "@auth0/auth0-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import MeApi from "src/api/me";
import useMutationAlert from "src/api/useMutationAlert";
import { useIntl } from "src/hooks/useIntl";
import { Key } from "src/hooks/useIntl";

import { Flex } from "components/layout/flex/flex";

import { FormFooter } from "../components/form-footer/form-footer";
import { SettingsHeader } from "../components/settings-header/settings-header";
import { ProfileForm } from "./features/form/form";
import { REGEX } from "./features/form/form.regex";
import { TProfileForm } from "./features/form/form.types";
import { formatToData, formatToSchema } from "./features/form/form.utils";
import { ProfileGithubAccount } from "./features/github-account/github-account";

const INVALID_URL = "invalidUrl";
const INVALID_USERNAME = "invalidUsername";
const INVALID_PHONE_NUMBER = "invalidPhoneNumber";

type KeyType = typeof INVALID_URL | typeof INVALID_USERNAME | typeof INVALID_PHONE_NUMBER;

const keys: Record<KeyType, Key> = {
  [INVALID_URL]: "v2.commons.form.errors.invalidUrl",
  [INVALID_USERNAME]: "v2.commons.form.errors.invalidUsername",
  [INVALID_PHONE_NUMBER]: "v2.commons.form.errors.invalidPhoneNumber",
};

const formSchema = z.object({
  avatarUrl: z.string().url().optional(),
  cover: z.string(),
  location: z.string().optional(),
  bio: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  website: z.union([z.string().regex(REGEX.website, keys.invalidUrl), z.string().length(0)]).optional(),
  telegram: z.object({
    contact: z.string().regex(REGEX.telegram, keys.invalidUsername).optional(),
    isPublic: z.boolean(),
  }),
  whatsapp: z.object({
    contact: z.string().regex(REGEX.whatsapp, keys.invalidPhoneNumber).optional(),
    isPublic: z.boolean(),
  }),
  twitter: z.object({
    contact: z.string().regex(REGEX.twitter, keys.invalidUsername).optional(),
    isPublic: z.boolean(),
  }),
  discord: z.object({
    contact: z.string().regex(REGEX.discord, keys.invalidUsername).optional(),
    isPublic: z.boolean(),
  }),
  linkedin: z.object({
    contact: z.string().regex(REGEX.linkedin, keys.invalidUsername).optional(),
    isPublic: z.boolean(),
  }),
  technologies: z.record(z.number()),
  weeklyAllocatedTime: z.nativeEnum(TProfileForm.ALLOCATED_TIME),
  lookingForAJob: z.boolean(),
});

// TODO: Contact information and select input to do with NextUI
// TODO: FieldImage to do with NextUI and add error handle on Input (call everywhere) and Textarea
function SettingsProfilePage() {
  const { T } = useIntl();

  const { data } = MeApi.queries.useGetMyProfileInfo({});

  const formMethods = useForm<TProfileForm.Data>({
    mode: "all",
    resolver: zodResolver(formSchema),
  });

  const { handleSubmit, reset } = formMethods;

  useEffect(() => {
    if (data) {
      reset(formatToData(data));
    }
  }, [data]);

  const {
    mutate: updateUserProfileInfo,
    isPending: userProfilInformationIsPending,
    ...restUpdateProfileMutation
  } = MeApi.mutations.useUpdateProfile({});

  useMutationAlert({
    mutation: restUpdateProfileMutation,
    success: {
      message: T("v2.commons.alert.global.success"),
    },
    error: {
      message: T("v2.commons.alert.global.error"),
    },
  });

  const onSubmit = (formData: TProfileForm.Data) => {
    updateUserProfileInfo(formatToSchema(formData));
  };

  return (
    <FormProvider {...formMethods}>
      <form id="profile-form" className="flex h-full flex-col" onSubmit={handleSubmit(onSubmit)}>
        <Flex direction="col" className="flex-1 gap-4 pb-4">
          <SettingsHeader tokenTitle="v2.pages.settings.profile.title" subtitle="v2.pages.settings.profile.subtitle" />

          <Flex direction="col" className="gap-4">
            <ProfileGithubAccount />

            <ProfileForm />
          </Flex>
        </Flex>

        <FormFooter isPending={userProfilInformationIsPending} hasPreviewButton />
      </form>
    </FormProvider>
  );
}

export default withAuthenticationRequired(SettingsProfilePage);
