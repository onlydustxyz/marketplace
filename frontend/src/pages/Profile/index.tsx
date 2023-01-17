import { gql, QueryResult } from "@apollo/client";
import { useHasuraQuery } from "src/hooks/useHasuraQuery";
import { useAuth } from "src/hooks/useAuth";
import { HasuraUserRole } from "src/types";
import QueryWrapper from "src/components/QueryWrapper";
import ProfileForm from "./components/ProfileForm";
import { ProfileQuery } from "src/__generated/graphql";
import InfoMissingBanner from "./components/InfoMissingBanner";
import { useIntl } from "src/hooks/useIntl";
import { useNavigate, useLocation } from "react-router-dom";
import { RoutePaths } from "src/App";

const Profile: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const { T } = useIntl();
  const getProfileQuery = useHasuraQuery<ProfileQuery>(GET_PROFILE_QUERY, HasuraUserRole.RegisteredUser, {
    skip: !isLoggedIn,
    fetchPolicy: "network-only",
  });

  const navigate = useNavigate();
  const location = useLocation();

  const navigateBack = () => {
    navigate(location.state?.prev || RoutePaths.ProjectDetails);
  };

  return (
    <div className="bg-space h-full">
      <div className="px-8 pt-16 h-full w-full">
        <div className="flex mb-6 items-center">
          <span className="text-3xl font-belwe font-normal w-full">{T("profile.edit")}</span>
          <div className="flex flex-col gap-6">
            <div className="flex space-x-6">
              <button
                type="button"
                className="bg-white/5 backdrop-blur-4xl text-base text-neutral-50 border-neutral-50 whitespace-nowrap border px-6 py-4 rounded-xl font-semibold"
                onClick={navigateBack}
              >
                {T("profile.form.cancel")}
              </button>
              <button
                type="submit"
                form="profile-form"
                className="bg-neutral-50 text-base text-slate-900 whitespace-nowrap border-2 px-6 py-4 rounded-xl font-semibold shadow-inner"
              >
                {T("profile.form.send")}
              </button>
            </div>
          </div>
          {getProfileQuery.data && (
            <QueryWrapper query={getProfileQuery}>
              {isPaymentInfoMissing(getProfileQuery) && <InfoMissingBanner />}
              {getProfileQuery.data && <ProfileForm user={getProfileQuery.data.userInfo[0]} />}
            </QueryWrapper>
          )}
        </div>
      </div>
    </div>
  );
};

function isPaymentInfoMissing(queryResult: QueryResult<ProfileQuery>) {
  const payoutSettings = queryResult?.data?.userInfo?.[0]?.payoutSettings;
  return (
    queryResult?.data &&
    !(
      payoutSettings?.EthTransfer?.Address ||
      payoutSettings?.EthTransfer?.Name ||
      (payoutSettings?.WireTransfer?.IBAN && payoutSettings?.WireTransfer?.BIC)
    )
  );
}

export const GET_PROFILE_QUERY = gql`
  query Profile {
    userInfo {
      userId
      identity
      email
      location
      payoutSettings
    }
  }
`;

export default Profile;
