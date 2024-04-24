"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useMediaQuery } from "usehooks-ts";
import { z } from "zod";

import MeApi from "src/api/me";
import useMutationAlert from "src/api/useMutationAlert";
import Telegram from "src/assets/icons/Telegram";
import { viewportConfig } from "src/config";
import { useIntl } from "src/hooks/useIntl";

import { Button } from "components/ds/button/button";
import { ContactInput } from "components/ds/form/contact-input/contact-input";
import { Flex } from "components/layout/flex/flex";
import { Icon } from "components/layout/icon/icon";
import { Translate } from "components/layout/translate/translate";
import { Typography } from "components/layout/typography/typography";

import { TApplyForm } from "./form.types";
import { formatToData, formatToSchema } from "./form.utils";

const formSchema = z.object({
  telegram: z.object({
    contact: z
      .string()
      .regex(/^(?:@|(?:(?:(?:https?:\/\/)?t(?:elegram)?)\.me\/))?(\w*)$/, "v2.commons.form.errors.invalidUsername")
      .optional(),
    isPublic: z.boolean(),
  }),
});

export function ApplyForm({ formDescription, buttonConnected, onApply, profile, setShowForm }: TApplyForm.Props) {
  const { T } = useIntl();

  const isMd = useMediaQuery(`(min-width: ${viewportConfig.breakpoints.md}px)`);

  const formMethods = useForm<TApplyForm.UserProfileInfo>({
    defaultValues: formatToData(profile),
    mode: "all",
    resolver: zodResolver(formSchema),
  });

  const { handleSubmit, formState, reset, control } = formMethods;
  const { isDirty, isValid } = formState;

  const {
    mutate: updateUserProfileInfo,
    isPending: userProfilInformationIsPending,
    ...restUpdateProfileMutation
  } = MeApi.mutations.useUpdateProfile({
    options: {
      onSuccess: () => {
        onApply();
        setShowForm(false);
      },
    },
  });

  const submitDisabled = !isDirty || !isValid || userProfilInformationIsPending;

  const onSubmit = (formData: TApplyForm.UserProfileInfo) => {
    updateUserProfileInfo(
      formatToSchema({
        oldData: profile,
        newData: formData,
      })
    );
  };

  useMutationAlert({
    mutation: restUpdateProfileMutation,
    success: {
      message: T("v2.commons.alert.global.success"),
    },
    error: {
      message: T("v2.commons.alert.global.error"),
    },
  });

  useEffect(() => {
    reset(formatToData(profile));
  }, [profile]);

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction="col" className="gap-4 rounded-xl border border-orange-500 p-4">
          {formDescription ? (
            <Typography variant="body-s-bold" className="text-orange-500" translate={{ token: formDescription }} />
          ) : null}

          <Controller
            name="telegram.contact"
            control={control}
            render={({ field, fieldState }) => (
              <ContactInput
                {...field}
                {...fieldState}
                isInvalid={!!fieldState.error}
                errorMessage={<Translate token={fieldState.error?.message || ""} />}
                placeholder={T("v2.commons.form.contact.telegram.placeholder")}
                startContent={<Telegram size={16} />}
                visibilityName="telegram.isPublic"
              />
            )}
          />

          <Button disabled={submitDisabled} size={isMd ? "m" : "s"} width="full" backgroundColor="blue" type="submit">
            <Icon remixName="ri-send-plane-2-line" size={20} />
            <Translate token={buttonConnected} />
          </Button>
        </Flex>
      </form>
    </FormProvider>
  );
}