import Card from "src/components/Card";
import { useIntl } from "src/hooks/useIntl";

export default function Contributors() {
  const { T } = useIntl();
  return (
    <div className="flex flex-col gap-8 mt-3">
      <div className="text-3xl font-alfreda">{T("project.details.contributors.title")}</div>
      <div className="flex flex-row items-start gap-5">
        <div className="flex basis-1/4 flex-1">
          <Card>
            <div className="flex flex-col gap-3"></div>
          </Card>
        </div>
      </div>
    </div>
  );
}
