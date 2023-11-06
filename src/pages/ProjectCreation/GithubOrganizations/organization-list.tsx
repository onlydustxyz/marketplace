import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { components } from "src/__generated/api";
import Button, { ButtonSize, ButtonType } from "src/components/Button";
import Card from "src/components/Card";
import RoundedImage, { ImageSize, Rounding } from "src/components/RoundedImage";
import { ApiResourcePaths } from "src/hooks/useRestfulData/config";
import { useRestfulData } from "src/hooks/useRestfulData/useRestfulData";
import { useSessionStorage } from "src/hooks/useSessionStorage/useSessionStorage";
import CloseLine from "src/icons/CloseLine";
import PencilLine from "src/icons/PencilLine";

type ExtendedInstallationResponse = components["schemas"]["InstallationResponse"] & {
  organization: {
    installationId: string;
  };
};

function isOrganizationAlreadyExist(
  organizations: ExtendedInstallationResponse[],
  newOrganization: ExtendedInstallationResponse
) {
  return organizations.some(org => org?.organization?.name === newOrganization?.organization?.name);
}

export default function OrganizationList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const installation_id = searchParams.get("installation_id") ?? "";
  const [savedOrgsData, setSavedOrgsData, savedOrgsDataStatus] = useSessionStorage<ExtendedInstallationResponse[]>(
    "OrganizationsType",
    []
  );

  const { data, isLoading, isError } = useRestfulData<ExtendedInstallationResponse>({
    resourcePath: ApiResourcePaths.GET_INSTALLED_GITHUB_ORGANIZATION,
    pathParam: installation_id,
    method: "GET",
    enabled: !!installation_id,
    retry: 1,
  });

  useEffect(() => {
    if (data && savedOrgsDataStatus === "getted" && !isOrganizationAlreadyExist(savedOrgsData, data)) {
      const newData: ExtendedInstallationResponse = {
        ...data,
        organization: {
          ...data.organization,
          installationId: installation_id,
        },
      };
      setSavedOrgsData([...savedOrgsData, newData]);
    }
  }, [data, savedOrgsDataStatus]);

  // if (!installation_id) {
  //   return <div>Installation id is missing</div>;
  // }

  if (isLoading) {
    // TODO Replace with skeleton component
    return <div>Loading ...</div>;
  }

  if (isError) {
    // TODO Replace with error component
    return <div>Something went wrong!</div>;
  }

  return (
    <div>
      <h2 className="font-medium">
        INSTALLED ON {savedOrgsData?.length} ORGANANISATION{savedOrgsData?.length > 1 ? "S" : ""} :
      </h2>
      <ul className="flex flex-col gap-2 py-4 pb-6">
        {savedOrgsData?.map((installation: components["schemas"]["InstallationResponse"], index: number) => (
          <Card className="shadow-medium" key={installation?.organization?.name}>
            <div key={index} className="flex items-center gap-3 ">
              <RoundedImage
                src={installation?.organization?.logoUrl ?? ""}
                alt={installation?.organization?.name ?? ""}
                rounding={Rounding.Corners}
                size={ImageSize.Md}
              />
              <li key={index} className="flex-1">{installation?.organization?.name}</li>
              <a href={`https://github.com/settings/installations/${installation?.organization?.installationId}`} target="blank">
              <Button
                size={ButtonSize.Sm}
                type={ButtonType.Secondary}
                iconOnly
                data-testid="close-add-work-item-panel-btn"
              >
                <PencilLine />
              </Button>
              </a>
            </div>
          </Card>
        ))}
      </ul>
    </div>
  );
}
