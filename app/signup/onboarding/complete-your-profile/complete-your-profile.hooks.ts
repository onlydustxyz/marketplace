"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserReactQueryAdapter } from "core/application/react-query-adapter/user";
import { useClientBootstrapContext } from "core/bootstrap/client-bootstrap-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { TCompleteYourProfile } from "app/signup/onboarding/complete-your-profile/complete-your-profile.types";
import { sanitizeData } from "app/signup/onboarding/onboarding.utils";

import { toast } from "components/atoms/toaster";

import { NEXT_ROUTER } from "constants/router";

import { useIntl } from "hooks/translate/use-translate";

export function useCompleteYourProfile() {
  const { T } = useIntl();
  const router = useRouter();

  const {
    clientBootstrap: { authProvider },
  } = useClientBootstrapContext();
  const { isAuthenticated = false } = authProvider ?? {};

  const { data: userProfile } = UserReactQueryAdapter.client.useGetMyProfile({
    options: {
      enabled: isAuthenticated,
    },
  });

  const { data: user } = UserReactQueryAdapter.client.useGetMe({});

  const { mutateAsync: setMyProfile, ...setMyProfileMutation } = UserReactQueryAdapter.client.useSetMyProfile({
    options: {
      onSuccess: () => {
        toast.default(T("v2.pages.signup.onboarding.completeYourProfile.form.toast.success"));
        router.push(user?.hasCompletedOnboarding ? NEXT_ROUTER.home.all : NEXT_ROUTER.signup.onboarding.root);
      },
      onError: () => {
        toast.error(T("v2.pages.signup.onboarding.completeYourProfile.form.toast.error"));
      },
    },
  });

  const form = useForm<TCompleteYourProfile.form>({
    resolver: zodResolver(TCompleteYourProfile.validation),
    defaultValues: {
      firstName: "",
      lastName: "",
      location: "",
      website: "",
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        firstName: userProfile?.firstName ?? "",
        lastName: userProfile?.lastName ?? "",
        location: userProfile?.location ?? "",
        bio: userProfile?.bio ?? "",
        website: userProfile?.website ?? "",
      });
    }
  }, [userProfile]);

  async function handleFormSubmit(values: TCompleteYourProfile.form) {
    if (!userProfile) return;

    await setMyProfile({
      avatarUrl: userProfile.avatarUrl,
      contacts: userProfile.contacts,
      allocatedTimeToContribute: userProfile.allocatedTimeToContribute,
      isLookingForAJob: userProfile.isLookingForAJob,
      preferredCategories: userProfile.preferredCategories?.map(category => category.id) || [],
      preferredLanguages: userProfile.preferredLanguages?.map(language => language.id) || [],
      joiningGoal: userProfile.joiningGoal,
      ...sanitizeData("firstName", values.firstName),
      ...sanitizeData("lastName", values.lastName),
      ...sanitizeData("location", values.location),
      ...sanitizeData("bio", values.bio),
      ...sanitizeData("website", values.website),
    });
  }

  return {
    userProfile,
    form,
    setMyProfileMutation,
    handleFormSubmit,
  };
}
