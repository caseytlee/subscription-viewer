import React from "react";
import { useMachine } from "@xstate/react";

import { subscriptionMachine } from "./machines/subscription-machine";

function App() {
  const [current, send] = useMachine(subscriptionMachine);

  const busy = !current.matches("idle") && !current.matches("failure");

  return (
    <React.Fragment>
      <div>
        URL:{" "}
        <input
          type="text"
          name="url"
          disabled={busy}
          onChange={(event) =>
            send({ type: "SET_URL", data: event.target.value })
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
      <div>{JSON.stringify(current.context)}</div>
    </React.Fragment>
  );
}

export default App;
