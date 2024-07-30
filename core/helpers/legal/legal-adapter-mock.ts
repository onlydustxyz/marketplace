import { LegalFacadePort } from "core/helpers/legal/legal-facade-port";

export class LegalAdapterMock implements LegalFacadePort {
  urls = {
    terms: "https://od-legals-production.s3.eu-west-1.amazonaws.com/terms-and-conditions.pdf",
    privacy: "https://od-legals-production.s3.eu-west-1.amazonaws.com/privacy-policy.pdf",
  };

  getTermsAndConditionsUrl() {
    return this.urls.terms;
  }

  getPrivacyPolicyUrl() {
    return this.urls.privacy;
  }
}
