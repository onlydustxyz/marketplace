import { PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import ErrorFallback from "src/ErrorFallback";
import ProjectApi from "src/api/Project";
import Button, { ButtonOnBackground, ButtonSize, ButtonType } from "src/components/Button";
import Card from "src/components/Card";
import { FormStatus } from "src/components/FormStatus/FormStatus";
import Loader from "src/components/Loader";
import { Flex } from "src/components/New/Layout/Flex";
import Center from "src/components/Utils/Center";
import { useIntl } from "src/hooks/useIntl";
import ArrowRightSLine from "src/icons/ArrowRightSLine";
import FileListLine from "src/icons/FileListLine";
import { cn } from "src/utils/cn";
import { EditContext, EditProvider } from "./EditContext";
import { Information } from "./pages/Information/Information";
import { Repository } from "./pages/Repository/Repository";
import { Tabs } from "src/components/Tabs/Tabs";
import ErrorWarningLine from "src/icons/ErrorWarningLine";
import GitRepositoryLine from "src/icons/GitRepositoryLine";
import { hasUnauthorizedInGithubRepo } from "src/utils/getOrgsWithUnauthorizedRepos";
import CloseLine from "src/icons/CloseLine";
import Title from "../Title";
import { useMediaQuery } from "usehooks-ts";
import { viewportConfig } from "src/config";
import { usePooling } from "src/hooks/usePooling/usePooling";
import { useFormState } from "react-hook-form";

function TabContents({ children }: PropsWithChildren) {
  return <Flex className="items-center gap-2 md:gap-1.5">{children}</Flex>;
}

enum TabsType {
  General = "General",
  Repos = "Repos",
}

function SafeProjectEdition() {
  const { T } = useIntl();
  const [searchParams] = useSearchParams();
  const installation_id = searchParams.get("installation_id") ?? "";
  const initialTab = searchParams.get("tab") ?? "";
  const [activeTab, setActiveTab] = useState<TabsType>(
    installation_id || initialTab === TabsType.Repos ? TabsType.Repos : TabsType.General
  );
  const { form, project } = useContext(EditContext);
  const { errors } = useFormState({ control: form?.control });
  const errorsKeys = Object.keys(errors || {});

  const is2Xl = useMediaQuery(`(min-width: ${viewportConfig.breakpoints["2xl"]}px)`);
  const WrapperComponent = is2Xl ? Card : Flex;

  const hasGeneralValidationTabError = useMemo(() => {
    if (!errorsKeys.length) {
      return false;
    }

    if (errorsKeys.length === 1 && errorsKeys?.[0] === "githubRepos") {
      return false;
    }

    return true;
  }, [errorsKeys]);

  const tabs = useMemo(
    () => [
      {
        active: activeTab === TabsType.General,
        onClick: () => {
          setActiveTab(TabsType.General);
        },
        children: (
          <TabContents>
            {hasGeneralValidationTabError && activeTab !== TabsType.General ? (
              <ErrorWarningLine className="text-orange-500" />
            ) : (
              <FileListLine />
            )}
            {T("project.details.edit.tabs.general")}
          </TabContents>
        ),
      },
      {
        active: activeTab === TabsType.Repos,
        onClick: () => {
          setActiveTab(TabsType.Repos);
        },
        children: (
          <TabContents>
            {(hasUnauthorizedInGithubRepo(project?.repos) || errorsKeys?.includes("githubRepos")) &&
            activeTab !== TabsType.Repos ? (
              <ErrorWarningLine className="text-orange-500" />
            ) : (
              <GitRepositoryLine />
            )}
            {T("project.details.edit.tabs.repositories")}
          </TabContents>
        ),
      },
    ],
    [activeTab, errorsKeys, hasGeneralValidationTabError]
  );

  return (
    <Flex className="mx-auto h-full max-w-7xl flex-col">
      <Flex className="items-center px-4 py-6 xl:px-8 2xl:px-0">
        <Link to="../">
          <Button size={ButtonSize.Xs} type={ButtonType.Secondary} iconOnly className="mr-3">
            <CloseLine />
          </Button>
        </Link>
        <Title>
          <Flex className="flex-row items-center justify-between gap-2">{T("project.details.edit.title")}</Flex>
        </Title>
      </Flex>

      <WrapperComponent className="flex w-full flex-1 flex-col overflow-hidden" padded={false} withBg={false}>
        <header className="z-10 w-full border-b border-greyscale-50/20 bg-card-background-base px-4 pb-4 pt-7 shadow-2xl backdrop-blur-3xl md:px-8 md:pb-0 md:pt-8 2xl:rounded-t-2xl">
          <Tabs tabs={tabs} variant="blue" showMobile mobileTitle={T("project.details.edit.title")} />
        </header>

        <Flex
          className={cn("scrollbar-sm bg-transparency-gradiant w-full flex-1 justify-center overflow-y-scroll p-6")}
        >
          {activeTab === TabsType.General ? (
            <Card className="bg-card-background-base">
              <Information />
            </Card>
          ) : (
            <Repository />
          )}
        </Flex>

        <Flex className="w-full border-t border-card-border-light bg-card-background-base shadow-medium xl:rounded-b-2xl">
          <Flex
            justify="between"
            item="center"
            gap={4}
            className="h-full w-full items-center bg-card-background-light px-6 py-5"
          >
            <FormStatus
              {...{ isDirty: form?.formState.isDirty, isValid: form?.formState.isValid }}
              errorMessage={T("project.details.edit.errors.informations")}
            />
            <Button
              size={ButtonSize.Md}
              htmlType="submit"
              disabled={!form?.formState.isDirty || !form?.formState.isValid || form?.formState.isSubmitting}
              onBackground={ButtonOnBackground.Blue}
            >
              {T("project.details.edit.save")}
              <ArrowRightSLine className="-mr-2 text-2xl" />
            </Button>
          </Flex>
        </Flex>
      </WrapperComponent>
    </Flex>
  );
}

export default function ProjectEdition() {
  const { refetchOnWindowFocus, refetchInterval, onRefetching } = usePooling({
    limites: 2,
    delays: 2500,
  });

  const { projectKey = "" } = useParams<{ projectKey: string }>();
  const { data, isLoading, isError, isRefetching } = ProjectApi.queries.useGetProjectBySlug({
    params: { slug: projectKey },
    options: {
      retry: 1,
      refetchOnWindowFocus,
      refetchInterval,
    },
  });

  useEffect(() => {
    onRefetching(isRefetching);
  }, [isRefetching]);

  if (isLoading) {
    return (
      <Center className="h-full">
        <Loader />
      </Center>
    );
  }

  if (isError || !data) {
    return (
      <Center className="h-full overflow-hidden">
        <ErrorFallback />
      </Center>
    );
  }

  return (
    <EditProvider project={data}>
      <SafeProjectEdition />
    </EditProvider>
  );
}
