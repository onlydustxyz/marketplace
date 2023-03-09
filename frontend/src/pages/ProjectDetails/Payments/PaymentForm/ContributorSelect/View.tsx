import { Transition } from "@headlessui/react";
import { ChangeEventHandler, useCallback, useState } from "react";
import Card from "src/components/Card";
import Contributor from "src/components/Contributor";
import Input from "src/components/FormInput";
import ImageCard, { BackgroundSize } from "src/components/ImageCard";
import headerElementBackground from "src/assets/img/alert-bg.png";
import RoundedImage, { ImageSize } from "src/components/RoundedImage";
import { useIntl } from "src/hooks/useIntl";
import { GithubContributorFragment } from "src/__generated/graphql";
import classNames from "classnames";
import ErrorWarningLine from "src/icons/ErrorWarningLine";
import User3Line from "src/icons/User3Line";
import ArrowDownSLine from "src/icons/ArrowDownSLine";

type Props = {
  loading: boolean;
  onContributorHandleChange: (handle: string) => void;
  validateContributorLogin: () => boolean | string;
  contributors: GithubContributorFragment[];
  contributor?: GithubContributorFragment;
};

const View = ({ loading, contributor, contributors, onContributorHandleChange, validateContributorLogin }: Props) => {
  const { T } = useIntl();
  const onHandleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    event => {
      onContributorHandleChange(event.target.value);
    },
    [onContributorHandleChange]
  );
  const onContributorChange = useCallback(
    (contributor: GithubContributorFragment) => {
      onContributorHandleChange(contributor.login);
    },
    [onContributorHandleChange]
  );
  const [opened, setOpened] = useState(false);

  const prefixComponent =
    contributor && !loading ? (
      <RoundedImage src={contributor.avatarUrl} size={ImageSize.Sm} alt={contributor.login} />
    ) : (
      <User3Line className="ml-2" />
    );

  return (
    <div className="w-full z-10">
      <div className="relative">
        <Input
          inputClassName="pl-12"
          name="contributorHandle"
          placeholder={T("payment.form.contributor.placeholder")}
          options={{
            required: T("form.required"),
            validate: validateContributorLogin,
          }}
          onChange={onHandleChange}
          onFocus={() => setOpened(true)}
          onBlur={() => setOpened(false)}
          loading={loading}
          prefixComponent={prefixComponent}
          suffixComponent={<ArrowDownSLine className="absolute text-2xl right-0 pr-4 text-spaceBlue-200" />}
        />

        <Transition
          className="absolute w-full"
          show={opened}
          enter="transition duration-200 ease-out"
          enterFrom="transform -translate-y-1/3 opacity-0"
          enterTo="transform translate-y-0 opacity-100"
          leave="transition duration-200 ease-out"
          leaveFrom="transform translate-y-0 opacity-100"
          leaveTo="transform -translate-y-1/3 opacity-0"
        >
          <Card className="bg-spaceBlue-900 pr-1" padded={false}>
            <div
              className={classNames(
                "overflow-auto max-h-60",
                "scrollbar-thin scrollbar-w-1.5 scrollbar-thumb-spaceBlue-500 scrollbar-thumb-rounded"
              )}
            >
              {contributors.map(contributor => (
                <div
                  key={contributor.id}
                  className="px-4 py-3 hover:bg-white/2 cursor-pointer"
                  onMouseDown={() => onContributorChange(contributor)}
                >
                  <Contributor
                    contributor={{
                      avatarUrl: contributor.avatarUrl,
                      login: contributor.login,
                      isRegistered: !!contributor.user?.userId,
                    }}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Transition>
      </div>
      {contributor && !contributor.user && (
        <div className="h-22 mb-4">
          <ImageCard backgroundImageUrl={headerElementBackground} backgroundSize={BackgroundSize.Cover}>
            <div className="flex flex-row justify-between py-5 px-6">
              <div className="flex flex-row justify-start items-center font-medium gap-4">
                <ErrorWarningLine className="px-3 py-2.5 text-3xl rounded-2xl bg-white/10" />
                <div className="flex flex-col ">
                  <div className="text-lg font-medium">
                    {T("payment.form.contributor.needsToSignup", { contributor: contributor.login })}
                  </div>
                </div>
              </div>
            </div>
          </ImageCard>
        </div>
      )}
    </div>
  );
};

export default View;
