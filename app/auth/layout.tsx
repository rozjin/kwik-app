'use client'

import { Navbar, NavbarBrand, NavbarContent } from "@nextui-org/react";
import { useEffect } from "react";
import useUser from "@/kwik/hooks/user";
import { useRouter } from "next/navigation";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const user = useUser();
  
  const router = useRouter();

  useEffect(() => {
    if (user.data.refreshToken != '') {
        if (user.data.token == '') user.refresh();
        router.push('/app');
    }
  }, []);

  return (
    <>
      <Navbar>
        <NavbarContent/>
        <NavbarContent justify="center">
          <NavbarBrand>
            {/* TODO: Logo */}
            <p className="font-bold text-inherit">KWIK</p>
          </NavbarBrand>
        </NavbarContent>
        <NavbarContent justify="end" />
      </Navbar>
      <main className="container flex items-center justify-center flex-grow px-6 mx-auto max-w-7xl">
        {children}
      </main>
    </>
  )
}

export default AuthLayout;
