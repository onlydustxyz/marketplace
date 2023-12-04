import onlyDustLogo from "assets/img/onlydust-logo.png";
import { withTooltip } from "src/components/Tooltip";
import { useIntl } from "src/hooks/useIntl";
import { ContributorT } from "src/types";
import RoundedImage, { ImageSize, Rounding } from "src/components/RoundedImage";
import { cn } from "src/utils/cn";
import { useStackContributorProfile } from "src/App/Stacks";

type Props = {
  contributor: Pick<ContributorT, "login" | "avatarUrl" | "githubUserId" | "isRegistered">;
  clickable?: boolean;
  className?: string;
};

export default function Contributor({ className, contributor, clickable }: Props) {
  const { T } = useIntl();
  const [open] = useStackContributorProfile();

  return (
    <div
      className={cn("inline-flex flex-row items-center gap-2 truncate text-sm font-normal", className)}
      onClick={e => {
        if (clickable) {
          e.preventDefault();
          open({ githubUserId: contributor.githubUserId });
        }
      }}
    >
      {contributor.avatarUrl && (
        <RoundedImage
          alt={contributor.githubUserId.toString()}
          rounding={Rounding.Circle}
          size={ImageSize.Xs}
          src={contributor.avatarUrl}
        />
      )}
      <div
        className={cn({
          "truncate text-spacePurple-300 hover:cursor-pointer hover:underline": clickable,
        })}
      >
        {contributor.login}
      </div>
      {contributor.isRegistered && (
        <>
          <img
            id={`od-logo-${contributor.login}`}
            src={onlyDustLogo}
            className="mt-px h-3.5"
            {...withTooltip(T("contributor.table.userRegisteredTooltip"), { className: "w-36" })}
          />
        </>
      )}
    </div>
  );
}
