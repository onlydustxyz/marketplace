import { Helmet } from "react-helmet";

type Props = {
  title?: string;
  description?: string;
  route?: string;
};

const DEFAULT_TITLE = "OnlyDust — Forge your developer legacy";
export default function SEO({ title = DEFAULT_TITLE }: Props) {
  return (
    <Helmet>
      <title>{title}</title>
    </Helmet>
  );
}
