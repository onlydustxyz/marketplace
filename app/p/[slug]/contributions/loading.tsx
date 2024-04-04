import React from "react";

import Skeleton from "src/components/Skeleton";

export default function ContributionLoading() {
  return (
    <>
      <div className="max-w-[15%]">
        <Skeleton variant="counter" />
      </div>
      <Skeleton variant="contributorList" />
    </>
  );
}
