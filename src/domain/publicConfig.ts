/** Public application configuration. Never import server runtime configuration here. */
export const publicGenesysConfig = {
  region: 'eu-west-1' as const,
  // Public PKCE client from Simon's connected AQM Settings screenshot (30 Sep 2026).
  clientId: 'e05784c9-2421-4c2b-a3af-79fafb25aea8',
}
