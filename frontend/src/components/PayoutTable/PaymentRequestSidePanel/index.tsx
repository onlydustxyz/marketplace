import { useAuth } from "src/hooks/useAuth";
import usePayoutSettings from "src/hooks/usePayoutSettings";
import { PaymentStatus } from "src/types";
import { useCancelPaymentRequestMutation, usePaymentRequestDetailsQuery } from "src/__generated/graphql";
import View from "./View";
import { useShowToaster } from "src/hooks/useToaster";
import { useIntl } from "src/hooks/useIntl";
import { useCommands } from "src/providers/Commands";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  paymentId: string;
};

export default function PaymentRequestSidePanel({
  paymentId,
  ...props
}: Props & {
  onPaymentCancel?: () => void;
  projectLeaderView?: boolean;
}) {
  const { user, githubUserId } = useAuth();
  const { data, loading } = usePaymentRequestDetailsQuery({
    variables: { id: paymentId },
    skip: !githubUserId || !user,
  });

  const status =
    data?.paymentRequestsByPk?.paymentsAggregate.aggregate?.sum?.amount === data?.paymentRequestsByPk?.amountInUsd
      ? PaymentStatus.ACCEPTED
      : PaymentStatus.WAITING_PAYMENT;

  const { invoiceNeeded, valid: payoutSettingsValid } = usePayoutSettings(
    data?.paymentRequestsByPk?.liveGithubRecipient?.id
  );

  return (
    <View
      {...props}
      loading={loading}
      {...data?.paymentRequestsByPk}
      id={paymentId}
      userId={user?.id}
      githubUserId={githubUserId}
      status={status}
      invoiceNeeded={invoiceNeeded}
      payoutInfoMissing={!payoutSettingsValid}
    />
  );
}

export function PaymentRequestSidePanelAsLeader({
  projectId,
  paymentId,
  setOpen,
  ...props
}: Props & { projectId: string }) {
  const showToaster = useShowToaster();
  const { T } = useIntl();
  const { notify } = useCommands();

  const [cancelPaymentRequest] = useCancelPaymentRequestMutation({
    variables: { projectId, paymentId },
    context: { graphqlErrorDisplay: "toaster" },
    onCompleted: () => {
      notify(projectId);
      setOpen(false);
      showToaster(T("reward.form.cancelled"));
    },
  });

  return (
    <PaymentRequestSidePanel
      {...props}
      projectLeaderView
      paymentId={paymentId}
      setOpen={setOpen}
      onPaymentCancel={cancelPaymentRequest}
    />
  );
}
