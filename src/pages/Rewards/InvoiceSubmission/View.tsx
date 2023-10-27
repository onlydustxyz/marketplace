import { SliderButton } from "@typeform/embed-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import Button, { Width } from "src/components/Button";
import Card from "src/components/Card";
import { MyRewardType } from "src/components/UserRewardTable/Line";
import config from "src/config";
import { useIntl } from "src/hooks/useIntl";
import Attachment2 from "src/icons/Attachment2";
import { formatDate } from "src/utils/date";
import { pretty } from "src/utils/id";
import { formatList } from "src/utils/list";
import { formatMoneyAmount } from "src/utils/money";
import { UserPayoutSettingsFragment } from "src/__generated/graphql";
import { MyPayoutInfoType, MyRewardsPendingInvoiceType } from ".";

type Props = {
  githubUserId: number;
  paymentRequests: MyRewardsPendingInvoiceType["rewards"];
  markInvoiceAsReceived: () => void;
  payoutInfo: MyPayoutInfoType;
};

export default function InvoiceSubmission({ paymentRequests, githubUserId, markInvoiceAsReceived, payoutInfo }: Props) {
  const { T } = useIntl();

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  const onSliderSubmit = useCallback(() => setIsSubmitted(true), []);
  const onSliderClose = useCallback(() => {
    setIsClosed(true);
  }, []);
  const hiddenFields = useMemo(
    () => buildHiddenFields({ paymentRequests: paymentRequests, githubUserId, payoutInfo }),
    [paymentRequests, githubUserId, payoutInfo]
  );

  useEffect(() => {
    if (isClosed && isSubmitted) {
      markInvoiceAsReceived();
      setIsClosed(false);
      setIsSubmitted(false);
    }
  }, [isClosed, isSubmitted, markInvoiceAsReceived]);

  return (
    <Card padded={false} className="px-6 py-5">
      <div className="flex flex-row gap-6">
        <div className="flex flex-1 flex-col gap-1 font-walsheim text-white">
          <span className="text-lg font-semibold">{T("invoiceSubmission.title")}</span>
          <span className="text-sm font-normal">{T("invoiceSubmission.text", { count: paymentRequests.length })}</span>
        </div>
        <MemoizedSlider onSubmit={onSliderSubmit} onClose={onSliderClose} hiddenFields={hiddenFields} />
      </div>
    </Card>
  );
}

interface SliderProps {
  onSubmit: () => void;
  onClose: () => void;
  hiddenFields: Record<string, string>;
}

function Slider({ onSubmit, onClose, hiddenFields }: SliderProps) {
  const { T } = useIntl();
  return (
    <SliderButton
      id="Eg67bRev"
      iframeProps={{ title: T("invoiceSubmission.sidePanel.title") }}
      opacity={100}
      autoClose={100}
      position="right"
      medium="snippet"
      hidden={hiddenFields}
      transitiveSearchParams={true}
      as="div"
      onSubmit={onSubmit}
      onClose={onClose}
    >
      <Button width={Width.Full}>
        <Attachment2 className="text-xl" />
        {T("invoiceSubmission.submitButton")}
      </Button>
    </SliderButton>
  );
}

const MemoizedSlider = memo(Slider);

export function buildHiddenFields({
  githubUserId,
  paymentRequests: paymentRequests,
  payoutInfo,
}: Omit<Props, "markInvoiceAsReceived">): Record<string, string> {
  return {
    github_id: githubUserId.toString(),
    request_ids: paymentRequests.map(p => p.id).join(","),
    pretty_requests: formatList(
      paymentRequests.map(
        p =>
          `#${pretty(p.id)} - ${formatDate(new Date(p.requestedAt))} (${formatMoneyAmount({
            amount: p.amount.total,
            currency: p.amount.currency,
          })})`
      )
    ),
    company_name: payoutInfo?.company?.name || "",
    company_number: payoutInfo?.company?.identificationNumber || "",
    first_name: payoutInfo?.company?.owner?.firstname || "",
    last_name: payoutInfo?.company?.owner?.lastname || "",
    street_address: payoutInfo?.location?.address || "",
    zip_code: payoutInfo?.location?.postalCode || "",
    city: payoutInfo?.location?.city || "",
    country: payoutInfo?.location?.country || "",
    payout_info: payoutInfo?.payoutSettings?.ethAddress?.startsWith("0x")
      ? `ETH Address: ${payoutInfo?.payoutSettings?.ethAddress}`
      : payoutInfo?.payoutSettings?.ethAddress
      ? `ENS Domain: ${payoutInfo?.payoutSettings?.ethAddress}`
      : formatList([
          `IBAN: ${payoutInfo?.payoutSettings?.sepaAccount?.iban}`,
          `BIC: ${payoutInfo?.payoutSettings?.sepaAccount?.bic}`,
        ]),
    total_amount: formatMoneyAmount({
      amount: paymentRequests.map(p => p.amount.total).reduce((acc, amount) => acc + amount, 0),
      currency: paymentRequests.at(0)?.amount.currency,
    }),
    env: config.ENVIRONMENT,
  };
}
