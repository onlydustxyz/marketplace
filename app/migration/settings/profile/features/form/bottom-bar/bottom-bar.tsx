import { useFormContext } from "react-hook-form";

import { Spinner } from "src/components/Spinner/Spinner";
import { cn } from "src/utils/cn";

import { Button } from "components/ds/button/button";
import { Tag } from "components/ds/tag/tag";
import { Flex } from "components/layout/flex/flex";
import { Icon } from "components/layout/icon/icon";
import { Translate } from "components/layout/translate/translate";
import { Typography } from "components/layout/typography/typography";

import { TFormBottomBar } from "./bottom-bar.types";

// TODO: Add preview link
export function FormBottomBar({ userProfilInformationIsPending }: TFormBottomBar.Props) {
  const { formState } = useFormContext();
  const { isDirty, isValid } = formState;

  return (
    <Flex
      alignItems="center"
      justifyContent="between"
      className="border-t border-greyscale-50/8 bg-spaceBlue-900 px-8 py-5 shadow-medium"
    >
      <Tag size="medium">
        {isDirty || !isValid ? (
          <Flex
            alignItems="center"
            className={cn("gap-1", {
              "text-orange-500": !isValid,
              "text-spacePurple-300": isValid,
            })}
          >
            <Icon remixName="ri-error-warning-line" />

            <Typography variant="body-s">
              {isValid ? (
                <Translate token="profile.form.saveStatus.unsaved" />
              ) : (
                <Translate token="profile.form.saveStatus.invalid" />
              )}
            </Typography>
          </Flex>
        ) : (
          <>
            <Icon remixName="ri-check-line" />
            <Translate token="profile.form.saveStatus.saved" />
          </>
        )}
      </Tag>

      <Flex alignItems="center" className="gap-5">
        <Button variant="secondary">
          <Icon remixName="ri-external-link-line" size={20} />
          <Translate token="v2.pages.settings.publicProfile.buttons.preview" />
        </Button>

        <Button type="submit" disabled={userProfilInformationIsPending || !isValid}>
          {userProfilInformationIsPending ? (
            <Spinner className="h-5 w-5" />
          ) : (
            <Icon remixName="ri-check-line" size={20} />
          )}
          <Translate token="v2.pages.settings.publicProfile.buttons.save" />
        </Button>
      </Flex>
    </Flex>
  );
}
