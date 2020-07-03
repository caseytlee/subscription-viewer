import { DoneInvokeEvent, Machine, assign } from "xstate";
import {
  Client,
  createClient,
  defaultExchanges,
  subscriptionExchange,
} from "urql";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { fromArray, pipe, subscribe } from "wonka";
import { subscriptionT } from "wonka/dist/types/src/Wonka_types.gen";
import gql from "graphql-tag";

interface SubscriptionStateSchema {
  states: {
    idle: {};
    creatingClient: {};
    subscribing: {};
    failure: {
      states: {
        invalidUrl: {};
        errorCreatingClient: {};
        errorSubscribing: {};
      };
    };
  };
}

type SubscribeEvent = { type: "SUBSCRIBE" };
type StopEvent = { type: "STOP" };
type ResetEvent = { type: "RESET" };
type SetUrlEvent = { type: "SET_URL"; url: string };
type SetQueryEvent = { type: "SET_QUERY"; query: string };
type SetTokenEvent = { type: "SET_TOKEN"; token: string };
type PushValueEvent = { type: "PUSH_VALUE"; value: unknown };

type SubscriptionEvent =
  | SubscribeEvent
  | StopEvent
  | ResetEvent
  | SetUrlEvent
  | SetQueryEvent
  | SetTokenEvent
  | PushValueEvent;

interface Value {
  timestamp: Date;
  value: unknown;
}

interface SubscriptionContext {
  url: string;
  query: string;
  token: string;
  client?: Client;
  subscriptionHandle?: subscriptionT;
  error: string;
  values: Value[];
}

const initialContext: SubscriptionContext = {
  url: "",
  query: "",
  token: "",
  client: undefined,
  subscriptionHandle: undefined,
  error: "",
  values: [],
};

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
        id: "idle",
        on: {
          SET_URL: {
            actions: ["setUrl"],
          },
          SET_QUERY: {
            actions: ["setQuery"],
          },
          SET_TOKEN: {
            actions: ["setToken"],
          },
          RESET: {
            actions: ["reset"],
          },
          SUBSCRIBE: [
            {
              target: "creatingClient",
              cond: "isValidUrl",
            },
            {
              target: "#failure.invalidUrl",
            },
          ],
        },
      },
      creatingClient: {
        id: "creatingClient",
        entry: ["clearClient", "clearSubscriptionHandle", "clearError"],
        invoke: {
          id: "creatingClient",
          src: "createClient",
          onDone: {
            target: "subscribing",
            actions: "setClient",
          },
          onError: {
            target: "#failure.errorCreatingClient",
            actions: "setError",
          },
        },
        on: {
          STOP: {
            target: "idle",
          },
        },
      },
      subscribing: {
        invoke: {
          id: "subscribing",
          src: "subscribe",
          onError: {
            target: "#failure.errorSubscribing",
            actions: "setError",
          },
        },
        on: {
          PUSH_VALUE: {
            actions: ["pushValue"],
          },
          STOP: "idle",
        },
      },
      failure: {
        id: "failure",
        on: {
          SET_URL: {
            actions: ["setUrl"],
          },
          SET_QUERY: {
            actions: ["setQuery"],
          },
          SET_TOKEN: {
            actions: ["setToken"],
          },
          RESET: {
            target: "idle",
            actions: ["reset"],
          },
          SUBSCRIBE: [
            {
              target: "creatingClient",
              cond: "isValidUrl",
            },
            {
              target: "#failure.invalidUrl",
            },
          ],
        },
        states: {
          invalidUrl: {},
          errorCreatingClient: {},
          errorSubscribing: {},
        },
      },
    },
  },
  {
    actions: {
      reset: assign((context) => ({ ...context, ...initialContext })),
      setUrl: assign({
        url: (_, event) => (event as SetUrlEvent).url,
      }),
      setQuery: assign({
        query: (_, event) => (event as SetQueryEvent).query,
      }),
      setToken: assign({
        token: (_, event) => (event as SetTokenEvent).token,
      }),
      setClient: assign({
        client: (_, event) => (event as DoneInvokeEvent<Client>).data,
      }),
      setSubscriptionHandle: assign({
        subscriptionHandle: (_, event) =>
          (event as DoneInvokeEvent<subscriptionT>).data,
      }),
      clearClient: assign((context) => ({ ...context, client: undefined })),
      clearSubscriptionHandle: assign((context) => ({
        ...context,
        subscriptionHandle: undefined,
      })),
      clearError: assign((context) => ({ ...context, error: "" })),
      setError: assign({
        error: (_, event) => (event as DoneInvokeEvent<string>).data,
      }),
      pushValue: assign({
        values: (context, event) => [
          ...context.values,
          {
            timestamp: new Date(),
            value: (event as PushValueEvent).value,
          },
        ],
      }),
    },
    guards: {
      isValidUrl: (context: SubscriptionContext) => context.url.length > 0,
    },
    services: {
      createClient: async (context: SubscriptionContext) => {
        const url = context.url;
        const subscriptionClient = new SubscriptionClient(
          url.replace("http", "ws"),
          {
            reconnect: true,
            lazy: true,
            timeout: 30000,
            connectionParams: () =>
              context.token
                ? {
                    Authorization: `Bearer ${context.token}`,
                  }
                : {},
          }
        );

        const client = createClient({
          url: context.url,
          exchanges: [
            ...defaultExchanges,
            subscriptionExchange({
              forwardSubscription(operation) {
                return subscriptionClient.request(operation);
              },
            }),
          ],
        });

        return client;
      },
      subscribe: (context: SubscriptionContext) => (callback) => {
        const subscriptionHandle = pipe(
          context.client?.executeSubscription({
            key: 1,
            query: gql`
              ${context.query}
            `,
          }) || fromArray([]),
          subscribe((value) =>
            callback({
              type: "PUSH_VALUE",
              value: { data: value.data, errors: value.error },
            })
          )
        );

        return () => subscriptionHandle.unsubscribe();
      },
    },
  }
);
