import { gql } from "@apollo/client";
import onlyDustLogo from "assets/img/onlydust-logo-space.jpg";
import { generatePath, Link } from "react-router-dom";
import { RoutePaths } from "src/App";
import classNames from "classnames";
import Button, { ButtonSize } from "src/components/Button";
import Card, { CardBorder } from "src/components/Card";
import RoundedImage, { ImageSize, Rounding } from "src/components/RoundedImage";
import { viewportConfig } from "src/config";
import { useIntl } from "src/hooks/useIntl";
import CodeSSlashLine from "src/icons/CodeSSlashLine";
import { buildLanguageString, getDeduplicatedAggregatedLanguages } from "src/utils/languages";
import { formatMoneyAmount } from "src/utils/money";
import { useMediaQuery } from "usehooks-ts";
import { ProjectContributorsFragmentDoc, ProjectLeadFragmentDoc, SponsorFragmentDoc } from "src/__generated/graphql";
import User3Line from "src/icons/User3Line";
import FundsLine from "src/icons/FundsLine";
import Tooltip, { TooltipPosition } from "src/components/Tooltip";
import ProjectTitle from "./ProjectTitle";
import isDefined from "src/utils/isDefined";
import GitRepositoryLine from "src/icons/GitRepositoryLine";
import Tag, { TagSize } from "src/components/Tag";
import { getContributors } from "src/utils/project";
import { ArrayElement } from "src/types";
import { GetProjectsQuery } from "src/__generated/graphql";

export type Project = ArrayElement<GetProjectsQuery["projects"]>;

type ProjectCardProps = Project & {
  selectable?: boolean;
};

export default function ProjectCard({
  id,
  pendingInvitations,
  projectDetails,
  githubRepos,
  projectLeads,
  budgetsAggregate,
  budgets,
  projectSponsors,
}: ProjectCardProps) {
  const { T } = useIntl();
  const isXl = useMediaQuery(`(min-width: ${viewportConfig.breakpoints.xl}px)`);
  const totalSpentAmountInUsd = budgetsAggregate?.aggregate?.sum?.spentAmount;

  const topSponsors = projectSponsors?.map(projectSponsor => projectSponsor.sponsor).slice(0, 3) || [];
  const { contributors } = getContributors({ githubRepos, budgets });
  const languages = getDeduplicatedAggregatedLanguages(githubRepos);

  const card = (
    <Card
      selectable={isXl}
      className={classNames("bg-noise-light hover:bg-right", {
        "xl:bg-orange-500/8 xl:hover:bg-orange-500/12": pendingInvitations?.length > 0,
      })}
      border={CardBorder.Medium}
      dataTestId="project-card"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row w-full lg:divide-x divide-stone-100/8 gap-4 lg:gap-6 justify-items-center font-walsheim">
          <div className="lg:flex flex-col basis-1/3 min-w-0 gap-y-5">
            <ProjectTitle
              projectId={id}
              projectName={projectDetails?.name || ""}
              projectLeads={projectLeads?.map(lead => lead.user).filter(isDefined) || []}
              logoUrl={projectDetails?.logoUrl || onlyDustLogo}
            />
            {Object.keys(languages).length > 0 && (
              <div className="hidden lg:flex flex-row border border-neutral-600 w-fit px-3 py-1 rounded-2xl gap-2 text-sm items-center">
                <CodeSSlashLine className="text-greyscale-50" />
                <div className="text-white" data-testid={`languages-${id}`}>
                  {buildLanguageString(languages)}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col basis-2/3 lg:pl-6 gap-4 lg:gap-4 justify-center">
            <div className="line-clamp-2 ml-px">{projectDetails?.shortDescription}</div>
            <div className="flex flex-row gap-2">
              {githubRepos && githubRepos.length > 0 && (
                <Tag testid={`github-repo-count-${id}`} size={TagSize.Small}>
                  <GitRepositoryLine />
                  {T("project.details.githubRepos.count", { count: githubRepos.length })}
                </Tag>
              )}
              {contributors.length > 0 && (
                <Tag testid={`contributor-count-${id}`} size={TagSize.Small}>
                  <User3Line />
                  {T("project.details.contributors.count", { count: contributors.length })}
                </Tag>
              )}
              {totalSpentAmountInUsd !== undefined && (
                <>
                  <Tag id={`sponsor-list-${id}`} testid={`sponsor-list-${id}`} size={TagSize.Small}>
                    {projectSponsors?.length ? (
                      <>
                        <div className="flex flex-row -space-x-1">
                          {topSponsors.map(sponsor => (
                            <RoundedImage
                              key={sponsor.id}
                              src={sponsor.logoUrl}
                              alt={sponsor.name}
                              size={ImageSize.Xxs}
                              rounding={Rounding.Circle}
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <FundsLine />
                    )}
                    {isXl
                      ? T("project.amountGranted", { amount: formatMoneyAmount({ amount: totalSpentAmountInUsd }) })
                      : formatMoneyAmount({ amount: totalSpentAmountInUsd })}
                  </Tag>
                  {projectSponsors?.length > 0 && (
                    <Tooltip anchorId={`sponsor-list-${id}`} position={TooltipPosition.Top}>
                      <div className="w-fit">
                        {T("project.fundedBy", {
                          topSponsorsString: topSponsors.map(sponsor => sponsor.name).join(", "),
                        })}
                      </div>
                    </Tooltip>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        {pendingInvitations?.length > 0 && (
          <div className="hidden xl:flex flex-row justify-between items-center font-medium px-6 py-4 rounded-xl bg-orange-500/8">
            <div className="text-white">{T("project.projectLeadInvitation.prompt")}</div>
            <Button size={ButtonSize.Sm}>{T("project.projectLeadInvitation.view")}</Button>
          </div>
        )}
      </div>
    </Card>
  );
  return isXl ? (
    <Link
      to={generatePath(RoutePaths.ProjectDetails, {
        projectId: id,
      })}
    >
      {card}
    </Link>
  ) : (
    card
  );
}

export const PROJECT_CARD_GITHUB_REPOS_FRAGMENT = gql`
  fragment ProjectCardGithubRepoFields on ProjectGithubRepos {
    githubRepoId
    githubRepoDetails {
      id
      languages
    }
  }
`;

export const PROJECT_CARD_FRAGMENT = gql`
  ${ProjectLeadFragmentDoc}
  ${SponsorFragmentDoc}
  ${ProjectContributorsFragmentDoc}
  ${PROJECT_CARD_GITHUB_REPOS_FRAGMENT}
  fragment ProjectCardFields on Projects {
    id
    ...ProjectContributors
    budgetsAggregate {
      aggregate {
        sum {
          spentAmount
        }
      }
    }
    budgets {
      id
    }
    projectDetails {
      projectId
      name
      telegramLink
      logoUrl
      shortDescription
    }
    pendingInvitations {
      id
      githubUserId
    }
    projectLeads {
      userId
      user {
        ...ProjectLead
      }
    }
    githubRepos {
      ...ProjectCardGithubRepoFields
    }
    projectSponsors {
      sponsor {
        ...Sponsor
      }
    }
  }
`;
