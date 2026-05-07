export type Primitive = string | number | boolean | null

export type TokenValue = Primitive | TokenGroup

export interface TokenGroup {
  [key: string]: TokenValue
}

export interface SystemTokens extends TokenGroup {
  color: TokenGroup
  space: TokenGroup
  radius: TokenGroup
  font: TokenGroup
  fontSize: TokenGroup
  shadow: TokenGroup
}

export interface ThemeConfig {
  id: string
  name: string
  tokens: SystemTokens
}
