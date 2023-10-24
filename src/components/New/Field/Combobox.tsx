import { Combobox as HeadlessCombobox, Transition } from "@headlessui/react";
import ArrowDownSLine from "src/icons/ArrowDownSLine";
import User3Line from "src/icons/User3Line";
import { cn } from "src/utils/cn";

type Item = {
  id: string | number;
};

type Props<T> = {
  items: T[];
  renderItem: ({ item, selected, active }: { item: T; selected: boolean; active: boolean }) => JSX.Element;
  query: string;
  onQuery: (query: string) => void;
  placeholder?: string;
  multiple?: boolean;
};

type SingleProps<T> = Props<T> & {
  selected: T;
  onChange: (selected: T) => void;
  multiple: false;
};

type MultipleProps<T> = Props<T> & {
  selected: T[];
  onChange: (selected: T[]) => void;
  multiple: true;
};

export function Combobox<T extends Item>({
  items,
  renderItem,
  query,
  onQuery,
  selected,
  onChange,
  placeholder,
  multiple = false,
}: SingleProps<T> | MultipleProps<T>) {
  // TODO handle loading state

  return (
    <HeadlessCombobox value={selected} onChange={onChange} multiple={multiple as false}>
      {({ open }) => (
        <div className="relative">
          <HeadlessCombobox.Button
            as="div"
            className={cn(
              "group relative z-30 flex items-center gap-3 overflow-hidden rounded-lg border px-2.5 py-1.5",
              open
                ? "border-spacePurple-500 bg-spacePurple-900 ring-1 ring-spacePurple-500"
                : "border-greyscale-50/8 bg-white/5 focus-within:border-spacePurple-500 focus-within:bg-spacePurple-900 focus-within:ring-1 focus-within:ring-spacePurple-500"
            )}
          >
            <HeadlessCombobox.Input
              className="peer w-full border-none bg-transparent text-sm text-greyscale-50 outline-none placeholder:text-spaceBlue-200"
              placeholder={placeholder}
              onChange={event => onQuery(event.target.value)}
              autoComplete="off"
            />
            <User3Line
              className={cn(
                "order-first",
                open ? "text-greyscale-50" : "text-spaceBlue-200 peer-focus:text-greyscale-50"
              )}
              aria-hidden="true"
            />
            {!open ? (
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ArrowDownSLine
                  className=" group-focus-within:text-red h-5 w-5 text-spaceBlue-200  peer-focus:text-spacePurple-300 peer-focus:opacity-0"
                  aria-hidden="true"
                />
              </div>
            ) : null}
          </HeadlessCombobox.Button>
          <Transition
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => onQuery("")}
            className="absolute -left-4 -right-4 -top-4 z-20 flex flex-col gap-4 rounded-2xl border border-greyscale-50/12 bg-spaceBlue-900 p-4 shadow-heavy"
          >
            <div className="h-9" />
            <HeadlessCombobox.Options className="max-h-60 w-full divide-y divide-greyscale-50/8 overflow-auto py-1 text-sm text-greyscale-50 scrollbar-thin scrollbar-thumb-white/12 scrollbar-thumb-rounded scrollbar-w-1.5 focus:outline-none">
              {items.length === 0 && query !== "" ? (
                <div className="select-none text-greyscale-50">Nothing here.</div>
              ) : (
                items.map(item => (
                  <HeadlessCombobox.Option
                    key={item.id}
                    className={({ active }) =>
                      cn("relative cursor-pointer select-none py-2", {
                        "bg-white/2": active,
                      })
                    }
                    value={item}
                  >
                    {({ selected, active }) => renderItem({ item, selected, active })}
                  </HeadlessCombobox.Option>
                ))
              )}
            </HeadlessCombobox.Options>
          </Transition>
        </div>
      )}
    </HeadlessCombobox>
  );
}
