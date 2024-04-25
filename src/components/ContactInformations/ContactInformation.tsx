import { ReactElement } from "react";
import { RegisterOptions, useFormContext } from "react-hook-form";

import Input, { Size } from "src/components/FormInput";
import { withTooltip } from "src/components/Tooltip";
import CloseLine from "src/icons/CloseLine";
import EyeLine from "src/icons/EyeLine";
import EyeOffLine from "src/icons/EyeOffLine";
import { cn } from "src/utils/cn";

import { useIntl } from "hooks/translate/use-translate";

type Props = {
  icon: ReactElement;
  name: string;
  errorName?: string;
  placeholder?: string;
  editDisabled?: boolean;
  visibilityName: string;
  visibilityDisabled?: boolean;
  options?: RegisterOptions;
};

export default function ContactInformation({
  icon,
  name,
  errorName,
  placeholder,
  editDisabled,
  visibilityName,
  visibilityDisabled,
  options,
}: Props) {
  const { watch } = useFormContext();
  const value = watch(name);
  const { T } = useIntl();

  return (
    <Input
      size={Size.Sm}
      withMargin={false}
      name={name}
      errorName={errorName}
      placeholder={placeholder}
      options={
        options ?? {
          pattern: { value: /^[^/]*$/, message: T("profile.form.contactInfo.error", { channel: placeholder }) },
        }
      }
      prefixComponent={icon}
      suffixComponent={
        value ? (
          <div className="absolute right-3 flex flex-row gap-2">
            <VisibilityButton name={visibilityName} disabled={visibilityDisabled} />
            <ClearFieldButton name={name} disabled={editDisabled} />
          </div>
        ) : undefined
      }
      inputClassName="pl-9 pr-14"
      disabled={editDisabled}
    />
  );
}

type CloseButtonProps = {
  name: string;
  disabled?: boolean;
};

function ClearFieldButton({ name, disabled }: CloseButtonProps) {
  const { setValue } = useFormContext();
  return (
    <CloseLine
      className={cn({
        "text-greyscale-600": disabled,
        "cursor-pointer": !disabled,
      })}
      onClick={() => {
        if (!disabled) {
          setValue(name, "", { shouldDirty: true });
        }
      }}
    />
  );
}

type VisibilityButtonProps = {
  name: string;
  disabled?: boolean;
};

function VisibilityButton({ name, disabled }: VisibilityButtonProps) {
  const { watch, setValue } = useFormContext();
  const visible = watch(name);
  const { T } = useIntl();

  return visible ? (
    <EyeLine
      className={cn({
        "text-spacePurple-200/50": disabled,
        "cursor-pointer text-spacePurple-200": !disabled,
      })}
      onClick={() => {
        if (!disabled) {
          setValue(name, false, { shouldDirty: true });
        }
      }}
      {...withTooltip(T("profile.form.contactInfo.visibleTootlip"))}
      data-testid="visibilityToggle"
      data-state="on"
    />
  ) : (
    <EyeOffLine
      className={cn({
        "text-greyscale-600": disabled,
        "cursor-pointer": !disabled,
      })}
      onClick={() => {
        if (!disabled) {
          setValue(name, true, { shouldDirty: true });
        }
      }}
      {...withTooltip(T("profile.form.contactInfo.hiddenTootlip"))}
      data-testid="visibilityToggle"
      data-state="off"
    />
  );
}
