import { differenceInDays } from "date-fns";
import { Suspense, useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";

import { ApplyIssueCard } from "app/p/[slug]/components/apply-issue-card/apply-issue-card";
import { ApplyIssueMarkdown } from "app/p/[slug]/components/apply-issue-markdown/apply-issue-markdown";
import { useApplyIssueDrawer } from "app/p/[slug]/features/apply-issue-drawer/apply-issue-drawer.hooks";
import { TApplyIssueDrawer } from "app/p/[slug]/features/apply-issue-drawer/apply-issue-drawer.types";

import { usePosthog } from "src/hooks/usePosthog";

import { Button } from "components/atoms/button/variants/button-default";
import { Tag } from "components/atoms/tag";
import { TagAvatar } from "components/atoms/tag/variants/tag-avatar";
import { TagIcon } from "components/atoms/tag/variants/tag-icon";
import { Textarea } from "components/atoms/textarea";
import { Typo } from "components/atoms/typo/variants/typo-default";
import { SkeletonEl } from "components/ds/skeleton/skeleton";
import { BaseLink } from "components/layout/base-link/base-link";
import { Translate } from "components/layout/translate/translate";
import { Drawer } from "components/molecules/drawer";

export function ApplyIssueDrawer({ issue, hasApplied, state }: TApplyIssueDrawer.Props) {
  const [isOpen, setIsOpen] = state;
  const { capture } = usePosthog();
  const {
    project: { data: project },
    form: { control, handleSubmit, reset, setValue },
    create: { isPending: createIsPending },
    update: { isPending: updateIsPending },
    delete: { isPending: deleteIsPending },
    handleCreate,
    handleUpdate,
    handleCancel,
  } = useApplyIssueDrawer({ issue, state });

  useEffect(() => {
    if (isOpen && project) {
      capture("issue_application_flow_started", {
        issue_id: issue.id,
        project_id: project?.id,
      });
    }
  }, [isOpen, project]);

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen]);

  useEffect(() => {
    setValue("motivations", issue.currentUserApplication?.motivations ?? "");
    setValue("problemSolvingApproach", issue.currentUserApplication?.problemSolvingApproach ?? "");
  }, [issue]);

  const header = useMemo(() => {
    const StartContent = (
      <div className={"flex items-center gap-2"}>
        <TagAvatar
          shape={"square"}
          style={"outline"}
          color={"grey"}
          avatar={{ src: issue.author.avatarUrl, shape: "square" }}
        >
          {issue.author.login}
        </TagAvatar>
        {project ? (
          <TagAvatar
            shape={"square"}
            style={"outline"}
            color={"grey"}
            avatar={{ src: project.logoUrl, shape: "square" }}
          >
            {project.name}
          </TagAvatar>
        ) : null}
      </div>
    );

    const EndContent = hasApplied ? (
      <Button
        as={BaseLink}
        htmlProps={{ href: issue.htmlUrl }}
        startIcon={{ remixName: "ri-github-line" }}
        variant={"secondary-light"}
        size={"l"}
      >
        <Translate token={"v2.features.projects.applyIssueDrawer.header.seeOnGithub"} />
      </Button>
    ) : null;

    return {
      startContent: StartContent,
      endContent: EndContent,
    };
  }, []);

  const footer = useMemo(() => {
    const StartContent = hasApplied ? (
      <TagIcon
        icon={{ remixName: "ri-checkbox-circle-fill" }}
        color={"purple"}
        style={"outline"}
        classNames={{ base: "hidden sm:block" }}
      >
        <Translate token={"v2.features.projects.applyIssueDrawer.footer.applied"} />
      </TagIcon>
    ) : null;

    const EndContent = hasApplied ? (
      <div className={"flex items-center gap-2.5"}>
        <Button variant={"danger"} size={"l"} onClick={handleCancel} isLoading={deleteIsPending}>
          <Translate token={"v2.features.projects.applyIssueDrawer.footer.cancelApplication"} />
        </Button>
        <Button size={"l"} onClick={handleSubmit(handleUpdate)} isLoading={updateIsPending}>
          <Translate token={"v2.features.projects.applyIssueDrawer.footer.updateApplication"} />
        </Button>
      </div>
    ) : (
      <Button type={"submit"} size={"l"} isLoading={createIsPending}>
        <Translate token={"v2.features.projects.applyIssueDrawer.footer.sendAnApplication"} />
      </Button>
    );

    return {
      startContent: StartContent,
      endContent: EndContent,
    };
  }, [hasApplied, createIsPending, updateIsPending, deleteIsPending]);

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      as={"form"}
      htmlProps={{
        onSubmit: handleSubmit(handleCreate),
      }}
      header={header}
      footer={footer}
    >
      <div className={"grid gap-4"}>
        <Typo size={"2xl"} variant={"brand"} color={"text-1"}>
          {issue.title}
        </Typo>

        <div className={"grid grid-cols-6 gap-4"}>
          <ApplyIssueCard
            iconProps={{ remixName: "ri-code-line" }}
            titleProps={{
              translate: {
                token: "v2.features.projects.applyIssueDrawer.sections.languages",
              },
            }}
            className={"col-span-3"}
          >
            <div className="pt-2">
              {issue.languages ? (
                <ul className={"flex flex-wrap gap-2"}>
                  {issue.languages.map(language => (
                    <li key={language.id}>
                      <TagAvatar style={"outline"} color={"grey"} size={"xs"} avatar={{ src: language.logoUrl }}>
                        {language.name}
                      </TagAvatar>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </ApplyIssueCard>
          <ApplyIssueCard
            iconProps={{ remixName: "ri-price-tag-3-line" }}
            titleProps={{
              translate: {
                token: "v2.features.projects.applyIssueDrawer.sections.labels",
              },
            }}
            className={"col-span-3"}
          >
            <div className="pt-2">
              {issue.labels ? (
                <ul className={"flex flex-wrap gap-2"}>
                  {issue.labels.map(label => (
                    <li key={label.name}>
                      <Tag style={"outline"} color={"grey"} size={"xs"}>
                        {label.name}
                      </Tag>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </ApplyIssueCard>

          <ApplyIssueCard
            iconProps={{ remixName: "ri-discuss-line" }}
            titleProps={{
              translate: {
                token: "v2.features.projects.applyIssueDrawer.sections.applicants",
              },
            }}
            container={"3"}
            className={"col-span-2"}
          >
            <div className="pt-2">
              <Typo variant={"brand"} size={"4xl"}>
                {issue.applicants.length}
              </Typo>
            </div>
          </ApplyIssueCard>
          <ApplyIssueCard
            iconProps={{ remixName: "ri-fire-line" }}
            titleProps={{
              translate: {
                token: "v2.features.projects.applyIssueDrawer.sections.comments",
              },
            }}
            container={"3"}
            className={"col-span-2"}
          >
            <div className="pt-2">
              <Typo variant={"brand"} size={"4xl"}>
                {issue.commentCount}
              </Typo>
            </div>
          </ApplyIssueCard>
          <ApplyIssueCard
            iconProps={{ remixName: "ri-time-line" }}
            titleProps={{
              translate: {
                token: "v2.features.projects.applyIssueDrawer.sections.days",
              },
            }}
            container={"3"}
            className={"col-span-2"}
          >
            <div className="pt-2">
              <Typo variant={"brand"} size={"4xl"}>
                {differenceInDays(new Date(), new Date(issue.createdAt))}
              </Typo>
            </div>
          </ApplyIssueCard>

          <Suspense
            fallback={<SkeletonEl width={"100%"} height={400} variant={"rounded"} className={"col-span-full"} />}
          >
            <div className={"col-span-full"}>
              <ApplyIssueMarkdown>{issue.body}</ApplyIssueMarkdown>
            </div>
          </Suspense>

          <ApplyIssueCard
            iconProps={{ remixName: "ri-bill-line" }}
            titleProps={{
              translate: {
                token: "v2.features.projects.applyIssueDrawer.sections.applicationForm.title",
              },
            }}
            className={"col-span-full"}
          >
            <div className="grid gap-3 pt-3">
              <Typo
                as={"label"}
                htmlProps={{ htmlFor: "motivations" }}
                variant={"brand"}
                size={"m"}
                translate={{ token: "v2.features.projects.applyIssueDrawer.sections.applicationForm.motivations" }}
              />
              <Controller
                name="motivations"
                control={control}
                render={({ field, fieldState }) => <Textarea id={field.name} isError={!!fieldState.error} {...field} />}
              />

              <Typo
                as={"label"}
                htmlProps={{ htmlFor: "problemSolvingApproach" }}
                variant={"brand"}
                size={"m"}
                translate={{
                  token: "v2.features.projects.applyIssueDrawer.sections.applicationForm.problemSolvingApproach",
                }}
              />
              <Controller
                name="problemSolvingApproach"
                control={control}
                render={({ field, fieldState }) => <Textarea id={field.name} isError={!!fieldState.error} {...field} />}
              />
            </div>
          </ApplyIssueCard>
        </div>
      </div>
    </Drawer>
  );
}
