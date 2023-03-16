const getIframeDocument = () => {
  return cy.get('iframe[data-testid="iframe"]').its("0.contentDocument").should("exist");
};

const getIframeBody = () => {
  return getIframeDocument().its("body").should("not.be.undefined").then(cy.wrap);
};

describe("The user", () => {
  beforeEach(() => {
    cy.createGithubUser(12345).then(user => {
      cy.signinUser(user)
        .then(user => JSON.stringify(user.session))
        .as("token");
    });
  });

  it.skip("can send feedback", function () {
    cy.visitApp({ token: this.token });

    cy.contains("Feedback").click().wait(2000);
    getIframeBody().should("include.text", "What can we do for you today?");
  });
});
