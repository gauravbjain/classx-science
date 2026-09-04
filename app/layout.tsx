import type { Metadata, Viewport } from "next";
import "./globals.css";
import SiteHeader from "@/components/ui/SiteHeader";

export const metadata: Metadata = {
  title: {
    default: "ClassX — Science, made obvious",
    template: "%s · ClassX Science",
  },
  description:
    "CBSE Class X Science (2026-27) explained simply, with interactive simulations, quizzes and flashcards for every chapter.",
  applicationName: "ClassX",
  appleWebApp: { capable: true, title: "ClassX", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#100f14" },
  ],
};

const themeScript = `
(function(){
  try {
    var s = localStorage.getItem('classx.theme');
    var d = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (s === 'dark' || (!s && d)) document.documentElement.classList.add('dark');
  } catch(e){}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SiteHeader />
        <main className="min-h-[70vh]">{children}</main>
        <footer className="no-print mt-24 border-t hairline">
          <div className="mx-auto max-w-6xl px-5 py-10 text-sm faint">
            <p>
              ClassX · Built for CBSE Class X, session 2026-27. Mapped to the official CBSE
              Secondary Curriculum for Science.
            </p>
            <p className="mt-2">
              Always cross-check with your NCERT textbook and your teacher — this site is a
              companion, not a replacement.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
