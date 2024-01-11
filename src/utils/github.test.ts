import { describe, expect, test } from "vitest";
import { REGEX_VALID_GITHUB_ISSUE_URL, REGEX_VALID_GITHUB_PULL_REQUEST_URL } from "./github";

describe.each([
  { link: "https://github.com/onlydustxyz/marketplace/pull/504", shouldMatch: true },
  { link: "https://github.com/only-dust.xyz123/42_market---p.l.a.c.e/pull/66666", shouldMatch: true },
  { link: "https://github.com/ONLY-dust/F00/pull/66666", shouldMatch: true },
  { link: "https://github.com/onlydust/xyz/marketplace/pull/504", shouldMatch: false },
  { link: "https://github.co/onlydustxyz/marketplace/pull/504", shouldMatch: false },
  { link: "https://github.com/onlydustxyz/marketplace/issues/504", shouldMatch: false },
  { link: "https://github.com/onlydustxyz/pull/504", shouldMatch: false },
  { link: "https://github.com/onlydustxyz/marketplace/pull/", shouldMatch: false },
  {
    link: "https://github.com/onlydustxyz/marketplace/pull/504, https://github.com/onlydustxyz/marketplace/pull/505",
    shouldMatch: false,
  },
  { link: "not-a-link", shouldMatch: false },
])("Github PR validation regexp", ({ link, shouldMatch }) => {
  test(`should ${shouldMatch ? "" : "not "}match link '${link}'`, async () => {
    expect(REGEX_VALID_GITHUB_PULL_REQUEST_URL.test(link)).toEqual(shouldMatch);
  });
});

describe.each([
  { link: "https://github.com/onlydustxyz/marketplace/issues/504", shouldMatch: true },
  { link: "https://github.com/only-dust.xyz123/42_market---p.l.a.c.e/issues/66666", shouldMatch: true },
  { link: "https://github.com/ONLY-dust/F00/issues/66666", shouldMatch: true },
  { link: "https://github.com/onlydust/xyz/marketplace/issues/504", shouldMatch: false },
  { link: "https://github.co/onlydustxyz/marketplace/issues/504", shouldMatch: false },
  { link: "https://github.com/onlydustxyz/marketplace/pull/504", shouldMatch: false },
  { link: "https://github.com/onlydustxyz/issues/504", shouldMatch: false },
  { link: "https://github.com/onlydustxyz/marketplace/issues/", shouldMatch: false },
  {
    link: "https://github.com/onlydustxyz/marketplace/issues/504, https://github.com/onlydustxyz/marketplace/issues/505",
    shouldMatch: false,
  },
  { link: "not-a-link", shouldMatch: false },
])("Github issue validation regexp", ({ link, shouldMatch }) => {
  test(`should ${shouldMatch ? "" : "not "}match link '${link}'`, async () => {
    expect(REGEX_VALID_GITHUB_ISSUE_URL.test(link)).toEqual(shouldMatch);
  });
});
