import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// next/font self-hosts Inter at build time: no request to Google at runtime, no
// third-party connection from a visitor's browser, no layout shift. One family
// only, the serif was the main reason the pages read soft rather than sharp.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://koos-ayo.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'KOOS: learn how your relationship works',
    template: '%s · KOOS',
  },
  description:
    'KOOS helps you pause before you react, choose a better response, and learn over time what actually works in your relationship.',
  openGraph: {
    title: 'KOOS: learn how your relationship works',
    description:
      'Pause before you react, choose a better response, and learn what actually works.',
    url: siteUrl,
    siteName: 'KOOS',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

/**
 * Runs BEFORE first paint, blocking. This cannot be a React effect: effects run
 * after paint, so the page would visibly flash the wrong theme on every load.
 * Wrapped in try/catch because reading localStorage throws in some private
 * browsing modes, on failure we simply fall back to the system preference.
 */
const themeScript = `
(function(){try{
var s=localStorage.getItem('koos-theme');
var d=window.matchMedia('(prefers-color-scheme: dark)').matches;
var dark=s==='dark'||(s!=='light'&&d);
document.documentElement.setAttribute('data-theme',dark?'dark':'light');
}catch(e){}})();
`.trim()

const appEnv = process.env.NEXT_PUBLIC_APP_ENV
const isNotProduction = appEnv === 'staging' || appEnv === 'preview'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the script above sets data-theme on <html>
    // before React hydrates, so the server and client markup differ by design.
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a href="#main" className="koos-skip">
          Skip to content
        </a>
        {isNotProduction && (
          <div
            role="status"
            className="bg-rose-deep px-4 py-1.5 text-center text-sm font-semibold text-white"
          >
            {appEnv === 'staging' ? 'STAGING' : 'PREVIEW'}, not the live site
          </div>
        )}
        {children}
      </body>
    </html>
  )
}
