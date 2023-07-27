'use client'

import { Button, Card, CardBody, CardFooter, CardHeader, Divider, Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuItem, NavbarMenu, NavbarMenuToggle } from '@nextui-org/react'
import GoogleLogoDark from '@/kwik/components/GoogleLogoDark';
import { useRouter } from 'next/navigation'
import Link from 'next/link';

export default () => {
  const router = useRouter();  

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
        <Card className="p-6">
          <CardHeader className="flex flex-col gap-2">
            <h1 className="text-2xl">Welcome</h1>
            <span className="text-default-500">Login or Signup to use Kwik</span>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4">
            <Button color="primary" onPress={() => router.push('/auth/login/fresh')}>
              Login
            </Button>
            <Button color="primary" onPress={() => router.push('/auth/create')}>
              Sign Up
            </Button>
          </CardBody>
          <Divider />
          <CardFooter className="flex justify-center">
            <Button
              variant="ghost"
              color="primary"
              className="mt-2 -mb-3"
              startContent={<GoogleLogoDark />}
            >Continue with Google</Button>
          </CardFooter>
        </Card>
      </main>
    </>
  )
}