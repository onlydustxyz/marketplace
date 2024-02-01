import { PropsWithChildren } from "react";

import { ScrollView } from "components/layout/pages/scroll-view/scroll-view";

import { ProjectsContextProvider } from "./context/project.context";

export default function ProjectsLayout({ children }: PropsWithChildren) {
  return (
    <ProjectsContextProvider>
      <div className="relative z-[1] h-[calc(100dvh)]">
        <ScrollView>
          <div className="flex max-w-7xl flex-col gap-6 px-4 py-4 md:mx-auto md:px-12 xl:pb-8 xl:pt-12">{children}</div>
        </ScrollView>
      </div>
    </ProjectsContextProvider>
  );
}
