import { components } from "src/__generated/api";
import Tag, { TagBorderColor, TagSize } from "src/components/Tag";
import { withTooltip } from "src/components/Tooltip";
import { useIntl } from "src/hooks/useIntl";
import CheckLine from "src/icons/CheckLine";
import ErrorWarningLine from "src/icons/ErrorWarningLine";
import LockFill from "src/icons/LockFill";
import Time from "src/icons/TimeLine";
import { PaymentStatus } from "src/types";
import { compareDateToNow, getFormattedDateToLocaleDateString } from "src/utils/date";

type Props = {
  status: PaymentStatusUnion;
  dates?: {
    processedAt?: string | null;
    unlockDate?: string | null;
  };
};

export type PaymentStatusType = components["schemas"]["RewardPageItemResponse"]["status"];
type PaymentStatusUnion = `${PaymentStatus}`;

export default function PayoutStatus({ status, dates }: Props) {
  const statuses: Record<PaymentStatusUnion, JSX.Element> = {
    [PaymentStatus.COMPLETE]: <CompleteTag date={dates?.processedAt} />,
    [PaymentStatus.LOCKED]: <LockedTag date={dates?.unlockDate} />,
    [PaymentStatus.PENDING_INVOICE]: <InvoiceNeededTag />,
    [PaymentStatus.PENDING_SIGNUP]: <PendingSignup />,
    [PaymentStatus.PROCESSING]: <ProcessingTag />,
    [PaymentStatus.MISSING_PAYOUT_INFO]: <PayoutInfoMissingTag />,
  };
  return statuses[status];
}

const CompleteTag = ({ date }: { date: string | null | undefined }) => {
  const { T } = useIntl();

  return (
    <Tag
      size={TagSize.Medium}
      {...withTooltip(
        T("reward.status.tooltip.processedOnDate", {
          date: date ? getFormattedDateToLocaleDateString(new Date(date)) : undefined,
        }),
        { className: "w-36" }
      )}
    >
      <CheckLine className="text-greyscale-50" />
      <span className="font-normal text-greyscale-50">{T("reward.status.complete")}</span>
    </Tag>
  );
};

const LockedTag = ({ date }: { date: string | null | undefined }) => {
  const { T } = useIntl();
  const dateRelativeToNow = compareDateToNow(date);
  let tooltipValue;

  switch (dateRelativeToNow.status) {
    case "past":
      tooltipValue = T("reward.status.tooltip.unlockedOnDate", {
        date: date ? getFormattedDateToLocaleDateString(new Date(date)) : undefined,
      });
      break;
    case "future":
      tooltipValue = T("reward.status.tooltip.lockedUntilDate", {
        date: date ? getFormattedDateToLocaleDateString(new Date(date)) : undefined,
      });
      break;
    case "invalid":
    case "today":
    default:
      tooltipValue = T("reward.status.tooltip.lockedUntilFurther");
  }

  return (
    <Tag size={TagSize.Medium} {...withTooltip(tooltipValue, { className: "w-36" })}>
      <LockFill className="text-greyscale-50" />
      <span className="font-normal text-greyscale-50">{T("reward.status.locked")}</span>
    </Tag>
  );
};

const ProcessingTag = () => {
  const { T } = useIntl();

  return (
    <Tag size={TagSize.Medium} {...withTooltip(T("reward.status.tooltip.processing"), { className: "w-44" })}>
      <Time className="text-greyscale-50" />
      <span className="font-normal text-greyscale-50">{T("reward.status.processing")}</span>
    </Tag>
  );
};

const PendingSignup = () => {
  const { T } = useIntl();

  return (
    <Tag size={TagSize.Medium} {...withTooltip(T("reward.status.tooltip.pending"), { className: "w-44" })}>
      <ErrorWarningLine className="text-pink-500" />
      <span className="font-normal text-greyscale-50">{T("reward.status.pendingSignup")}</span>
    </Tag>
  );
};

const InvoiceNeededTag = () => {
  const { T } = useIntl();

  return (
    <Tag
      size={TagSize.Medium}
      borderColor={TagBorderColor.MultiColor}
      {...withTooltip(T("reward.status.tooltip.invoicePending"), { className: "w-64" })}
    >
      <ErrorWarningLine className="text-pink-500" />
      <span className="whitespace-nowrap font-normal text-greyscale-50">{T("reward.status.invoicePending")}</span>
    </Tag>
  );
};

const PayoutInfoMissingTag = () => {
  const { T } = useIntl();

  return (
    <Tag
      size={TagSize.Medium}
      borderColor={TagBorderColor.Orange}
      {...withTooltip(T("reward.status.tooltip.payoutInfoMissing"), { className: "w-52" })}
    >
      <ErrorWarningLine className="text-orange-500" />
      <span className="whitespace-nowrap font-normal text-greyscale-50">{T("reward.status.payoutInfoMissing")}</span>
    </Tag>
  );
};