import { format } from "date-fns";
import { useMemo } from "react";

import { ProfileItemGrid } from "app/migration/settings/billing/component/profile-item-grid/profile-item-grid";
import { ProfileItem } from "app/migration/settings/billing/component/profile-item/profile-item";

import { Translate } from "components/layout/translate/translate";

import { TProfileIndividual } from "./profile-individual.types";

export function ProfileIndividual({ profile }: TProfileIndividual.Props) {
  const birthdate = useMemo(() => {
    if (profile.birthdate) {
      return format(new Date(profile.birthdate), "MMM dd, yyyy");
    }
    return profile.birthdate;
  }, [profile]);

  const validUntil = useMemo(() => {
    if (profile.validUntil) {
      return format(new Date(profile.validUntil), "yyyy-MM-dd");
    }
    return profile.validUntil;
  }, [profile]);

  return (
    <ProfileItemGrid>
      <ProfileItem label="v2.pages.settings.billing.individual.firstName">{profile.firstName}</ProfileItem>
      <ProfileItem label="v2.pages.settings.billing.individual.lastName">{profile.lastName}</ProfileItem>
      <ProfileItem label="v2.pages.settings.billing.individual.birthdate">{birthdate}</ProfileItem>
      <ProfileItem label="v2.pages.settings.billing.individual.address">{profile.address}</ProfileItem>
      <ProfileItem label="v2.pages.settings.billing.individual.country">{profile.country}</ProfileItem>
      <ProfileItem label="v2.pages.settings.billing.individual.usCitizen">
        {profile.usCitizen ? (
          <Translate token="v2.pages.settings.billing.format.boolean.yes" />
        ) : (
          <Translate token="v2.pages.settings.billing.format.boolean.no" />
        )}
      </ProfileItem>
      <ProfileItem label="v2.pages.settings.billing.individual.identityDocumentType">
        {profile.idDocumentType ? (
          <>
            <Translate token={`v2.commons.enums.me.idDocumentType.${profile.idDocumentType}`} />
            {profile.idDocumentCountryCode ? (
              <span className="uppercase">&nbsp;({profile.idDocumentCountryCode})</span>
            ) : null}
          </>
        ) : null}
      </ProfileItem>
      <ProfileItem label="v2.pages.settings.billing.individual.validUntil">{validUntil}</ProfileItem>
    </ProfileItemGrid>
  );
}
