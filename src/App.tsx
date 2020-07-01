import React from "react";
import { useMachine } from "@xstate/react";

import Label from "./components/label";
import Input from "./components/input";
import Textarea from "./components/textarea";
import Button from "./components/button";
import { subscriptionMachine } from "./machines/subscription-machine";

function App() {
  const [current, send] = useMachine(subscriptionMachine);

  // const [current, send, service] = useMachine(subscriptionMachine);
  // service.onTransition((state) => console.log("state:", state.value));

  return (
    <main className="h-screen p-4 grid grid-cols-2 gap-4">
      <section className="p-4 border border-gray-400">
        <h1>Subscription Viewer</h1>
        <div>
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
        <div>
          <Label htmlFor="query">Query</Label>
          <Textarea
            name="query"
            disabled={!current.nextEvents.includes("SET_QUERY")}
            value={current.context.query}
            onChange={(event) =>
              send({ type: "SET_QUERY", query: event.currentTarget.value })
            }
          />
        </div>
        <div>
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
        <Button
          onClick={() => send({ type: "RESET" })}
          disabled={current.nextEvents.includes("STOP")}
        >
          Reset
        </Button>
        {current.nextEvents.includes("SUBSCRIBE") && (
          <Button onClick={() => send({ type: "SUBSCRIBE" })}>Subscribe</Button>
        )}
        {current.nextEvents.includes("STOP") && (
          <Button onClick={() => send({ type: "STOP" })}>Stop</Button>
        )}
        <div>
          {current.matches({ failure: "invalidUrl" }) && (
            <div>URL is invalid.</div>
          )}
          {(current.matches({ failure: "errorCreatingClient" }) ||
            current.matches({ failure: "errorSubscribing" })) && (
            <div>An error occurred while subscribing.</div>
          )}
        </div>
      </section>
      <section className="p-4 border border-gray-400 overflow-auto">
        <ul className="list-none">
          {current.context.values.map((message) => (
            <li>
              <h2>{Date.now()}</h2>
              <pre>{JSON.stringify(message, null, 2)}</pre>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default App;
