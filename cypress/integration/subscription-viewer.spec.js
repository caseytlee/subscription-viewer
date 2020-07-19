/// <reference types="cypress" />

const { Server } = require("mock-socket");

context("WebSocket", () => {
  const query = `subscription { onMessage }`;

  const messages = [
    "This is message A! Cool!",
    "This is message B! Cool!",
    "This is message C! Cool!",
    "This is message D! Cool!",
    "This is message E! Cool!",
  ];

  it("can mock a websocket", () => {
    cy.visit("/", {
      onBeforeLoad: (win) => {
        cy.stub(win, "WebSocket", (url) => {
          if (url === Cypress.env("graphQLEndpoint").replace("http", "ws")) {
            const mockWSServer = new Server(url);

            mockWSServer.on("connection", (socket) => {
              socket.on("message", (message) => {
                const { id, type } = JSON.parse(message);

                if (id && type === "start") {
                  let index = 0;
                  const intervalId = setInterval(() => {
                    if (index < 5) {
                      socket.send(
                        JSON.stringify({
                          id,
                          type: "data",
                          payload: { data: { sendMessage: messages[index] } },
                        })
                      );

                      index++;
                    } else {
                      clearInterval(intervalId);
                    }
                  }, 10);
                }
              });
            });

            return new WebSocket(url);
          }
        });
      },
    }).then(() => {
      cy.findByRole("heading", { name: /subscription viewer/i });

      cy.findByRole("textbox", { name: /url/i }).type(
        Cypress.env("graphQLEndpoint")
      );

      cy.findByRole("textbox", { name: /query/i }).type(query, {
        parseSpecialCharSequences: false,
      });

      cy.findByRole("button", { name: /subscribe/i }).click();

      cy.findByRole("alert", { name: /subscribed and listening/i });
      cy.findByRole("button", { name: /unsubscribe/i });

      cy.findByRole("button", { name: /clear/i }).should("not.exist");
      cy.findByRole("button", { name: /clear/i });

      cy.findByRole("list", { name: /output/i });

      cy.findAllByRole("listitem")
        .should("have.length", 5)
        .each((element, index) => {
          expect(element.text()).to.contain(
            JSON.stringify(
              {
                data: { sendMessage: messages[index] },
              },
              null,
              2
            )
          );
        })
        .then(() => {
          cy.findByRole("button", { name: /clear/i }).click();

          cy.findByRole("list", { name: /output/i }).should("not.exist");
          cy.findAllByRole("listitem").should("have.length", 0);

          cy.findByRole("button", { name: /unsubscribe/i }).click();

          cy.findByRole("alert", { name: /subscribed and listening/i }).should(
            "not.exist"
          );

          cy.findByRole("textbox", { name: /url/i }).should(
            "have.value",
            Cypress.env("graphQLEndpoint")
          );

          cy.findByRole("textbox", { name: /query/i }).should(
            "have.value",
            query
          );

          cy.findByRole("button", { name: /subscribe/i });
        });
    });
  });
});
