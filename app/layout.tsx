import type { Metadata } from 'next';
import Providers from "@/kwik/providers";
import "@/kwik/styles/globals.css";

export const metadata: Metadata = {
  title: 'Kwik',
  description: 'Fast & Convenient money transfers',

  manifest: '/manifest.json'
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning lang="en" className="dark">
      <head />
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout;
