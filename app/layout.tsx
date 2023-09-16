'use client'

import type { Metadata } from 'next';
import Providers from "@/kwik/providers";
import "@/kwik/styles/globals.css";
import { Divider } from '@nextui-org/react';

export const metadata: Metadata = {
  title: 'Kwik',
  description: 'Fast & Convenient money transfers',

  manifest: '/manifest.json'
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" className="dark">
      <head />
      <body>
        <Providers>
          {children}
        </Providers>
        <Divider orientation="horizontal" />
        <div className="flex flex-row justify-center">
          <p className="text-sm text-default-400">© Remod Limited, 2023</p>
        </div>
      </body>
    </html>
  )
}

export default RootLayout;
