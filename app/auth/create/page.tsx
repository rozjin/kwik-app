'use client'

import GoogleLogoDark from "@/kwik/components/GoogleLogoDark"
import { Button, Card, CardBody, CardFooter, CardHeader, Divider, Input, Link, Modal, ModalBody, ModalContent, useDisclosure } from "@nextui-org/react"
import { useForm, Controller, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import validator from 'validator';
import { useEffect, useState } from "react";
import { CheckCircleIcon, XIcon } from "@heroicons/react/outline";

type RegisterInputs = {
  name: string,
  email: string,
  password: string,
  phone_number: string
};

const RegisterSchema = z.object({
  name: z.string().max(32).nonempty(),
  email: z.string().email(),
  password: z.string().max(64).min(12),
  phone_number: z.string().refine((v) => validator.isMobilePhone(v, "en-NZ"))
})

export default () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [createResponse, setCreateResponse] = useState({
    success: false,
    message: ""
  });

  const { control, handleSubmit } = useForm<RegisterInputs>({
    resolver: zodResolver(RegisterSchema),
    mode: "onSubmit"
  });
  const onSubmit: SubmitHandler<RegisterInputs> = async (data) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/create`, {
      method: 'POST',
      body: JSON.stringify(data),

      headers: {
        'Content-Type': 'application/json'
      }
    })

    const createRes = await res.json();
    if (!res.ok) {
      setCreateResponse({
        success: false,
        message: "Hm, something went wrong. Please try again later."
      })
    } else {
      setCreateResponse({
        success: true,
        message: createRes.data.message
      })
    }

    onOpen();
  }

  return (
    <Card className="p-6">
      <CardHeader className="flex flex-col gap-2">
        <h1 className="text-2xl">Welcome</h1>
        <span className="text-default-500">Sign up to use Kwik</span>
      </CardHeader>
      <Divider />
      <CardBody className="gap-4">
        <Controller
          name="name" control={control} defaultValue=""
          render={({ field: { onChange, value }, fieldState: { invalid } }) => (
            <Input
              isRequired
              isClearable
              type="text"
              label="Name"
              placeholder="Joe Smith"
              description="Please enter your full legal name"

              onChange={onChange}
              value={value}

              validationState={invalid ? "invalid" : "valid"}
              errorMessage={invalid && "Please enter your name"}
            />
          )}
        />

        <Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange}
        >
          <ModalContent>
            <ModalBody>
              <div className="flex flex-row text-lg items-center justify-center p-2">
                <span className="mr-4">
                  {createResponse.success ? 
                    <CheckCircleIcon className="w-8 h-8 text-success" /> :
                    <XIcon className="w-8 h-8 text-danger" /> 
                  }
                </span>
                <span>{createResponse.message}</span>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
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
          name="phone_number" control={control} defaultValue=""
          render={({ field: { onChange, value }, fieldState: { invalid } }) => (
            <Input
              isRequired
              isClearable
              type="tel"
              label="Phone Number"
              placeholder="0214443335"

              onChange={onChange}
              value={value}

              validationState={invalid ? "invalid" : "valid"}
              errorMessage={invalid && "Please enter a valid NZ phone number"}
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

        <Button color="primary" onClick={handleSubmit(onSubmit)}>Continue</Button>

        <div className="flex flex-row">
          <span className="mr-2 text-sm">Have an account?</span>
          <Link href="/auth/login" className="text-sm">Sign in</Link>
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