'use client'

import { NextUIProvider } from '@nextui-org/react';
import dynamic from 'next/dynamic';

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextUIProvider>
      {children}
    </NextUIProvider>
  )
}
 
export default dynamic(() => Promise.resolve(Providers), {
  ssr: false
});