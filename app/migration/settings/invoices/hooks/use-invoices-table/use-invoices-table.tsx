import { InvoiceStatus } from "app/migration/settings/invoices/features/invoice-status/invoice-status";
import { TInvoiceTable } from "app/migration/settings/invoices/hooks/use-invoices-table/use-invoices-table.types";

import { components } from "src/__generated/api";
import { Spinner } from "src/components/Spinner/Spinner";
import Cell, { CellHeight } from "src/components/Table/Cell";
import Line from "src/components/Table/Line";
import { useIntl } from "src/hooks/useIntl";
import { getFormattedDateToLocaleDateString } from "src/utils/date";
import { formatAmount } from "src/utils/money";

import { Button } from "components/ds/button/button";
import { SkeletonEl } from "components/ds/skeleton/skeleton";
import { Icon } from "components/layout/icon/icon";

export function useInvoicesTable({ onDownloadInvoice, isDownloading }: TInvoiceTable.Props) {
  const { T } = useIntl();

  const headerCells: TInvoiceTable.HeaderCell[] = [
    {
      icon: <span>#</span>,
      label: T("v2.pages.settings.invoices.table.headerCells.id"),
    },
    {
      icon: <Icon remixName={"ri-calendar-event-line"} size={16} />,
      label: T("v2.pages.settings.invoices.table.headerCells.date"),
    },
    {
      icon: <Icon remixName={"ri-money-dollar-circle-line"} size={16} />,
      label: T("v2.pages.settings.invoices.table.headerCells.amount"),
    },
    {
      icon: <Icon remixName={"ri-loader-2-line"} size={16} />,
      label: T("v2.pages.settings.invoices.table.headerCells.status"),
    },
    {
      icon: isDownloading ? (
        <div className="flex w-full justify-end p-2.5">
          <Spinner />
        </div>
      ) : (
        <div />
      ),
      label: "",
    },
  ];

  function bodyRow(invoice?: components["schemas"]["BillingProfileInvoicesPageItemResponse"]) {
    if (!invoice) return null;

    const { id, number, createdAt, totalAfterTax, status } = invoice;

    return (
      <Line key={id} className="group border-card-border-light">
        <Cell height={CellHeight.Compact}>{number?.split("-").pop()}</Cell>
        <Cell height={CellHeight.Compact}>
          {createdAt ? getFormattedDateToLocaleDateString(new Date(createdAt)) : null}
        </Cell>
        <Cell height={CellHeight.Compact}>
          {formatAmount({ amount: totalAfterTax?.amount, currency: totalAfterTax?.currency })}
        </Cell>

        <Cell height={CellHeight.Compact}>
          <InvoiceStatus status={status} />
        </Cell>
        <Cell height={CellHeight.Compact} className="justify-end">
          {id ? (
            <Button
              variant="tertiary"
              onClick={() => onDownloadInvoice({ invoiceId: id, number })}
              disabled={!id || isDownloading}
              iconOnly
              className="text-spacePurple-400"
            >
              <Icon remixName="ri-download-cloud-line" size={20} />
            </Button>
          ) : null}
        </Cell>
      </Line>
    );
  }

  function bodyRowLoading() {
    const line = () => (
      <tr>
        <td className="py-2">
          <SkeletonEl width="40%" height="16px" variant="text" color="blue" />
        </td>
        <td className="py-2">
          <SkeletonEl width="50%" height="16px" variant="text" color="blue" />
        </td>
        <td className="py-2">
          <SkeletonEl width="30%" height="16px" variant="text" color="blue" />
        </td>
        <td className="py-2">
          <SkeletonEl width="60%" height="16px" variant="text" color="blue" />
        </td>
        <td className="py-2">
          <SkeletonEl className="m-auto" width="20%" height="16px" variant="circular" color="blue" />
        </td>
      </tr>
    );

    return [line(), line(), line(), line(), line()];
  }

  return { headerCells, bodyRow, bodyRowLoading };
}
