"use client";

import React, { PropsWithChildren } from "react";

import { useStackBillingCreate } from "src/App/Stacks/Stacks";

function BillingLayout({ children }: PropsWithChildren) {
  const [openBillingCreate] = useStackBillingCreate();
  return (
    <div>
      <header>Header</header>
      <button onClick={openBillingCreate}>Create billing profile</button>
      <div>
        <div>tabs 1</div>
        <div>tabs 2</div>
        <div>tabs 3</div>
      </div>
      <section>{children}</section>
    </div>
  );
}

export default BillingLayout;
