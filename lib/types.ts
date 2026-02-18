export type Config = {
  layout?: string
}
export type Metadata = {
  title: string
  description: string
  manifest?: string
  "theme-color"?: string
  "color-scheme"?: string
  icon?: string
}

export type Module = {
  config?: Config
  metadata: Metadata
  content: () => string
}
