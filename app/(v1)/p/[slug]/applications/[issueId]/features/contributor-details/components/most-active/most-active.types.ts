import { TDotsStatus } from "app/(v1)/u/[githubLogin]/components/dots-status/dots-status.types";

export namespace TMostActive {
  export interface Props {
    logoUrl: string;
    name: string;
    status: TDotsStatus.Props["status"];
  }
}
