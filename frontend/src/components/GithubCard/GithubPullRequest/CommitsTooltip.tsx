import { useIntl } from "src/hooks/useIntl";
import RoundedImage, { ImageSize, Rounding } from "src/components/RoundedImage";
import { GithubPullRequestWithCommitsFragment } from "src/__generated/graphql";

type CommitsTooltipProps = {
  pullRequest: GithubPullRequestWithCommitsFragment;
  userCommits: number;
  commitsCount: number;
};

export function CommitsTooltip({ pullRequest, userCommits, commitsCount }: CommitsTooltipProps) {
  const { T } = useIntl();

  return (
    <div className="flex flex-col">
      <span className="text-xs text-greyscale-200">
        {T("reward.form.contributions.pullRequests.tooltip.createdBy")}

        {pullRequest.htmlUrl ? (
          <a
            className="inline-flex text-xs text-spacePurple-400 hover:text-spacePurple-200"
            href={pullRequest?.author?.htmlUrl ?? ""}
            target="_blank"
            rel="noreferrer"
          >
            <span className="px-1">{pullRequest.author?.login}</span>

            {pullRequest.author?.avatarUrl ? (
              <RoundedImage
                alt={pullRequest.author.id.toString()}
                rounding={Rounding.Circle}
                size={ImageSize.Xxs}
                src={pullRequest.author?.avatarUrl}
              />
            ) : null}
          </a>
        ) : null}
      </span>

      <span className="text-sm">
        {T("githubCodeReview.tooltip.commits", {
          user: pullRequest.contributorDetails[0].author?.login,
          commits: userCommits + "/" + commitsCount,
          count: commitsCount,
        })}
      </span>
    </div>
  );
}
