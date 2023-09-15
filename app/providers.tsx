'use client'

import { NextUIProvider } from '@nextui-org/react';
import { useEffect } from 'react';

const Providers = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const waitForAPI = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/check`);
      if (!res.ok) {
        throw new Error("Kwik is offline.");
      }
    }

    waitForAPI();
  }, [])

  return (
    <NextUIProvider>
      {children}
    </NextUIProvider>
  )
}
 
export default Providers;