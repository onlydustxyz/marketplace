import { WAIT_LONG } from "../support/commands/common";
import IBAN from "iban";

describe("The user", () => {
  before(() => {
    cy.createGithubUser(12345).then(user => {
      cy.signinUser(user)
        .then(user => JSON.stringify(user.session))
        .as("token");
    });
  });

  beforeEach(() => {
    cy.fixture("profiles/james_bond").as("profile");
  });

  it("can fill their personal info", function () {
    cy.fillPayoutSettings(this.token);
    cy.contains("Payment information successfully updated");
  });

  it("can see their personal info pre-filled", function () {
    cy.visit("http://127.0.0.1:5173/profile", {
      onBeforeLoad(win) {
        win.localStorage.setItem("hasura_token", this.token);
      },
    });

    cy.get("[name=firstname]").should("have.value", this.profile.firstname);
    cy.get("[name=lastname]").should("have.value", this.profile.lastname);
    cy.get("[name=email]").should("have.value", this.profile.email);
    cy.get("[name=address]").should("have.value", this.profile.address);
    cy.get("[name=postCode]").should("have.value", this.profile.postCode);
    cy.get("[name=city]").should("have.value", this.profile.city);
    cy.get("[name=country]").should("have.value", this.profile.country);
    cy.get("[name=ethIdentity]").should("have.value", this.profile.ethWalletAddress);
  });
});

describe("The company", () => {
  before(() => {
    cy.createGithubUser(54321).then(user => {
      cy.signinUser(user)
        .then(user => JSON.stringify(user.session))
        .as("token");
    });
  });

  beforeEach(() => {
    cy.fixture("profiles/mi6").as("profile");
  });

  it("can fill their personal info", function () {
    cy.visit("http://127.0.0.1:5173/profile", {
      onBeforeLoad(win) {
        win.localStorage.setItem("hasura_token", this.token);
      },
    });

    cy.wait(1000);
    cy.get('[role="switch"]').click().wait(100);
    cy.get("[name=companyName]").clear().type(this.profile.name);
    cy.get("[name=identificationNumber]").clear().type(this.profile.identificationNumber);
    cy.get("[name=companyOwnerFirstName]").clear().type(this.profile.companyOwnerFirstName);
    cy.get("[name=companyOwnerLastName]").clear().type(this.profile.companyOwnerLastName);
    cy.get("[name=email]").clear().type(this.profile.email);
    cy.get("[name=address]").clear().type(this.profile.address);
    cy.get("[name=postCode]").clear().type(this.profile.postCode);
    cy.get("[name=city]").clear().type(this.profile.city);
    cy.get("[name=country]").clear().type(this.profile.country);
    cy.get("[data-testid=BANK_ADDRESS]").click().wait(100);
    cy.get("[name=IBAN]").clear().type(this.profile.IBAN);
    cy.get("[name=BIC]").clear().type(this.profile.BIC);

    cy.contains("Save profile").click();
    cy.wait(WAIT_LONG);

    cy.contains("Payment information successfully updated");
  });

  it("can see their personal info pre-filled", function () {
    cy.visit("http://127.0.0.1:5173/profile", {
      onBeforeLoad(win) {
        win.localStorage.setItem("hasura_token", this.token);
      },
    });

    cy.get("[name=companyName]").should("have.value", this.profile.name);
    cy.get("[name=identificationNumber]").should("have.value", this.profile.identificationNumber);
    cy.get("[name=companyOwnerFirstName]").should("have.value", this.profile.companyOwnerFirstName);
    cy.get("[name=companyOwnerLastName]").should("have.value", this.profile.companyOwnerLastName);
    cy.get("[name=email]").should("have.value", this.profile.email);
    cy.get("[name=address]").should("have.value", this.profile.address);
    cy.get("[name=postCode]").should("have.value", this.profile.postCode);
    cy.get("[name=city]").should("have.value", this.profile.city);
    cy.get("[name=country]").should("have.value", this.profile.country);
    cy.get("[id=BANK_ADDRESS]").should("be.checked");
    cy.get("[name=IBAN]").should("have.value", IBAN.printFormat(this.profile.IBAN));
    cy.get("[name=BIC]").should("have.value", this.profile.BIC);
  });
});
