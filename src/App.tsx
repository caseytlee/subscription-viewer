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
  const [isScrolledToBottom, setIsScrolledToBottom] = React.useState(true);
  const outputElement = React.useRef<HTMLDivElement>(null);

  function handleWheelEvent(event: React.WheelEvent) {
    const element = event.currentTarget;

    // Determine if the element is scrolled to the bottom
    if (
      (element as HTMLDivElement).offsetHeight + element.scrollTop >=
      element.scrollHeight
    ) {
      setIsScrolledToBottom(true);
    } else {
      setIsScrolledToBottom(false);
    }
  }

  React.useEffect(() => {
    // Scroll to the bottom if the user hasn't scrolled up
    if (outputElement.current !== null && isScrolledToBottom) {
      outputElement.current.scroll({
        top: outputElement.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [current.context.values, isScrolledToBottom]);

  return (
    <main className="h-screen p-4 grid grid-cols-2 gap-4">
      <section className="p-4 border border-gray-400">
        <div className="relative flex flex-col h-full">
          {current.nextEvents.includes("STOP") && (
            <div
              role="alert"
              id="subscribed-message"
              aria-label="Subscribed and listening"
              className="absolute right-0 top-0"
            >
              Subscribed and listening...
            </div>
          )}
          <h1>Subscription Viewer</h1>
          <div className="h-20">
            <Label htmlFor="url">URL</Label>
            <Input
              type="text"
              id="url"
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
              id="token"
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
              id="query"
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
                className="w-32"
                onClick={() => send({ type: "SUBSCRIBE" })}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                Subscribe
              </MotionButton>
            )}
            {current.nextEvents.includes("STOP") && (
              <MotionButton
                className="w-32"
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
      <section
        ref={outputElement}
        className="p-4 border border-gray-400 overflow-auto"
        onWheel={(event) => handleWheelEvent(event)}
      >
        {current.context.values.length > 0 && (
          <React.Fragment>
            <div className="flex justify-end">
              <MotionButton
                className="fixed top-8 w-32"
                onClick={() => {
                  setIsScrolledToBottom(true);
                  send({ type: "CLEAR_VALUES" });
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                Clear
              </MotionButton>
            </div>
            <ul id="output" aria-label="output" className="list-none">
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
          </React.Fragment>
        )}
      </section>
    </main>
  );
}

export default App;
