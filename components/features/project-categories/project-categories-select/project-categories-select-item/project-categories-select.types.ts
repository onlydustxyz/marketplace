import { TSelectAutocomplete } from "components/ds/form/select-autocomplete/select-autocomplete.types";

export namespace TProjectCategoriesSelectItem {
  export interface Props extends TSelectAutocomplete.Item {
    onRemove: (id: string | number) => void;
  }
}
