import { WAIT_SHORT } from "./common";


Cypress.Commands.add(
    "requestPayment",
    (projectId, amount, recipientId, reason) => {
        return {
            query: `mutation($amount: Int!, $projectId: Uuid!, $recipientId: Int!, $reason: Reason!) {
                requestPayment(amountInUsd: $amount, projectId: $projectId, recipientId: $recipientId, reason: $reason)
            }`,
            variables: {
                amount,
                projectId,
                recipientId,
                reason
            },
            wait: WAIT_SHORT,
        };
    }
);

Cypress.Commands.add(
    "cancelPaymentRequest",
    (paymentId) => {
        return {
            query: `mutation($paymentId: Uuid!) {
                cancelPaymentRequest(paymentId: $paymentId)
            }`,
            variables: {
                paymentId
            },
            wait: WAIT_SHORT,
        };
    }
);

Cypress.Commands.add(
    "paymentRequestShouldExist",
    (paymentId) => {
        return cy.graphql({query: `{
            paymentRequestsByPk(id: "${paymentId}") {
                id
            }
        }`})
        .asAdmin()
        .data("paymentRequestsByPk.id")
        .should("be.a", "string");
    }
);

Cypress.Commands.add(
    "paymentRequestShouldNotExist",
    (paymentId) => {
        return cy.graphql({query: `{
            paymentRequestsByPk(id: "${paymentId}") {
                id
            }
        }`})
        .asAdmin()
        .should("have.nested.property", "body.data.paymentRequestsByPk")
        .should("be.null");
    }
);

Cypress.Commands.add(
    "addEthPaymentReceipt",
    (amount, currencyCode, paymentId, recipientIdentity, transactionHash) => {
        return {
            query: `mutation($amount:String!, $currencyCode:String!, $paymentId:Uuid!, $recipientIdentity:recipientIdentity!, $transactionHash:String!) {
                addEthPaymentReceipt(amount: $amount, currencyCode: $currencyCode, paymentId: $paymentId, recipientAddress: $recipientAddress, transactionHash: $transactionHash)
              }`,
            variables: {
                amount,
                currencyCode,
                paymentId,
                recipientIdentity,
                transactionHash
            },
            wait: WAIT_SHORT,
        };
    }
);
