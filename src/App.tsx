import React from "react";
import { useMachine } from "@xstate/react";
import { motion } from "framer-motion";

import Label from "./components/label";
import Input from "./components/input";
import Textarea from "./components/textarea";
import Button from "./components/button";
import { subscriptionMachine } from "./machines/subscription-machine";

const DATE_FORMAT_OPTIONS = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: false,
};

const MotionButton = motion.custom(Button);

function App() {
  const [current, send] = useMachine(subscriptionMachine);

  // const [current, send, service] = useMachine(subscriptionMachine);
  // service.onTransition((state) => console.log("state:", state.value));

  return (
    <main className="h-screen p-4 grid grid-cols-2 gap-4">
      <section className="p-4 border border-gray-400">
        <div className="relative flex flex-col h-full">
          {current.nextEvents.includes("STOP") && (
            <div className="absolute right-0 top-0">
              Subscribed and listening...
            </div>
          )}
          <h1>Subscription Viewer</h1>
          <div className="h-20">
            <Label htmlFor="url">URL</Label>
            <Input
              type="text"
              name="url"
              disabled={!current.nextEvents.includes("SET_URL")}
              value={current.context.url}
              onChange={({ currentTarget }) =>
                send({
                  type: "SET_URL",
                  url: currentTarget.value,
                })
              }
            />
          </div>
          <div className="h-20">
            <Label htmlFor="token">Bearer Token</Label>
            <Input
              name="token"
              disabled={!current.nextEvents.includes("SET_TOKEN")}
              value={current.context.token}
              onChange={({ currentTarget }) =>
                send({ type: "SET_TOKEN", token: currentTarget.value })
              }
            />
          </div>
          <div className="flex flex-col flex-grow">
            <Label htmlFor="query">Query</Label>
            <Textarea
              name="query"
              className="flex-1 mb-4 resize-none"
              disabled={!current.nextEvents.includes("SET_QUERY")}
              value={current.context.query}
              onChange={(event) =>
                send({ type: "SET_QUERY", query: event.currentTarget.value })
              }
            />
          </div>
          <div className="flex justify-end">
            {current.nextEvents.includes("SUBSCRIBE") && (
              <MotionButton
                onClick={() => send({ type: "SUBSCRIBE" })}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                Subscribe
              </MotionButton>
            )}
            {current.nextEvents.includes("STOP") && (
              <MotionButton
                onClick={() => send({ type: "STOP" })}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                Unsubscribe
              </MotionButton>
            )}
          </div>
          <div>
            {current.matches({ failure: "invalidUrl" }) && (
              <div>URL is invalid.</div>
            )}
            {(current.matches({ failure: "errorCreatingClient" }) ||
              current.matches({ failure: "errorSubscribing" })) && (
              <div>An error occurred while subscribing.</div>
            )}
          </div>
        </div>
      </section>
      <section className="p-4 border border-gray-400 overflow-auto">
        <ul className="list-none">
          {current.context.values.map((message, index) => (
            <li key={index}>
              <h2>
                {new Intl.DateTimeFormat(
                  window.navigator.language,
                  DATE_FORMAT_OPTIONS
                ).format(message.timestamp)}
              </h2>
              <pre>{JSON.stringify(message.value, null, 2)}</pre>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default App;
