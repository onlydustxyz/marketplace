"use client";

import { useMemo } from "react";

import { Avatar } from "components/ds/avatar/avatar";
import { Card } from "components/ds/card/card";
import { Tooltip } from "components/ds/tooltip/tooltip";
import { ContributorsAvatars } from "components/features/contributors-avatars/contributors-avatars";
import { Container } from "components/layout/container/container";
import { Typography } from "components/layout/typography/typography";

const MAX_CONTRIBUTORS = 3;
function Project() {
  const avatars = [
    { avatarUrl: "", login: "ABC", githubUserId: 123 },
    { avatarUrl: "", login: "DEF", githubUserId: 456 },
    { avatarUrl: "", login: "GHI", githubUserId: 789 },
    { avatarUrl: "", login: "JKL", githubUserId: 101112 },
    { avatarUrl: "", login: "MNO", githubUserId: 131415 },
  ];

  const displayContributors = useMemo(() => avatars.slice(0, 3), [avatars]);
  const nbContributors = useMemo(() => avatars.length, [avatars]);

  function handleClick() {
    alert("Check this project out 👌");
  }

  return (
    <Card
      as={"article"}
      hasPadding={false}
      border={"heavy"}
      background={"medium"}
      className={"cursor-pointer shadow-medium"}
      onClick={handleClick}
    >
      <div className={"grid gap-5 p-5"}>
        <div className={"flex gap-4"}>
          <Avatar src={""} alt={"PROJECT NAME"} size={"xl"} shape={"square"} />

          <div className={"grid gap-1"}>
            <Typography variant={"title-s"} className={"truncate"}>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus aspernatur autem cum delectus dolore
              eaque eligendi esse ipsum laboriosam maiores perferendis provident quaerat quam quia sed, similique
              tenetur, totam voluptate?
            </Typography>

            <Typography variant={"body-s"} className={"line-clamp-2 text-spaceBlue-200"}>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ad adipisci atque eligendi est fugiat labore,
              maiores minus non odit porro quaerat quibusdam sapiente tempora totam ullam! Earum numquam officia qui?
            </Typography>
          </div>
        </div>

        <footer className={"flex items-center gap-3"}>
          {/* TODO @hayden */}
          <span>Tag</span>

          <Tooltip content={<ContributorsAvatars.TooltipContent contributors={avatars} />} canInteract>
            <ContributorsAvatars
              contributors={displayContributors}
              avatarProps={{ size: "xs" }}
              enableTooltip={false}
            />

            {nbContributors > MAX_CONTRIBUTORS ? (
              <Typography
                variant={"body-s"}
                className={"ml-1 text-spaceBlue-100"}
                translate={{
                  token: "v2.pages.ecosystems.detail.projectGoodFirstIssues.contributors",
                  params: { count: nbContributors - MAX_CONTRIBUTORS },
                }}
              />
            ) : null}
          </Tooltip>
        </footer>
      </div>
    </Card>
  );
}

export function ProjectGoodFirstIssues() {
  return (
    <Container>
      <Card border={"multiColor"} background={"multiColor"} className={"grid gap-3 lg:grid-cols-3"}>
        <Project />
        <Project />
        <Project />
      </Card>
    </Container>
  );
}
