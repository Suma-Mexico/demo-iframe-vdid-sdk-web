import { hydrate, prerender as ssr } from "preact-iso";

import "./style.css";
import { Verification } from "./Verification";

export function App() {
  return (
    <div>
      <h3 style={{ marginBottom: "1rem", paddingTop: "1rem" }}>
        Integración de la librería VDID SDK Web en un iframe
      </h3>
      <Verification />
    </div>
  );
}

if (typeof window !== "undefined") {
  hydrate(<App />, document.getElementById("app"));
}

export async function prerender(data) {
  return await ssr(<App {...data} />);
}
