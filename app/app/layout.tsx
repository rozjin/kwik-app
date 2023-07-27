'use client'

import { useMemo, useState } from 'react';

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuItem, NavbarMenu, NavbarMenuToggle, Link, Button } from "@nextui-org/react";
import { usePathname, useRouter } from 'next/navigation';
import useUser from '@/kwik/hooks/user';

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
    const req = await fetch('https://api.moirai.nz/auth/logout', {
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

  useMemo(() => {
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
        <NavbarContent>
          <NavbarMenuToggle aria-label={isMenuOpen ? "Close" : "Open"} />
          <NavbarBrand>
            {/* TODO: Logo */}
            <p className="font-bold cursor-pointer text-inherit" onClick={() => router.push('/app')}>KWIK</p>
          </NavbarBrand>
        </NavbarContent>

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
                size="lg"
                onPress={onSubmit}
              >
                Logout
              </Link>
            </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>
      <main className="container flex-grow px-6 mx-auto max-w-7xl">
        {children}
      </main>
    </>
  )
}

export default AppLayout;
