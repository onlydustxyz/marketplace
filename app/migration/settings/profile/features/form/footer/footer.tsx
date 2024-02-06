import { useAuth0 } from "@auth0/auth0-react";
import { useFormContext } from "react-hook-form";
import { generatePath } from "react-router-dom";

import { RoutePaths } from "src/App";
import { Spinner } from "src/components/Spinner/Spinner";
import { cn } from "src/utils/cn";

import { Button } from "components/ds/button/button";
import { Tag } from "components/ds/tag/tag";
import { Flex } from "components/layout/flex/flex";
import { Icon } from "components/layout/icon/icon";
import { Translate } from "components/layout/translate/translate";
import { Typography } from "components/layout/typography/typography";

import { TFormFooter } from "./footer.types";

// TODO: Change Button with link using the new library
export function FormFooter({ isPending }: TFormFooter.Props) {
  const { user } = useAuth0();

  const { formState } = useFormContext();
  const { isDirty, isValid } = formState;

  return (
    <Flex
      alignItems="center"
      className="-mx-4 -mb-6 flex-col gap-4 border-t border-greyscale-50/8 bg-spaceBlue-900 px-8 py-5 shadow-medium md:flex-row md:justify-between xl:-mx-8"
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
                <Translate token="v2.commons.form.status.unsaved" />
              ) : (
                <Translate token="v2.commons.form.status.invalid" />
              )}
            </Typography>
          </Flex>
        ) : (
          <>
            <Icon remixName="ri-check-line" />
            <Translate token="v2.commons.form.status.saved" />
          </>
        )}
      </Tag>

      <Flex alignItems="center" className="w-full flex-col gap-2 md:w-auto md:flex-row md:gap-5">
        <a
          href={generatePath(RoutePaths.PublicProfile, {
            userLogin: user?.nickname || "",
          })}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full md:w-auto"
        >
          <Button variant="secondary" className="w-full md:w-auto">
            <Icon remixName="ri-external-link-line" size={20} />
            <Translate token="v2.pages.settings.profile.buttons.preview" />
          </Button>
        </a>

        <Button type="submit" disabled={isPending || !isValid} className="w-full md:w-auto">
          {isPending ? <Spinner className="h-5 w-5" /> : <Icon remixName="ri-check-line" size={20} />}
          <Translate token="v2.commons.form.buttons.save" />
        </Button>
      </Flex>
    </Flex>
  );
}
