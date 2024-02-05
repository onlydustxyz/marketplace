"use client";

import { PropsWithChildren } from "react";
import { Autocomplete, TParams, Talkr, tr, useT } from "talkr";

import en_base from "src/translations/en.json";
import en_commons from "src/translations/v2/en/commons/commons.json";
import en_commons_enum from "src/translations/v2/en/commons/enums.json";
import en_features_banners from "src/translations/v2/en/features/banners.json";
import en_features_contributors from "src/translations/v2/en/features/contributors.json";
import en_features_ecosystems from "src/translations/v2/en/features/ecosystems.json";
import en_features from "src/translations/v2/en/features/features.json";
import en_features_filters from "src/translations/v2/en/features/filters.json";
import en_features_leaders from "src/translations/v2/en/features/leaders.json";
import en_projects from "src/translations/v2/en/pages/projects.json";

const en = {
  ...en_base,
  v2: {
    commons: {
      ...en_commons,
      enums: en_commons_enum,
    },
    features: {
      ...en_features,
      filters: en_features_filters,
      banners: en_features_banners,
      contributors: en_features_contributors,
      leaders: en_features_leaders,
      ecosystems: en_features_ecosystems,
    },
    pages: {
      projects: en_projects,
    },
  },
};

export type Key = Autocomplete<typeof en>;

export const IntlProvider = ({ children }: PropsWithChildren) => (
  <Talkr languages={{ en }} defaultLanguage="en">
    {children}
  </Talkr>
);

export const useIntl = () => {
  const { locale, setLocale, languages, defaultLanguage } = useT();
  return {
    setLocale,
    locale,
    T: (key: Key, params?: TParams) => tr({ locale, languages, defaultLanguage }, key, params),
  };
};
