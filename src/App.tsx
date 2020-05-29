import React from "react";
import { useMachine } from "@xstate/react";

import { subscriptionMachine } from "./machines/subscription-machine";

function App() {
  const [current, send] = useMachine(subscriptionMachine);

  // const [current, send, service] = useMachine(subscriptionMachine);
  // service.onTransition((state) => console.log("state:", state.value));

  return (
    <React.Fragment>
      <div>
        URL:{" "}
        <input
          type="text"
          name="url"
          disabled={!current.nextEvents.includes("SET_URL")}
          value={current.context.url}
          onChange={(event) =>
            send({ type: "SET_URL", url: event.target.value })
          }
        />
      </div>
      <div>
        Query:{" "}
        <textarea
          name="query"
          disabled={!current.nextEvents.includes("SET_QUERY")}
          value={current.context.query}
          onChange={(event) =>
            send({ type: "SET_QUERY", query: event.target.value })
          }
        />
      </div>
      <React.Fragment>
        <button
          onClick={() => send({ type: "RESET" })}
          disabled={current.nextEvents.includes("STOP")}
        >
          Reset
        </button>
        {current.nextEvents.includes("SUBSCRIBE") && (
          <button onClick={() => send({ type: "SUBSCRIBE" })}>Subscribe</button>
        )}
        {current.nextEvents.includes("STOP") && (
          <button onClick={() => send({ type: "STOP" })}>Stop</button>
        )}
      </React.Fragment>
      <div>
        {current.matches({ failure: "invalidUrl" }) && (
          <div>URL is invalid.</div>
        )}
        {(current.matches({ failure: "errorCreatingClient" }) ||
          current.matches({ failure: "errorSubscribing" })) && (
          <div>An error occurred while subscribing.</div>
        )}
      </div>
      <div>{JSON.stringify(current.context.values)}</div>
    </React.Fragment>
  );
}

export default App;
