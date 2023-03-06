import { PropsWithChildren } from "react";

export enum SectionIcon {
  Star = "ri-star-line",
  User = "ri-user-3-line",
  Funds = "ri-funds-line",
  Service = "ri-service-line",
  Link = "ri-link",
}

type Props = {
  title: string;
  icon: SectionIcon;
} & PropsWithChildren;

export default function Section({ title, icon, children }: Props) {
  return (
    <div className="flex flex-col py-4 px-6 gap-2">
      <div className="flex flex-row whitespace-nowrap gap-1 items-center text-spaceBlue-200">
        <i className={`${icon} p-px font-normal text-xl`} />
        <span className="text-md font-medium text-sm uppercase">{title}</span>
      </div>
      {children}
    </div>
  );
}
