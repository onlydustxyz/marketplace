"use client";

import { withAuthenticationRequired } from "@auth0/auth0-react";

import { withLeadRequired } from "components/features/auth0/guards/lead-guard";

function ContributionPage() {
  return <div>ContributionPage</div>;
}

export default withAuthenticationRequired(withLeadRequired(ContributionPage));
