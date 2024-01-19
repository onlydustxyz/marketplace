import { Button } from "components/ds/button/button";
import { Translate } from "components/layout/translate/translate";
import { Typography } from "components/layout/typography/typography";
import Image from "next/image";
import { Key } from "src/hooks/useIntl";
import { ElementType } from "react";

interface Token {
  token: Key;
  params?: Record<string, string>;
}
interface EmptyStateProps {
  as?: ElementType;
  illustrationSrc: string;
  title: Token;
  description?: Token;
  actionLabel?: Token;
  onAction?: () => void;
}

export function EmptyState({
  as = "section",
  illustrationSrc,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const Component = as;
  return (
    <Component className="flex flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="w-20">
        <Image src={illustrationSrc} width={80} height={80} alt="Empty state picture" />
      </div>
      <div>
        <Typography
          variant="title-l"
          className="mb-1 font-belwe"
          translate={{ token: title?.token, params: title?.params }}
        />
        {description?.token ? (
          <Typography
            variant="body-s"
            className="font-walsheim text-spaceBlue-200"
            translate={{ token: description?.token, params: description?.params }}
          />
        ) : null}
      </div>
      {actionLabel?.token ? (
        <Button size="m" className="whitespace-nowrap" variant="primary" accentColor="orange" onClick={onAction}>
          <Translate token={actionLabel?.token} />
        </Button>
      ) : null}
    </Component>
  );
}
