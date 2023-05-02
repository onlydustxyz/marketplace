import { ComponentStory, ComponentMeta } from "@storybook/react";
import { RoutePaths } from "src/App";
import { AuthContext, AuthContextType } from "src/hooks/useAuth";
import { User } from "src/types";
import { withRouter } from "storybook-addon-react-router-v6";
import { SuspenseCache } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing";

import Header from "./View";
import { responsiveChromatic } from "src/test/utils";
import { UserIdentityDocument } from "src/__generated/graphql";

export default {
  title: "Header",
  component: Header,
  parameters: responsiveChromatic,
  decorators: [withRouter],
} as ComponentMeta<typeof Header>;

const USER_ID = "e2ee731a-2697-4306-bf4b-c807f6fda0d7";

const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const mockedValue: AuthContextType = {
    isLoggedIn: true,
    ledProjectIds: [],
    login: () => {
      return;
    },
    logout: () => Promise.resolve(),
    roles: [],
    user: {
      id: USER_ID,
      email: "le@chinoix.fr",
      displayName: "lechinoix",
      avatarUrl: "https://avatars.githubusercontent.com/u/10167015?v=4",
    } as unknown as User,
    githubUserId: 123,
    invalidImpersonation: false,
    impersonating: false,
  };
  return <AuthContext.Provider value={mockedValue}>{children}</AuthContext.Provider>;
};

const mocks = [
  {
    request: {
      query: UserIdentityDocument,
      variables: { userId: USER_ID },
    },
    result: {
      data: {
        userInfo: [
          {
            identity: {
              Person: {
                lastname: "Bar",
                firstname: "Foo",
              },
            },
          },
        ],
      },
    },
  },
];

const suspenseCache = new SuspenseCache();

const Template: ComponentStory<typeof Header> = args => (
  <MockedProvider mocks={mocks} suspenseCache={suspenseCache}>
    <MockAuthProvider>
      <Header {...args} />
    </MockAuthProvider>
  </MockedProvider>
);

export const Default = Template.bind({});

Default.args = {
  menuItems: {
    [RoutePaths.Projects]: "Projects",
    [RoutePaths.Payments]: "Payments",
  },
  isLoggedIn: false,
  selectedMenuItem: RoutePaths.Projects,
  impersonating: false,
};

Default.parameters = { layout: "fullscreen", backgrounds: { default: "space" } };
