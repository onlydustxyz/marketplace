import { useT } from "talkr";
import { useMediaQuery } from "usehooks-ts";

import Button, { ButtonSize } from "src/components/Button";
import { viewportConfig } from "src/config";
import CheckLine from "src/icons/CheckLine";
import { cn } from "src/utils/cn";

export enum CalloutSizes {
  Small,
  Medium,
  Large,
}

const ButtonsSizes = {
  [CalloutSizes.Small]: ButtonSize.Sm,
  [CalloutSizes.Medium]: ButtonSize.Md,
  [CalloutSizes.Large]: ButtonSize.LgLowHeight,
};

interface ProjectLeadInvitationProps {
  projectName?: string | null;
  isLoading?: boolean;
  size?: CalloutSizes;
  btnLabel?: string;
  onClick?: () => void;
}

export default function ProjectLeadInvitationView({
  projectName,
  size = CalloutSizes.Small,
  btnLabel,
  onClick,
  isLoading,
}: ProjectLeadInvitationProps) {
  const { T } = useT();
  const isMd = useMediaQuery(`(min-width: ${viewportConfig.breakpoints.md}px)`);

  return (
    <div
      className={cn(
        "relative flex flex-row items-center justify-between gap-5 overflow-hidden rounded-xl text-center font-medium sm:flex-row",
        "bg-rainbow animate-wave after:pointer-events-none after:absolute after:h-full after:w-full after:bg-noise-light",
        {
          "min-h-[60px] p-3": size === CalloutSizes.Small,
          "min-h-[80px] p-4": size === CalloutSizes.Medium,
          "min-h-[96px] p-5": size === CalloutSizes.Large,
        }
      )}
    >
      <div
        className={cn("flex flex-1 text-left font-walsheim text-base md:flex-auto", {
          "text-sm": size === CalloutSizes.Small,
          "text-md": size === CalloutSizes.Medium,
          "text-lg": size === CalloutSizes.Large,
        })}
      >
        {projectName ? T("projectLeadInvitation.prompt", { projectName }) : T("project.projectLeadInvitation.prompt")}
      </div>
      <Button
        size={ButtonsSizes[size]}
        onClick={onClick}
        data-testid="accept-invite-button flex-1 md:flex-auto"
        disabled={isLoading}
      >
        {size === CalloutSizes.Large ? <CheckLine className="text-xl font-normal text-black" /> : null}
        {btnLabel ? (
          btnLabel
        ) : (
          <div>{T(isMd ? "projectLeadInvitation.accept" : "projectLeadInvitation.acceptShort")}</div>
        )}
      </Button>
    </div>
  );
}
