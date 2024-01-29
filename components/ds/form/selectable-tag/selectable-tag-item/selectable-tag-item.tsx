import { cn } from "src/utils/cn";
import { selectableTagItemVariants } from "components/ds/form/selectable-tag/selectable-tag-item/selectable-tag-item.variants";
import { TSelectableTagItem } from "components/ds/form/selectable-tag/selectable-tag-item/selectable-tag-item.types";
import { useCheckbox, VisuallyHidden } from "@nextui-org/react";
import { useMemo } from "react";

export function SelectableTagItem<V extends string>({
  value,
  className,
  children,
  checkboxProps = {},
  icon,
  activeIcon,
  active,
  disabled,
  ...props
}: TSelectableTagItem.Props<V>) {
  const { isSelected, getBaseProps, getInputProps } = useCheckbox({
    value,
    disabled,
  });

  const isActive = (isSelected && !disabled) || (active && !disabled);

  const iconProps = {
    active: isActive,
    color: "#FFFFFF",
    size: 16,
  };

  const Icon = useMemo(() => {
    if (isActive && activeIcon) {
      return activeIcon(iconProps);
    }

    if (icon) {
      return icon(iconProps);
    }

    return null;
  }, [iconProps]);

  return (
    <label {...getBaseProps()}>
      <VisuallyHidden>
        <input {...getInputProps()} {...checkboxProps} />
      </VisuallyHidden>
      <div className={cn(selectableTagItemVariants({ ...props, selected: isActive, disabled }), className)}>
        {Icon}
        {children}
      </div>
    </label>
  );
}
