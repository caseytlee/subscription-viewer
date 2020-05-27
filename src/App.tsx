import React from "react";
import { useMachine } from "@xstate/react";

import { subscriptionMachine } from "./machines/subscription-machine";

function App() {
  const [current, send] = useMachine(subscriptionMachine);

  // const [current, send, service] = useMachine(subscriptionMachine);
  // service.onTransition((state) => console.log("state:", state.value));

  const busy = !current.matches("idle") && !current.matches("failure");

  return (
    <React.Fragment>
      <div>
        URL:{" "}
        <input
          type="text"
          name="url"
          disabled={busy}
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
          disabled={busy}
          value={current.context.query}
          onChange={(event) =>
            send({ type: "SET_QUERY", query: event.target.value })
          }
        />
      </div>
      <React.Fragment>
        <button onClick={() => send({ type: "RESET" })} disabled={busy}>
          Reset
        </button>
        {!busy && (
          <button onClick={() => send({ type: "SUBSCRIBE" })}>Subscribe</button>
        )}
        {busy && <button onClick={() => send({ type: "STOP" })}>Stop</button>}
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
