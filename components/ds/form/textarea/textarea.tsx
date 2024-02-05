import { Textarea as NextTextarea } from "@nextui-org/react";

import { TTextarea } from "./textarea.types";

export function Textarea({ type, value, onChange, startContent, endContent, ...props }: TTextarea.Props) {
  return (
    <NextTextarea
      classNames={{
        inputWrapper:
          "rounded-lg border border-greyscale-50/8 bg-white/5 focus-within:!border-spacePurple-500 focus-within:bg-spacePurple-900 focus-within:ring-1 focus-within:ring-spacePurple-500 hover:border hover:border-greyscale-50/8 h-8 min-h-8 px-3 py-2 transition-none",
        innerWrapper: "gap-2",
        input: "!p-0 font-walsheim text-sm leading-none",
      }}
      variant="bordered"
      labelPlacement="outside"
      type={type}
      value={value}
      onChange={onChange}
      startContent={startContent}
      endContent={endContent}
      {...props}
    />
  );
}