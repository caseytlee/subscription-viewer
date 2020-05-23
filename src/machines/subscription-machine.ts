import { Machine, assign } from "xstate";
import { Client } from "urql";

interface SubscriptionStateSchema {
  states: {
    idle: {};
    subscribing: {};
    listening: {};
    failure: {};
  };
}

type SubscribeEvent = { type: "SUBSCRIBE" };
type StopEvent = { type: "STOP" };
type ResetEvent = { type: "RESET" };
type SetUrlEvent = { type: "SET_URL"; data: string };

type SubscriptionEvent = SubscribeEvent | StopEvent | ResetEvent | SetUrlEvent;

interface SubscriptionContext {
  authToken?: string;
  url?: string;
  client?: Client;
}

const initialContext = {};

export const subscriptionMachine = Machine<
  SubscriptionContext,
  SubscriptionStateSchema,
  SubscriptionEvent
>(
  {
    id: "subscription",
    initial: "idle",
    context: initialContext,
    states: {
      idle: {
        on: {
          SET_URL: {
            actions: ["setUrl"],
          },
          RESET: {
            actions: ["reset"],
          },
          SUBSCRIBE: "subscribing",
        },
      },
      subscribing: {
        on: {
          STOP: "idle",
        },
      },
      listening: {
        on: {
          STOP: "idle",
        },
      },
      failure: {
        on: {
          RESET: {
            actions: ["reset"],
          },
          SUBSCRIBE: "subscribing",
        },
      },
    },
  },
  {
    actions: {
      reset: assign(initialContext),
      setUrl: assign({
        url: (_, event) => (event as SetUrlEvent).data,
      }),
    },
  }
);
