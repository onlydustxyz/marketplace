import { useAuth0 } from "@auth0/auth0-react";

import { Link } from "components/ds/link/link";
import { Tooltip } from "components/ds/tooltip/tooltip";
import { Flex } from "components/layout/flex/flex";
import { Translate } from "components/layout/translate/translate";
import { Typography } from "components/layout/typography/typography";

import { Section } from "../section/section";
import { SocialIcon } from "./components/social-icon/social-icon";
import { TMoreInfos } from "./more-infos.types";

export function MoreInfos({ moreInfos }: TMoreInfos.Props) {
  const { isAuthenticated } = useAuth0();

  const fakeExternalLinks = [
    {
      url: "t.me/",
      value: <Translate token="common.channel.telegram" />,
    },
    {
      url: "discord.com/",
      value: <Translate token="common.channel.discord" />,
    },
    {
      url: "x.com/",
      value: <Translate token="common.channel.twitter" />,
    },
  ];

  if (moreInfos.length === 0) {
    return null;
  }

  return (
    <Section
      title={{
        token: "project.details.overview.moreInfo",
      }}
      remixIconName="ri-link"
    >
      <Flex as="ul" direction="col" className="gap-2">
        {isAuthenticated ? (
          <>
            {moreInfos.map(({ url, value }) => {
              const validUrl = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;

              return (
                <Flex key={validUrl} as="li" alignItems="center" className="gap-1">
                  <SocialIcon url={validUrl} />

                  <Link href={validUrl}>
                    <Typography variant="body-s">
                      {value || validUrl.replace(/^https?:\/\//i, "").replace(/\/$/, "")}
                    </Typography>
                  </Link>
                </Flex>
              );
            })}
          </>
        ) : (
          <>
            {fakeExternalLinks.map(({ url, value }) => (
              <Tooltip key={url} content={<Translate token="common.channel.preventAnonymousTooltips" />}>
                <Flex alignItems="center" className="cursor-not-allowed gap-1">
                  <SocialIcon url={url} />

                  <Typography variant="body-s">{value}</Typography>
                </Flex>
              </Tooltip>
            ))}
          </>
        )}
      </Flex>
    </Section>
  );
}
