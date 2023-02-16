import { newRandomGithubUserId } from "../../support/utils";

describe("As a simple user, I", () => {
    let projectId;
    let budgetId;
    let leader;

    const STARKONQUEST_ID = 481932781;

    before(() => {
        cy.createGithubUser(543221).then((user) =>
            cy
                .createProjectWithLeader(
                    user,
                    "Project with budget",
                    1000,
                    STARKONQUEST_ID
                )
                .then(($projectId) => {
                    cy.getProjectBudget($projectId)
                        .asRegisteredUser(user)
                        .data("projectsByPk.budgets")
                        .its(0)
                        .its("id")
                        .should("be.a", "string")
                        .then(($budgetId) => {
                            projectId = $projectId;
                            budgetId = $budgetId;
                            leader = user;
                        });
                })
        );
    });

    it("can get projects with some details", () => {
        cy.createGithubUser(73635365).then((user) => {
            cy.graphql({
                query: `query {
                projects {
                  id
                  projectDetails {
                    name
                    description
                  }
                  projectLeads {
                    user {
                      avatarUrl
                      displayName
                    }
                  }
                }
              }`})
                .asRegisteredUser(user)
                .data("projects")
                .should("be.a", "array");
        });
    });

    it("can get payment request as the recipient", () => {
        const githubUserId = newRandomGithubUserId();

        cy.requestPayment(projectId, 500, githubUserId, {workItems: "https://github.com/onlydustxyz/marketplace/pull/504"})
            .asRegisteredUser(leader)
            .data("requestPayment")
            .then((requestId) => {
                cy.createGithubUser(githubUserId)
                    .then((user) => {
                        cy.graphql({
                            query: `query($requestId: uuid!) {
                                    paymentRequestsByPk(id: $requestId) {
                                        id
                                        recipientId
                                        amountInUsd
                                        budgetId
                                        recipient {
                                            userId
                                        }
                                    }
                                }`, variables: { requestId }})
                            .asRegisteredUser(user)
                            .data("paymentRequestsByPk")
                            .then((paymentRequest) => {
                                expect(paymentRequest.recipientId).equal(
                                    user.githubUserId
                                );
                                expect(paymentRequest.amountInUsd).equal(500);
                                expect(paymentRequest.budgetId).equal(budgetId);
                                expect(paymentRequest.recipient.userId).equal(
                                    user.id
                                );
                            });
                    });
            });
    });

    it("can't request a payment", () => {
        cy.createGithubUser(28464353).then((user) => {
            cy.requestPayment(budgetId, 500, 55000, { workItems: ["https://github.com/onlydustxyz/marketplace/pull/504"] })
                .asRegisteredUser(user)
                .errors()
                .its(0)
                .its("message")
                .should("eq", `User '${user.id}' is not authorized to perform this action`);
        });
    });

    it("can fetch github repository details from a project", () => {
        cy.createGithubUser(23982237).then((user) => {
            cy.graphql({
                query: `{
                projectsByPk(id: "${projectId}") {
                  githubRepo {
                    id
                    name
                    owner
                    content {
                        contributors {
                        id
                        login
                        avatarUrl
                        }
                        readme {
                        encoding
                        content
                        }
                        logoUrl
                    }
                    pullRequests {
                        id
                      }
                  }
                }
              }`})
                .asRegisteredUser(user)
                .data("projectsByPk.githubRepo")
                .then((repo) => {
                    expect(repo.id).equal(STARKONQUEST_ID);
                    expect(repo.name).equal("starkonquest");
                    expect(repo.owner).equal("onlydustxyz");
                    expect(repo.content.contributors).to.be.an("array");
                    expect(repo.content.contributors[0]).to.have.all.keys([
                        "id",
                        "login",
                        "avatarUrl",
                    ]);
                    expect(repo.content.readme.encoding).equal("BASE64");
                    expect(repo.content.readme.content).to.be.a("string");
                    expect(repo.content.logoUrl).to.be.a("string");
                    expect(repo.pullRequests).to.not.be.empty;
                });
        });
    });

    it("can fetch github repository details from an empty project", () => {
        const GITHUB_REPO_ID_EMPTY_REPO = 584839416;

        cy.createGithubUser(28464353).then((user) => {
          cy.createProjectWithLeader(user, "Project with budget", 1000, GITHUB_REPO_ID_EMPTY_REPO)
            .then((projectId) => {
            cy.graphql({
                query: `{
                projectsByPk(id: "${projectId}") {
                  githubRepo {
                    id
                    name
                    owner
                    content {
                        contributors {
                        id
                        login
                        avatarUrl
                        }
                        readme {
                        encoding
                        content
                        }
                        logoUrl
                    }
                    pullRequests {
                        id
                      }
                  }
                }
              }`})
                .asRegisteredUser(user)
                .data("projectsByPk.githubRepo")
                .then((repo) => {
                    expect(repo.id).equal(GITHUB_REPO_ID_EMPTY_REPO);
                    expect(repo.name).equal("empty");
                    expect(repo.owner).equal("od-mocks");
                    expect(repo.content.contributors).to.be.empty;
                    expect(repo.content.readme).to.null;
                    expect(repo.content.logoUrl).to.be.a("string");
                    expect(repo.pullRequests).to.be.empty;
                });
        });
    });
});


    it("can fetch github user details from name", () => {
        cy.createGithubUser(9237643).then((user) => {
            cy.graphql({
                query: `{
                    fetchUserDetails(username: "abuisset") {
                      id
                      login
                      avatarUrl
                    }
                  }`})
                .asRegisteredUser(user)
                .data("fetchUserDetails")
                .then((user) => {
                    expect(user.id).equal(990474);
                    expect(user.login).equal("abuisset");
                    expect(user.avatarUrl).to.be.a("string");
                });
        });
    });

    it("can update my info", () => {
        let email = "pierre.fabre@gmail.com";
        let location =
            { city: "Paris", country: "France", postCode: "75008", address: "4 avenue des Champs Elysee" };
        let identity =
            { type: "PERSON", optPerson: { firstname: "Pierre", lastname: "Fabre" } };
        let payout_settings =
            { type: "ETHEREUM_ADDRESS", optEthAddress: "0x123" };

        let new_payout_settings =
            { type: "ETHEREUM_NAME", optEthName: "vitalik.eth" };

        cy.createGithubUser(12345).then((user) => {
            cy.updateProfileInfo(email, location, identity, payout_settings)
                .asRegisteredUser(user)
                .data("updateProfileInfo")
                .should("eq", user.id)
                .then(() => {
                    cy.graphql({
                        query: `{
                    userInfoByPk(userId: "${user.id}") {
                        identity
                        email
                        location
                        payoutSettings
                      }
                  }`})
                        .asAdmin()
                        .data("userInfoByPk")
                        .should("deep.eq", {
                            identity: {
                                Person: {
                                    lastname: "Fabre",
                                    firstname: "Pierre",
                                },
                            },
                            email: email,
                            location: {
                                city: "Paris",
                                address: "4 avenue des Champs Elysee",
                                country: "France",
                                post_code: "75008",
                            },
                            payoutSettings: { EthTransfer: { Address: "0x0123" } },
                        });
                })
                .then(() =>
                    cy
                        .updateProfileInfo(
                            email,
                            location,
                            identity,
                            new_payout_settings
                        )
                        .asRegisteredUser(user)
                        .data()
                )
                .then(() => {
                    cy.graphql({
                        query: `{
                    userInfoByPk(userId: "${user.id}") {
                        identity
                        email
                        location
                        payoutSettings
                      }
                  }`})
                        .asAdmin()
                        .data("userInfoByPk")
                        .should("deep.eq", {
                            identity: {
                                Person: {
                                    lastname: "Fabre",
                                    firstname: "Pierre",
                                },
                            },
                            email: email,
                            location: {
                                city: "Paris",
                                address: "4 avenue des Champs Elysee",
                                country: "France",
                                post_code: "75008",
                            },
                            payoutSettings: { EthTransfer: { Name: "vitalik.eth" } },
                        });
                });
        });
    });
});
