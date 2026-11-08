import { css, html } from "unbundle"
import type { Config, Metadata } from "unbundle"

export const config: Config = {
  layout: "plain",
}

export const metadata: Partial<Metadata> = {
  title: "About · unbundle sample site",
  description: "This page uses the plain layout.",
}

const styles = css`
  body {
    font-family: Georgia, serif;
    max-width: 40rem;
    margin: 2rem auto;
  }
`

export const content = () => html`
  <style>
    ${styles}
  </style>
  <h1>About</h1>
  <p>This page uses the plain layout: no navigation, no theme, no sync script.</p>
  <a href="/">Back home</a>
`
