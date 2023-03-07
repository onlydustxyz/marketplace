import Card from "src/components/Card";
import ExternalLink from "src/components/ExternalLink";
import RoundedImage, { ImageSize, Rounding } from "src/components/RoundedImage";
import { useIntl } from "src/hooks/useIntl";
import isDefined from "src/utils/isDefined";
import { formatMoneyAmount } from "src/utils/money";
import { ProjectLeadFragment, SponsorFragment } from "src/__generated/graphql";
import ClickableUser from "./ClickableUser";
import Section, { SectionIcon } from "./Section";

interface Contributor {
  login: string;
  avatarUrl: string;
}

interface OverviewPanelViewProps {
  leads?: ProjectLeadFragment[];
  totalSpentAmountInUsd?: number;
  sponsors: SponsorFragment[];
  telegramLink: string | null;
  contributors: Contributor[];
}

export default function OverviewPanelView({
  leads,
  totalSpentAmountInUsd,
  sponsors,
  telegramLink,
  contributors,
}: OverviewPanelViewProps) {
  const { T } = useIntl();

  const projectLeads = leads?.filter(lead => isDefined(lead?.displayName)) || [];

  return (
    <Card className="h-fit p-0 flex flex-col shrink-0 w-80 divide-y divide-greyscale-50/8" padded={false}>
      {projectLeads.length > 0 && (
        <Section
          icon={SectionIcon.Star}
          title={T("project.details.overview.projectLeader", { count: projectLeads.length })}
        >
          <div className="flex flex-row flex-wrap gap-3">
            {projectLeads.map(lead => (
              <ClickableUser
                key={lead.displayName}
                name={lead.displayName}
                logoUrl={lead.avatarUrl}
                url={`https://github.com/${lead.displayName}`}
              />
            ))}
          </div>
        </Section>
      )}
      {contributors && contributors.length > 0 && (
        <Section
          icon={SectionIcon.User}
          title={T("project.details.overview.contributors", { count: contributors.length })}
        >
          <div className="flex flex-row items-center text-sm text-greyscale-50 font-normal gap-2">
            <div className="flex flex-row -space-x-1">
              {contributors.slice(0, 3).map(contributor => (
                <RoundedImage
                  key={contributor.login}
                  src={contributor.avatarUrl}
                  alt={contributor.login}
                  size={ImageSize.Xs}
                  rounding={Rounding.Circle}
                />
              ))}
            </div>
            <div>{contributors.length}</div>
          </div>
        </Section>
      )}
      {totalSpentAmountInUsd !== undefined && (
        <Section icon={SectionIcon.Funds} title={T("project.details.overview.totalSpentAmountInUsd")}>
          <div data-testid="money-granted-amount" className="text-sm text-greyscale-50 font-normal">
            {formatMoneyAmount(totalSpentAmountInUsd)}
          </div>
        </Section>
      )}
      {sponsors?.length > 0 && (
        <Section icon={SectionIcon.Service} title={T("project.details.overview.sponsors", { count: sponsors.length })}>
          <div data-testid="sponsors" className="flex flex-row flex-wrap gap-3">
            {sponsors.map(sponsor => (
              <ClickableUser key={sponsor.id} name={sponsor.name} logoUrl={sponsor.logoUrl} url={sponsor.url} />
            ))}
          </div>
        </Section>
      )}
      {telegramLink && (
        <Section icon={SectionIcon.Link} title={T("project.details.overview.moreInfo")}>
          <div data-testid="more-info-link" className="text-spacePurple-500 font-semibold text-sm">
            <ExternalLink text={telegramLink.replace(/^https?:\/\//i, "").replace(/\/$/, "")} url={telegramLink} />
          </div>
        </Section>
      )}
    </Card>
  );
}
