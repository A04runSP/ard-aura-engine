const knownRoutes = new Map([
  ["/", "project-hub"],
  ["/project-hub", "project-hub"],
]);

export function normalizePath(pathname) {
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const collapsed = withLeadingSlash.replace(/\/{2,}/g, "/");
  if (collapsed === "/") return "/";
  return collapsed.replace(/\/+$/, "");
}

export function resolveRoute(pathname) {
  return knownRoutes.get(normalizePath(pathname)) ?? "not-found";
}
