import RainbowBanner from "src/components/New/Banners/RainbowBanner";
import { useIntl } from "src/hooks/useIntl";
import LoaderTwo from "src/icons/LoaderTwo";
import dayjs from "dayjs";

type StillFetchingBannerProps = {
  createdAt: string;
};

const shouldDisplayBanner = (createdAt: string): boolean => {
  return dayjs().isBefore(dayjs(createdAt).add(10, "minute"));
};

export default function StillFetchingBanner({ createdAt }: StillFetchingBannerProps) {
  const { T } = useIntl();
  const canDisplay = shouldDisplayBanner(createdAt);

  if (!createdAt) {
    return null;
  }

  if (!canDisplay) {
    return null;
  }

  return (
    <RainbowBanner
      icon={<LoaderTwo className="text-xl font-normal text-white" />}
      description={T("project.stillFetching")}
    />
  );
}
