'use client'

import { useEffect, useState } from 'react';

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuItem, NavbarMenu, NavbarMenuToggle, Link, Button, Divider } from "@nextui-org/react";
import { usePathname, useRouter } from 'next/navigation';
import useUser from '@/kwik/hooks/user';
import dynamic from 'next/dynamic';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setMenuOpen] = useState<boolean | undefined>(false);
  const menuItems = [
    "Settings",
    "Wallet",
    "Transfer",
    "Payees"
  ]

  const user = useUser();

  const pathname = usePathname();
  const router = useRouter();

  const onSubmit = async() => {
    const req = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: 'POST',
      body: JSON.stringify({
        refreshToken: user.data.refreshToken
      }),

      headers: {
        'Authorization': `Bearer ${user.data.token}`,
        'Content-Type': 'application/json'
      },
    });

    if (req.ok) {
      user.clear();
      router.push('/');
    }
  }

  useEffect(() => {
    if (user.data.token == '') {
      if (user.data.refreshToken != '') {
          user.refresh();
          router.refresh();
      } else {
        router.push('/');
      }
    }
  }, []);

  return (
    <>
      <Navbar onMenuOpenChange={setMenuOpen}>
        {user.data.refreshToken &&
          <NavbarContent>
            <NavbarMenuToggle aria-label={isMenuOpen ? "Close" : "Open"} />
          </NavbarContent>
        }

        <NavbarContent justify="center">
          <NavbarBrand>
            {/* TODO: Logo */}
            <p className="font-bold cursor-pointer text-inherit" onClick={() => router.push('/app')}>KWIK</p>
          </NavbarBrand>
        </NavbarContent>

        {user.data.refreshToken &&
          <>
            <NavbarContent justify="end">
              <NavbarItem>
                <Button color="primary" variant="flat">
                  Create QR
                </Button>
              </NavbarItem>
              <NavbarItem className="-mr-2">
                <Button color="warning" variant="flat">
                  Scan QR
                </Button>
              </NavbarItem>
            </NavbarContent>

            <NavbarMenu>
              {menuItems.map((item, idx) => (
                <NavbarMenuItem key={`${item}-${idx}`}>
                  <Link
                    color={
                      pathname === `/app/${item.toLowerCase()}` ? "secondary" : "primary"
                    }

                    href={`/app/${item.toLowerCase()}`}
                    size="lg"
                  >
                    {item}
                  </Link>
                </NavbarMenuItem>
              ))}
              <NavbarMenuItem key={`${menuItems.length + 1}-logout`}>
                  <Link
                    color="danger"
                    className="cursor-pointer"
                    size="lg"
                    onPress={onSubmit}
                  >
                    Logout
                  </Link>
                </NavbarMenuItem>
            </NavbarMenu>
          </>
        }
      </Navbar>
      <main className="container flex-grow px-6 mx-auto max-w-7xl h-full">
        {user.data.refreshToken && (
          <div>
            {children}
          </div>
        )}
      </main>
      <div className="flex flex-row justify-center mt-auto">
        <p className="text-sm text-default-400">© Remod Limited, 2023</p>
      </div>
    </>
  )
}

export default dynamic(() => Promise.resolve(AppLayout), {
  ssr: false
});
