import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { RoutePaths } from "src/App";
import { useImpersonation } from "../../../components/features/impersonation/use-impersonation.tsx";
import { useIntl } from "src/hooks/useIntl.tsx";
import MeApi from "src/api/me/index.ts";
import { getGithubUserIdFromSub } from "components/features/auth0/utils/getGithubUserIdFromSub.util.ts";
import Loader from "src/components/Loader/index.tsx";

const ImpersonationPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { T } = useIntl();
  const { isImpersonating, getImpersonateClaim, setImpersonateClaim, clearImpersonateClaim } = useImpersonation();
  const impersonateClaims = getImpersonateClaim();
  const { data: userInfo, isLoading, isError } = MeApi.queries.useGetMe({ options: { retry: 1 } });
  const [isValidImpersonation, setIsValidImpersonation] = useState(false);

  useEffect(() => {
    if (!userId) {
      navigate(RoutePaths.Projects);
    } else {
      setImpersonateClaim({ sub: `github|${userId}` });
      const claimedGithubUserId = getGithubUserIdFromSub(impersonateClaims?.sub);

      if (isError) {
        setIsValidImpersonation(false);
        clearImpersonateClaim();
        navigate(RoutePaths.NotFound);
      }

      if (userInfo && !isLoading) {
        const isValidImpersonation = isImpersonating && userInfo?.githubUserId === claimedGithubUserId;
        setIsValidImpersonation(isValidImpersonation);
        if (isValidImpersonation) {
          navigate(RoutePaths.Projects);
        } else {
          clearImpersonateClaim();
          navigate(RoutePaths.NotFound);
        }
      }
    }
  }, [userId, userInfo, isLoading, isImpersonating, impersonateClaims]);

  if (isLoading) {
    return <Loader />;
  }

  return <Link to={RoutePaths.Projects}>{T("impersonation.backToProjects")}</Link>;
};

export default ImpersonationPage;
