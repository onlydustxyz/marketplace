import onlyDustLogo from "assets/img/onlydust-logo-space.jpg";
import { sortBy } from "lodash";
import { Dispatch, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { generatePath, useNavigate, useOutletContext } from "react-router-dom";
import { ProjectRewardsRoutePaths, ProjectRoutePaths, RoutePaths } from "src/App";
import Badge, { BadgeSize } from "src/components/Badge";
import Button, { ButtonOnBackground, ButtonSize, Width } from "src/components/Button";
import Card from "src/components/Card";
import ContactInformations from "src/components/ContactInformations";
import MarkdownPreview from "src/components/MarkdownPreview";
import ProjectLeadInvitation from "src/components/ProjectLeadInvitation/ProjectLeadInvitation";
import { CalloutSizes } from "src/components/ProjectLeadInvitation/ProjectLeadInvitationView";
import Tag, { TagSize } from "src/components/Tag";
import { withTooltip } from "src/components/Tooltip";
import Flex from "src/components/Utils/Flex";
import config, { viewportConfig } from "src/config";
import { useAuth } from "src/hooks/useAuth";
import {
  Channel,
  UserProfileInfo,
  fromFragment,
  mapFormDataToSchema,
} from "src/App/Stacks/ContributorProfileSidePanel/EditView/types";
import { useIntl } from "src/hooks/useIntl";
import { useLoginUrl } from "src/hooks/useLoginUrl/useLoginUrl";
import { useProjectLeader } from "src/hooks/useProjectLeader/useProjectLeader";
import useProjectVisibility from "src/hooks/useProjectVisibility";
import { Action, SessionMethod, useSession, useSessionDispatch } from "src/hooks/useSession";
import CodeSSlashLine from "src/icons/CodeSSlashLine";
import GitRepositoryLine from "src/icons/GitRepositoryLine";
import LockFill from "src/icons/LockFill";
import Title from "src/pages/ProjectDetails/Title";
import { HasuraUserRole } from "src/types";
import { getOrgsWithUnauthorizedRepos } from "src/utils/getOrgsWithUnauthorizedRepos";
import { buildLanguageString } from "src/utils/languages";
import { getTopTechnologies } from "src/utils/technologies";
import { useMediaQuery } from "usehooks-ts";
import ClaimBanner from "../Banners/ClaimBanner/ClaimBanner";
import { MissingGithubAppInstallBanner } from "../Banners/MissingGithubAppInstallBanner";
import StillFetchingBanner from "../Banners/StillFetchingBanner";
import { OutletContext } from "../View";
import { EditProjectButton } from "../components/EditProjectButton";
import GithubRepoDetails from "./GithubRepoDetails";
import OverviewPanel from "./OverviewPanel";
import useApplications from "./useApplications";
import { VerticalListItemCard } from "src/components/New/Cards/VerticalListItemCard";
import { useShowToaster } from "src/hooks/useToaster";
import isContactInfoProvided from "src/utils/isContactInfoProvided";
import MeApi from "src/api/me";
import useMutationAlert from "src/api/useMutationAlert";
import User3Line from "src/icons/User3Line";
import { UseGetMyProfileInfoResponse } from "src/api/me/queries";

export default function Overview() {
  const { T } = useIntl();
  const showToaster = useShowToaster();
  const { project } = useOutletContext<OutletContext>();
  const { isLoggedIn, githubUserId, roles } = useAuth();
  const { lastVisitedProjectId } = useSession();

  const navigate = useNavigate();
  const dispatchSession = useSessionDispatch();
  const projectId = project?.id;
  const projectName = project?.name;
  const projectSlug = project?.slug;
  const logoUrl = project?.logoUrl ? config.CLOUDFLARE_RESIZE_W_100_PREFIX + project.logoUrl : onlyDustLogo;
  const description = project?.longDescription || LOREM_IPSUM;
  const sponsors = project?.sponsors || [];
  const moreInfos = project?.moreInfos || [];
  const topContributors = project?.topContributors || [];
  const totalContributorsCount = project?.contributorCount || 0;
  const leads = project?.leaders;
  const invitedLeads = project?.invitedLeaders;
  const languages = getTopTechnologies(project?.technologies);
  const hiring = project?.hiring;
  const isProjectLeader = useProjectLeader({ id: projectId });

  const { alreadyApplied, applyToProject } = useApplications(projectId, projectSlug);
  const { isCurrentUserMember } = useProjectVisibility(projectId);

  const { data: myProfileInfo, isError } = MeApi.queries.useGetMyProfileInfo({});

  const isInvited = !!project.invitedLeaders.find(invite => invite.githubUserId === githubUserId);

  useEffect(() => {
    if (projectId && projectId !== lastVisitedProjectId && isProjectLeader) {
      dispatchSession({ method: SessionMethod.SetLastVisitedProjectId, value: projectId });
    }
  }, [projectId, isProjectLeader]);

  const isMd = useMediaQuery(`(min-width: ${viewportConfig.breakpoints.md}px)`);

  const remainingBudget = project?.remainingUsdBudget;
  const isRewardDisabled = !remainingBudget;

  const orgsWithUnauthorizedRepos = getOrgsWithUnauthorizedRepos(project);
  const hasOrgsWithUnauthorizedRepos = orgsWithUnauthorizedRepos.length > 0;
  const showPendingInvites = isProjectLeader || roles.includes(HasuraUserRole.Admin);

  const nbRepos = useMemo(
    () => project.organizations?.flatMap(({ repos }) => repos).length ?? 0,
    [project.organizations]
  );

  if (isError) {
    showToaster(T("profile.error.cantFetch"), { isError: true });
  }

  return (
    <>
      <Title>
        <div className="flex flex-col items-start justify-start gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-2">
          {T("project.details.overview.title")}
          {isProjectLeader && !hasOrgsWithUnauthorizedRepos ? (
            <Flex className="w-full justify-start gap-2 lg:w-auto lg:justify-end">
              <EditProjectButton projectKey={projectSlug} />

              <Button
                disabled={isRewardDisabled}
                onBackground={ButtonOnBackground.Blue}
                className="flex-1 lg:flex-initial"
                size={ButtonSize.Sm}
                {...withTooltip(T("contributor.table.noBudgetLeft"), {
                  visible: isRewardDisabled,
                })}
                onClick={() =>
                  navigate(
                    generatePath(
                      `${RoutePaths.ProjectDetails}/${ProjectRoutePaths.Rewards}/${ProjectRewardsRoutePaths.New}`,
                      {
                        projectKey: projectSlug,
                      }
                    )
                  )
                }
              >
                {T("project.rewardButton.full")}
              </Button>
            </Flex>
          ) : null}
        </div>
      </Title>
      <StillFetchingBanner createdAt={project?.createdAt} />
      {isProjectLeader && hasOrgsWithUnauthorizedRepos ? (
        <MissingGithubAppInstallBanner slug={project.slug} orgs={orgsWithUnauthorizedRepos} />
      ) : null}
      <ProjectLeadInvitation
        projectId={projectId}
        size={CalloutSizes.Large}
        projectSlug={projectSlug}
        isInvited={isInvited}
        projectName={project?.name}
      />
      <ClaimBanner />
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex grow flex-col gap-4">
          <ProjectDescriptionCard
            {...{ projectName, logoUrl, visibility: project?.visibility, languages, description }}
          />
          {!isMd && (
            <OverviewPanel
              {...{
                sponsors,
                moreInfos,
                topContributors,
                totalContributorsCount,
                leads,
                invitedLeads,
                showPendingInvites,
              }}
            />
          )}

          <Card className="flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between border-b border-greyscale-50/8 pb-2 font-walsheim text-base font-medium text-greyscale-50">
              <div className="flex flex-row items-center gap-3">
                <GitRepositoryLine className="text-2xl text-white" />
                {T("project.details.overview.repositories.title")}
              </div>
              <Badge value={nbRepos} size={BadgeSize.Small} />
            </div>
            <div className="flex flex-col gap-6 divide-y divide-greyscale-50/8">
              {project.organizations?.map((organization, i) => (
                <div key={organization.name ?? organization?.login} className={i > 0 ? "pt-6" : ""}>
                  <VerticalListItemCard
                    ContainerProps={{ className: "bg-transparent gap-5 p-0 lg:p-0 border-0" }}
                    title={organization?.name ?? organization?.login ?? ""}
                    avatarAlt={organization?.name ?? organization?.login ?? ""}
                    avatarSrc={organization?.avatarUrl ?? ""}
                  >
                    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                      {sortBy(organization.repos, "stars")
                        .reverse()
                        .filter(r => r)
                        .map(githubRepo => (
                          <GithubRepoDetails key={githubRepo.id} githubRepo={githubRepo} />
                        ))}
                    </div>
                  </VerticalListItemCard>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="flex shrink-0 flex-col gap-4 md:w-72 xl:w-80">
          {hiring && !isCurrentUserMember && myProfileInfo && (
            <ApplyCallout
              {...{ isLoggedIn, alreadyApplied, applyToProject, dispatchSession, profile: myProfileInfo }}
            />
          )}
          {isMd && (
            <OverviewPanel
              {...{
                sponsors,
                moreInfos,
                topContributors,
                totalContributorsCount,
                leads,
                invitedLeads,
                showPendingInvites,
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}

const LOREM_IPSUM = `
Lorem ipsum dolor sit amet, consectetur *adipiscing elit*. Sed non risus. **Suspendisse lectus** tortor, dignissim sit amet:
- adipiscing nec
- ultricies sed
- dolor.

Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue.
`;

function PrivateTag() {
  const { T } = useIntl();

  return (
    <div
      className="flex flex-row items-center gap-2 rounded-lg bg-orange-900 px-2.5 py-1 font-walsheim text-xs font-medium text-orange-500 hover:cursor-default"
      {...withTooltip(T("project.visibility.private.tooltip"))}
    >
      <LockFill /> {T("project.visibility.private.name")}
    </div>
  );
}

interface ProjectDescriptionCardProps {
  projectName?: string | null;
  logoUrl: string;
  visibility: string;
  languages: string[];
  description: string;
}

function ProjectDescriptionCard({
  projectName,
  logoUrl,
  visibility,
  languages,
  description,
}: ProjectDescriptionCardProps) {
  return (
    <Card className="flex flex-col gap-4 px-6 py-4">
      <div className="flex flex-row items-center gap-4">
        <img
          alt={projectName || ""}
          src={logoUrl}
          className="h-20 w-20 flex-shrink-0 rounded-lg bg-spaceBlue-900 object-cover"
        />
        <div className="flex w-full flex-col gap-1">
          <div className="flex flex-row items-center justify-between font-belwe text-2xl font-normal text-greyscale-50">
            {projectName}
            {visibility === "private" && <PrivateTag />}
          </div>
          {languages.length > 0 && (
            <Tag size={TagSize.Small}>
              <CodeSSlashLine />
              {buildLanguageString(languages)}
            </Tag>
          )}
        </div>
      </div>
      <MarkdownPreview className="text-sm">{description}</MarkdownPreview>
    </Card>
  );
}

interface ApplyCalloutProps {
  isLoggedIn?: boolean;
  alreadyApplied?: boolean;
  applyToProject: () => void;
  dispatchSession: Dispatch<Action>;
  profile: UseGetMyProfileInfoResponse;
}

function ApplyCallout({ isLoggedIn, profile, alreadyApplied, applyToProject, dispatchSession }: ApplyCalloutProps) {
  const { T } = useIntl();
  const getLoginUrl = useLoginUrl();
  const login_url = useMemo(() => getLoginUrl(), []);

  const contactInfoProvided = isContactInfoProvided(profile, [
    Channel.Telegram,
    Channel.Whatsapp,
    Channel.Twitter,
    Channel.Discord,
    Channel.LinkedIn,
  ]);

  const [contactInfoRequested, setContactInfoRequested] = useState(false);

  const formMethods = useForm<UserProfileInfo>({
    defaultValues: fromFragment(profile),
    mode: "onChange",
  });

  const { handleSubmit, formState, getValues, reset } = formMethods;
  const { isDirty, isValid } = formState;

  useEffect(() => {
    const values = getValues();
    // If the form state is modified without this component remounting, this state will be unsynced from the "profile" value so we need to reset the state
    if (JSON.stringify(values) !== JSON.stringify(fromFragment(profile))) {
      reset(fromFragment(profile));
    }
  }, []);

  const {
    mutate: updateUserProfileInfo,
    isPending: userProfilInformationIsPending,
    ...restUpdateProfileMutation
  } = MeApi.mutations.useUpdateProfile({
    options: {
      onSuccess: applyToProject,
    },
  });

  useMutationAlert({
    mutation: restUpdateProfileMutation,
    success: {
      message: T("profile.form.success"),
    },
    error: {
      message: T("profile.form.error"),
    },
  });

  const submitDisabled = !isDirty || !isValid || userProfilInformationIsPending;

  const onSubmit = (formData: UserProfileInfo) => {
    updateUserProfileInfo(mapFormDataToSchema(formData));
  };

  return (
    <Card className="p-4 lg:p-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-row items-center gap-2 font-walsheim text-sm font-medium text-spaceBlue-200">
          <User3Line />
          {T("project.hiring").toUpperCase()}
        </div>
        {isLoggedIn ? (
          contactInfoRequested && !contactInfoProvided ? (
            <FormProvider {...formMethods}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-4 rounded-xl border border-orange-500 p-4">
                  <div className="font-walsheim text-sm font-medium text-orange-500">
                    {T("applications.contactNeeded")}
                  </div>
                  <ContactInformations onlyEditable />
                  <div {...withTooltip(submitDisabled ? "" : T("applications.notYetAppliedTooltip"))}>
                    <Button
                      data-testid="apply-btn"
                      size={ButtonSize.Md}
                      width={Width.Full}
                      disabled={submitDisabled}
                      htmlType="submit"
                      onBackground={ButtonOnBackground.Blue}
                    >
                      {T("applications.applyButton")}
                    </Button>
                  </div>
                </div>
              </form>
            </FormProvider>
          ) : (
            <div
              {...withTooltip(T(alreadyApplied ? "applications.appliedTooltip" : "applications.notYetAppliedTooltip"))}
            >
              <Button
                data-testid="apply-btn"
                size={ButtonSize.Md}
                width={Width.Full}
                disabled={alreadyApplied}
                onBackground={ButtonOnBackground.Blue}
                onClick={() => {
                  if (!contactInfoProvided) {
                    setContactInfoRequested(true);
                  } else {
                    applyToProject();
                  }
                }}
              >
                {T("applications.applyButton")}
              </Button>
            </div>
          )
        ) : (
          <a
            href={login_url}
            onClick={() =>
              dispatchSession({ method: SessionMethod.SetVisitedPageBeforeLogin, value: location.pathname })
            }
          >
            <Button size={ButtonSize.Md} width={Width.Full}>
              {T("applications.connectToApplyButton")}
            </Button>
          </a>
        )}
        <p className="text-body-s text-spaceBlue-200">
          {alreadyApplied ? T("applications.informations_already_apply") : T("applications.informations")}
        </p>
      </div>
    </Card>
  );
}
