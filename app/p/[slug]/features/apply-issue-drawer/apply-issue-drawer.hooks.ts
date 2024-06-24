import { zodResolver } from "@hookform/resolvers/zod";
import { applicationsApiClient } from "api-client/resources/applications";
import { meApiClient } from "api-client/resources/me";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { TApplyIssueDrawer } from "app/p/[slug]/features/apply-issue-drawer/apply-issue-drawer.types";

import ProjectApi from "src/api/Project";
import useMutationAlert from "src/api/useMutationAlert";
import { usePosthog } from "src/hooks/usePosthog";

import { useIntl } from "hooks/translate/use-translate";

export function useApplyIssueDrawer({ issue, state }: Pick<TApplyIssueDrawer.Props, "issue" | "state">) {
  const [, setIsOpen] = state;
  const { capture } = usePosthog();
  const { slug = "" } = useParams<{ slug: string }>();
  const project = ProjectApi.queries.useGetProjectBySlug({
    params: { slug },
  });

  const { mutateAsync: createAsync, ...create } = meApiClient.mutations.usePostMyApplication({
    projectId: project.data?.id ?? "",
  });

  const { mutateAsync: updateAsync, ...update } = meApiClient.mutations.useUpdateMyApplication(
    {
      pathParams: {
        applicationId: issue.currentUserApplication?.id ?? "",
      },
    },
    project.data?.id ?? ""
  );

  const { mutateAsync: deleteAsync, ...deleteMutation } = applicationsApiClient.mutations.useDeleteApplication(
    {
      pathParams: {
        applicationId: issue.currentUserApplication?.id ?? "",
      },
    },
    project.data?.id ?? ""
  );

  const { T } = useIntl();
  useMutationAlert({
    mutation: create,
    success: {
      message: T("v2.features.projects.applyIssueDrawer.toaster.createSuccess"),
    },
    error: {
      default: true,
    },
  });

  useMutationAlert({
    mutation: update,
    success: {
      message: T("v2.features.projects.applyIssueDrawer.toaster.updateSuccess"),
    },
    error: {
      default: true,
    },
  });

  const form = useForm<TApplyIssueDrawer.form>({
    resolver: zodResolver(TApplyIssueDrawer.validation),
    defaultValues: {
      motivations: issue.currentUserApplication?.motivations ?? "",
      problemSolvingApproach: issue.currentUserApplication?.problemSolvingApproach ?? "",
    },
  });

  function handleCreate(values: TApplyIssueDrawer.form) {
    createAsync({
      projectId: project.data?.id ?? "",
      issueId: issue.id,
      motivation: values.motivations,
      problemSolvingApproach: values.problemSolvingApproach,
    }).then(() => {
      capture("issue_application_sent", {
        issue_id: issue.id,
        project_id: project?.data?.id,
      });
      setIsOpen(false);
    });
  }

  function handleUpdate(values: TApplyIssueDrawer.form) {
    updateAsync({
      motivation: values.motivations,
      problemSolvingApproach: values.problemSolvingApproach,
    }).then(() => {
      setIsOpen(false);
    });
  }

  function handleCancel() {
    deleteAsync({}).then(() => {
      setIsOpen(false);
      setTimeout(() => {
        form.reset();
      }, 500);
    });
  }

  return {
    project,
    form,
    create,
    update,
    delete: deleteMutation,
    handleCreate,
    handleUpdate,
    handleCancel,
  };
}

export function useApplyIssueDrawerState() {
  return useState(false);
}
