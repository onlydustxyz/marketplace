import { PropsWithChildren } from "react";
import { TSelectAutocomplete } from "components/ds/Filters/select-autocomplete/select-autocomplete.types";

export namespace TFiltersRepos {
  export interface Props {
    repos: TSelectAutocomplete.Item[];
    selected: TSelectAutocomplete.Item[];
    onChange: (repos: TSelectAutocomplete.Item[]) => void;
  }
}
