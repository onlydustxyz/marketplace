import { Link, generatePath } from "react-router-dom";
import { RoutePaths } from "src/App";
import InfoIcon from "src/assets/icons/InfoIcon";
import Button, { ButtonSize, ButtonType } from "src/components/Button";
import { useIntl } from "src/hooks/useIntl";

export function MissingGithubAppInstallBanner({ slug = "" }: { slug: string }) {
  const { T } = useIntl();

  return (
    <div className="flex items-center justify-between gap-12 rounded-xl border border-orange-500 bg-orange-900 p-3">
      <div className="flex items-center justify-between gap-4">
        <div className="rounded-lg bg-card-background-heavy p-2 text-orange-500">
          <InfoIcon className="h-5 w-5" />
        </div>
        <div className="font-walsheim text-white">
          <p className="mb-1 text-sm font-medium">{T("project.details.banners.missingGithubAppInstall.message")}</p>
          <ul className="list-inside list-disc text-xs">
            <li>test</li>
            <li>test</li>
          </ul>
        </div>
      </div>

      <Link to={generatePath(RoutePaths.ProjectDetailsEditRepos, { projectKey: slug })}>
        <Button size={ButtonSize.Sm} type={ButtonType.Secondary}>
          {T("project.details.banners.missingGithubAppInstall.button")}
        </Button>
      </Link>
    </div>
  );
}
