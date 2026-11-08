import { html } from "unbundle"
import type { Metadata } from "unbundle"

export const metadata: Partial<Metadata> = {
  title: "Not found · unbundle sample site",
}

export const content = () => html`
  <h1>Not found</h1>
  <p>There's no page here.</p>
`
