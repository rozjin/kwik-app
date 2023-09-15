'use client'

import { NextUIProvider } from '@nextui-org/react';
import { useEffect } from 'react';

const timeoutFetch = async (resource: RequestInfo | URL, options: { timeout?: number } = {}) => {
  const { timeout = 8000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal  
  });
  clearTimeout(id);

  return response;
}

const Providers = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const waitForAPI = async () => {
      try {
        const res = await timeoutFetch(`${process.env.NEXT_PUBLIC_API_URL}/check`);
        if (!res.ok) {
          throw new Error("Kwik is experiencing internal errors.");
        }  
      } catch (err: unknown) {
        if (err instanceof Error) throw err;
        throw new Error("Kwik is offline");
      }
    }

    try {
      waitForAPI();
    } catch (err) {
      throw err;
    }
  }, [])

  return (
    <NextUIProvider>
      {children}
    </NextUIProvider>
  )
}
 
export default Providers;