import { bootstrap } from "core/bootstrap";
import { mapApiToClass } from "core/infrastructure/marketplace-api-client-adapter/mappers/map-api-to-class";

import { components } from "src/__generated/api";

type HackathonsDetailsResponse = components["schemas"]["HackathonsDetailsResponse"];

export type HackathonStatus = "live" | "open" | "closed";

interface HackathonInterface extends HackathonsDetailsResponse {
  isComingSoon: boolean;
  isLive: boolean;
  isPast: boolean;
  status: HackathonStatus;
}

export class Hackathon extends mapApiToClass<HackathonsDetailsResponse>() implements HackathonInterface {
  constructor(readonly props: HackathonsDetailsResponse) {
    super(props);
  }

  get isComingSoon() {
    return bootstrap.getDateHelperPort().isFuture(new Date(this.startDate));
  }

  get isLive() {
    return (
      bootstrap.getDateHelperPort().isPast(new Date(this.startDate)) &&
      bootstrap.getDateHelperPort().isFuture(new Date(this.endDate))
    );
  }

  get isPast() {
    return bootstrap.getDateHelperPort().isPast(new Date(this.endDate));
  }

  get status() {
    if (this.isLive) {
      return "live";
    }

    if (this.isComingSoon) {
      return "open";
    }

    return "closed";
  }
}