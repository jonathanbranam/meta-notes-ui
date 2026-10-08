declare global {
  const __APP_VERSION__: string;
}

/** True when the server reports a version other than the one this bundle was built with. */
export function isNewVersion(built: string, server: string | undefined): boolean {
  return !!server && server !== built;
}
