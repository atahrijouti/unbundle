import { $loop, html, textToHTML } from "unbundle"
import type { Metadata } from "unbundle"

export const metadata: Partial<Metadata> = {
  title: "Home · unbundle sample site",
}

const languages = ["TypeScript", "HTML", "CSS"]

export const content = () => html`
  <h1>unbundle sample site</h1>
  <p>What reaches the browser as written, transpiled but never bundled:</p>
  <ul>
    ${$loop(languages, (language) => html`<li>${language}</li>`)}
  </ul>
  <button id="add">Add a line</button>
  <div id="lines"></div>
`

export const ready = () => {
  const lines = document.querySelector("#lines")
  document.querySelector("#add")?.addEventListener("click", () => {
    lines?.append(textToHTML(html`<p>Added at ${new Date().toLocaleTimeString()}</p>`))
  })
}
