'use client'

import { useRouter } from 'next/navigation'

import GoogleLogoDark from "@/kwik/components/GoogleLogoDark"
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, CardBody, CardFooter, CardHeader, Divider, Input, Link } from "@nextui-org/react"
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { default as useUser } from '@/kwik/hooks/user';

type LoginInputs = {
  email: string,
  password: string,
};

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().max(64).min(12),
})

export default () => {
  const user = useUser();
  const router = useRouter();
  const { control, handleSubmit } = useForm<LoginInputs>({
    resolver: zodResolver(LoginSchema),
    mode: "onSubmit"
  });
  const onSubmit: SubmitHandler<LoginInputs> = async (data) => {
    const req = await fetch('https://api.moirai.nz/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),

      headers: {
        'Content-Type': 'application/json'
      }
    })

    const res = await req.json()
    if (res.status == "success") {
      user.create(res.data.user, res.data.refreshToken, res.data.token);
      router.push('/app');
    }
  }

  return (
    <Card className="p-6">
      <CardHeader className="flex flex-col gap-2">
        <h1 className="text-2xl">Welcome</h1>
        <span className="text-default-500">Login to Kwik</span>
      </CardHeader>
      <Divider />
      <CardBody className="gap-4">
        <Controller
          name="email" control={control} defaultValue=""
          render={({ field: { onChange, value }, fieldState: { invalid } }) => (
            <Input
              isRequired
              isClearable
              type="email"
              label="Email"
              placeholder="joe@example.com"

              onChange={onChange}
              value={value}
              
              validationState={invalid ? "invalid" : "valid"}
              errorMessage={invalid && "Please enter a valid email address"}
            />
          )}
        />

        <Controller
          name="password" control={control} defaultValue=""
          render={({ field: { onChange, value }, fieldState: { invalid } }) => (
            <Input
              isRequired
              isClearable
              type="password"
              label="Password"
              placeholder="Enter your password"

              onChange={onChange}
              value={value}
              
              validationState={invalid ? "invalid" : "valid"}
              errorMessage={invalid && "Please enter a password"}
            />
          )}
        />      

        <Link href="#" className="text-sm">Forgot password?</Link>

        <Button color="primary" onPress={() => handleSubmit(onSubmit)}>Continue</Button>
        <div className="flex flex-row">
          <span className="mr-2 text-sm">Don&apos;t have an account?</span>
          <Link href="/auth/create" className="text-sm">Sign up</Link>
        </div>
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
  )
}