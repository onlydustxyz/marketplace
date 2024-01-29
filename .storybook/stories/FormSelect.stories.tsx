import { Size } from "src/components/FormSelect";
import FormSelect from "src/components/FormSelect/View";
import DraftLine from "src/icons/DraftLine";
import ExchangeDollarLine from "src/icons/ExchangeDollarLine";
import MoreLine from "src/icons/MoreLine";
import TeamLine from "src/icons/TeamLine";

export default {
  title: "FormSelect",
  component: FormSelect,
};

const workKinds = [
  { icon: <DraftLine />, label: "Documentation" },
  { icon: <TeamLine />, label: "Meeting" },
  { icon: <ExchangeDollarLine />, label: "Subscription" },
  { icon: <MoreLine />, label: "Other" },
];

export const Default = {
  render: () => (
    <FormSelect
      value={workKinds[0].label}
      options={workKinds}
      size={Size.Md}
      onChange={() => {
        return;
      }}
    />
  ),
};
