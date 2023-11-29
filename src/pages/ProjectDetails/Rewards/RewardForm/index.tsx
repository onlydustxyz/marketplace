import { useForm, FormProvider } from "react-hook-form";
import { Contributor, Inputs } from "./types";
import { useCallback, useState } from "react";
import { useIntl } from "src/hooks/useIntl";
import View from "./View";
import { useShowToaster } from "src/hooks/useToaster";
import { generatePath, useNavigate, useOutletContext } from "react-router-dom";
import { ProjectRoutePaths, RoutePaths } from "src/App";
import { ProjectBudgetType } from "src/pages/ProjectDetails/Rewards/RemainingBudget/RemainingBudget";
import { useMutationRestfulData, useRestfulData } from "src/hooks/useRestfulData/useRestfulData";
import { ApiResourcePaths } from "src/hooks/useRestfulData/config";
import Loader from "src/components/Loader";
import { useLocalStorage } from "usehooks-ts";
import { reorderBudgets } from "./utils";
import { BudgetCurrencyType } from "src/utils/money";
import ErrorFallback from "src/ErrorFallback";
import { useApolloClient } from "@apollo/client";
import { useQueryClient } from "@tanstack/react-query";
import MeApi from "src/api/me";
import { CompletedRewardableItem } from "src/api/Project/queries";
import { RewardableWorkItem } from "./WorkItemSidePanel/WorkItems/WorkItems";
import ProjectApi from "src/api/Project";

const RewardForm: React.FC = () => {
  const { T } = useIntl();
  const showToaster = useShowToaster();
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const client = useApolloClient();

  const { projectId, projectKey } = useOutletContext<{
    projectId: string;
    projectKey: string;
  }>();

  const {
    data: projectBudget,
    isLoading: isBudgetLoading,
    isError: isBudgetError,
    refetch,
  } = useRestfulData<ProjectBudgetType>({
    resourcePath: ApiResourcePaths.GET_PROJECT_BUDGETS,
    pathParam: { projectId },
    method: "GET",
  });

  const { mutate: createProjectReward, isPending: isCreateProjectRewardLoading } = useMutationRestfulData({
    resourcePath: ApiResourcePaths.PROJECT_REWARDS,
    pathParam: projectId,
    method: "POST",
    onSuccess: async () => {
      try {
        await refetch();
        showToaster(T("reward.form.sent"));
        queryClient.invalidateQueries({ queryKey: [MeApi.tags.all, ProjectApi.tags.completed_rewardable_items] });
        // DELETE ME : this is maybe useless, need to check an clean after all the tech revamp is done
        await client.refetchQueries({ include: ["GetPaymentRequestIds"] });
        navigate(generatePath(RoutePaths.ProjectDetails, { projectKey }) + "/" + ProjectRoutePaths.Rewards);
      } catch (e) {
        console.error(e);
      }
    },
  });

  const [preferredCurrency, setPreferredCurrency] = useLocalStorage<BudgetCurrencyType | undefined>(
    `preferredCurrency-${projectId}`,
    undefined
  );

  const formMethods = useForm<Inputs>({
    defaultValues: {
      remainingBudget: projectBudget?.remainingDollarsEquivalent,
      contributorHandle: null,
    },
    mode: "all",
  });

  const [contributor, setContributor] = useState<Contributor | null | undefined>(null);

  const {
    data: completedContributions,
    isLoading: isCompletedContributionsLoading,
    isError: isCompletedContributionsError,
  } = ProjectApi.queries.useCompletedRewardableItems({
    params: { projectId, githubUserId: contributor?.githubUserId.toString() },
    options: { enabled: !!contributor?.githubUserId },
  });

  if (isCompletedContributionsError) {
    showToaster(T("state.errorFetchingNamedItem", { item: "contributions" }), { isError: true });
  }

  const contributions = completedContributions;

  const { handleSubmit } = formMethods;

  const onValidSubmit = (formData: Inputs) => {
    if (contributor) {
      createProjectReward(mapFormDataToVariables({ ...formData, contributor }));
      setPreferredCurrency(formData.currency);
    }
  };

  const onWorkItemsChange = useCallback(
    (workItems: RewardableWorkItem[]) =>
      formMethods.setValue(
        "workItems",
        workItems.map(workItem => {
          return {
            id: workItem.id || "",
            repoId:
              Number(workItem.githubIssue?.repoId) ||
              Number(workItem.githubPullRequest?.repoId) ||
              Number(workItem.githubCodeReview?.repoId) ||
              0,
            number:
              workItem.githubIssue?.number ||
              workItem.githubPullRequest?.number ||
              workItem.githubCodeReview?.number ||
              0,

            type: workItem.type,
          };
        })
      ),
    [formMethods]
  );

  if (isBudgetError) {
    return <ErrorFallback />;
  }

  return (
    <>
      <FormProvider {...formMethods}>
        <form
          autoComplete="off"
          onSubmit={handleSubmit(onValidSubmit)}
          className="flex w-full flex-col justify-between gap-6"
        >
          {!isBudgetLoading && projectBudget?.remainingDollarsEquivalent && projectBudget?.initialDollarsEquivalent ? (
            <View
              projectBudget={reorderBudgets(projectBudget)}
              preferredCurrency={preferredCurrency}
              projectId={projectId}
              onWorkItemsChange={onWorkItemsChange}
              contributor={contributor}
              setContributor={setContributor}
              unpaidContributions={contributions as CompletedRewardableItem}
              isCreateProjectRewardLoading={isCreateProjectRewardLoading}
              isCompletedContributionsLoading={isCompletedContributionsLoading}
            />
          ) : (
            <Loader />
          )}
        </form>
      </FormProvider>
    </>
  );
};

const mapFormDataToVariables = ({ workItems, amountToWire, currency, contributor }: Inputs) => {
  return {
    amount: amountToWire,
    currency,
    recipientId: contributor.githubUserId,
    items: workItems,
  };
};

export default RewardForm;
