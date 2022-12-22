import { gql } from "@apollo/client";
import { useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "src/components/Sidebar";
import QueryWrapper from "src/components/QueryWrapper";
import { useAuth } from "src/hooks/useAuth";
import { useHasuraQuery } from "src/hooks/useHasuraQuery";
import { HasuraUserRole } from "src/types";
import { decodeBase64ToString } from "src/utils/stringUtils";
import { GetPublicProjectQuery, GetUserProjectQuery } from "src/__generated/graphql";
import Overview from "./Overview";
import onlyDustLogo from "assets/img/onlydust-logo.png";
import PaymentForm from "./PaymentActions/PaymentForm";
import PaymentTableContainer from "./PaymentTableContainer";

type ProjectDetailsParams = {
  projectId: string;
};

export enum ProjectDetailsTab {
  Overview = "Overview",
  ListPayments = "List Payments",
  SendPayment = "Send Payment",
}

export default function ProjectDetails() {
  const [selectedTab, setSelectedTab] = useState<ProjectDetailsTab>(ProjectDetailsTab.Overview);
  const { projectId } = useParams<ProjectDetailsParams>();
  const { ledProjectIds, isLoggedIn } = useAuth();
  const getProjectPublicQuery = useHasuraQuery<GetPublicProjectQuery>(GET_PROJECT_PUBLIC_QUERY, HasuraUserRole.Public, {
    variables: { id: projectId },
    skip: isLoggedIn,
  });

  const getProjectUserQuery = useHasuraQuery<GetUserProjectQuery>(
    GET_PROJECT_USER_QUERY,
    HasuraUserRole.RegisteredUser,
    {
      variables: { id: projectId },
      skip: !isLoggedIn,
    }
  );

  const availableTabs =
    projectId && ledProjectIds && ledProjectIds.includes(projectId)
      ? [ProjectDetailsTab.Overview, ProjectDetailsTab.ListPayments, ProjectDetailsTab.SendPayment]
      : [ProjectDetailsTab.Overview];

  const project = getProjectUserQuery?.data?.projectsByPk || getProjectPublicQuery?.data?.projectsByPk;
  const githubRepo = project?.githubRepo;
  const logoUrl = project?.projectDetails?.logoUrl || project?.githubRepo?.content.logoUrl || onlyDustLogo;

  const component = (
    <>
      {project && (
        <div className="flex flex-row w-full my-3 gap-5 items-stretch">
          <Sidebar>
            <div className="flex flex-col h-full gap-10">
              <div className="border-4 border-neutral-600 p-2 rounded-2xl">
                <img className="md:w-12 w-12 hover:opacity-90" src={logoUrl} alt="Project Logo" />
              </div>
              <div className="text-3xl font-bold border border-neutral-600 rounded-lg p-5">{project.name}</div>
              <div className="flex flex-col gap-3">
                {availableTabs.map((tab: ProjectDetailsTab) => (
                  <div
                    key={tab}
                    className={`bg-neutral-50 w-fit p-3 hover:cursor-pointer text-black ${
                      selectedTab === tab ? "font-bold border-3" : "opacity-70"
                    }`}
                    onClick={() => setSelectedTab(tab)}
                  >
                    {tab}
                  </div>
                ))}
              </div>
            </div>
          </Sidebar>
          {selectedTab === ProjectDetailsTab.Overview && githubRepo?.content?.contributors && (
            <Overview
              decodedReadme={
                githubRepo.content.readme?.content && decodeBase64ToString(githubRepo.content.readme.content)
              }
              lead={project?.projectLeads?.[0]?.user}
              githubRepoInfo={{
                name: githubRepo.name,
                owner: githubRepo.owner,
                contributors: githubRepo.content?.contributors,
                languages: githubRepo.languages,
              }}
            />
          )}
          {selectedTab === ProjectDetailsTab.ListPayments && getProjectUserQuery?.data?.projectsByPk?.budgets?.[0] && (
            <PaymentForm budget={getProjectUserQuery.data.projectsByPk.budgets[0]} />
          )}
          {selectedTab === ProjectDetailsTab.SendPayment &&
            getProjectUserQuery?.data?.projectsByPk?.budgets?.[0].id && (
              <PaymentTableContainer budgetId={getProjectUserQuery.data.projectsByPk.budgets[0].id} />
            )}
        </div>
      )}
    </>
  );

  return isLoggedIn ? (
    <QueryWrapper query={getProjectUserQuery}>{component}</QueryWrapper>
  ) : (
    <QueryWrapper query={getProjectPublicQuery}>{component}</QueryWrapper>
  );
}

const GITHUB_REPO_FIELDS_FRAGMENT = gql`
  fragment ProjectDetailsGithubRepoFields on GithubRepoDetails {
    name
    owner
    content {
      readme {
        content
      }
      contributors {
        login
        avatarUrl
      }
      logoUrl
    }
    languages
  }
`;

export const GET_PROJECT_PUBLIC_QUERY = gql`
  ${GITHUB_REPO_FIELDS_FRAGMENT}
  query GetPublicProject($id: uuid!) {
    projectsByPk(id: $id) {
      name
      projectDetails {
        description
        telegramLink
        logoUrl
      }
      projectLeads {
        user {
          displayName
          avatarUrl
        }
      }
      githubRepo {
        ...ProjectDetailsGithubRepoFields
      }
    }
  }
`;

export const GET_PROJECT_USER_QUERY = gql`
  ${GITHUB_REPO_FIELDS_FRAGMENT}
  query GetUserProject($id: uuid!) {
    projectsByPk(id: $id) {
      name
      budgets {
        id
        initialAmount
        remainingAmount
      }
      projectDetails {
        description
        telegramLink
        logoUrl
      }
      projectLeads {
        user {
          displayName
          avatarUrl
        }
      }
      githubRepo {
        ...ProjectDetailsGithubRepoFields
      }
    }
  }
`;
