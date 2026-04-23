import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "B1 Digital Space" },
      { name: "description", content: "Built for creators and operators focused on performance, scale, and control." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "B1 Digital Space" },
      { property: "og:description", content: "Built for creators and operators focused on performance, scale, and control." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "B1 Digital Space" },
      { name: "twitter:description", content: "Built for creators and operators focused on performance, scale, and control." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/bobjbHCHILMzFGCPkPbCVKaOkgH2/social-images/social-1776967398987-ChatGPT_Image_Apr_23,_2026,_11_02_44_AM.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/bobjbHCHILMzFGCPkPbCVKaOkgH2/social-images/social-1776967398987-ChatGPT_Image_Apr_23,_2026,_11_02_44_AM.webp" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
