import { useEffect, useState } from "react";
import ProjectHub from "./features/projects/ProjectHub";
import { AppErrorBoundary } from "./app/AppErrorBoundary";
import { normalizePath, resolveRoute } from "./shared/lib/routePath.mjs";

function NotFoundPage() {
  return (
    <main className="foundation-state">
      <div className="foundation-state__content">
        <span className="foundation-state__eyebrow">ARD WORKSPACE</span>
        <h1>Page not found</h1>
        <p>The address does not match a page in this foundation preview.</p>
        <a className="foundation-state__link" href="/">Return to Project Hub</a>
      </div>
    </main>
  );
}

function AppRouter() {
  const [pathname, setPathname] = useState(() => normalizePath(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => setPathname(normalizePath(window.location.pathname));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const route = resolveRoute(pathname);

  if (route === "project-hub") return <ProjectHub />;
  return <NotFoundPage />;
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AppRouter />
    </AppErrorBoundary>
  );
}
