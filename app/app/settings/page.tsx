'use client'

import { Card, CardHeader, CardBody, Divider, Dropdown, DropdownTrigger, Button, DropdownMenu, DropdownItem, Table, TableHeader, TableColumn, TableBody, TableRow, Skeleton, CardFooter, TableCell, Input } from "@nextui-org/react";
import { MenuIcon } from '@heroicons/react/outline';
import { ArrowRightIcon } from '@heroicons/react/solid';
import { default as useUser } from '@/kwik/hooks/user';

import { useForm, Controller, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import validator from 'validator';

import fetcher, { FetchError } from "@/kwik/app/fetcher";
import useSWR from 'swr';

type DetailsInputs = {
  user: {
    name: string,
    email: string,
    phone_number: string
  }

  address: {
    line: string,
    unit?: string,

    suburb?: string,
    city: string,
    region: string,

    postcode: string
  }
};

const UserSchema = z.object({
  name: z.string().max(32).nonempty(),
  email: z.string().email(),
  phone_number: z.string().refine((v) => validator.isMobilePhone(v, "en-NZ"))
});

const AddressSchema = z.object({
  line: z.string().nonempty(),
  unit: z.string().optional(),

  suburb: z.string().optional(),
  city: z.string().nonempty(),
  region: z.string().nonempty(),

  postcode: z.string().max(6).min(4).nonempty()
});

const DetailsSchema = z.object({
  user: UserSchema.optional(),
  address: AddressSchema.optional()
});

export default () => {
  const user = useUser();
  const { data, mutate, isLoading, error } = useSWR(['/api/update', {
    headers: {
      'Authorization': `Bearer ${user.data.token}`
    }
  }], ([input, init]) => fetcher(input, init), {
    onErrorRetry: async(err, key, config, revalidate, { retryCount }) => {
      if (err instanceof FetchError && err.status == 401) {
        await user.refresh();

        revalidate({ retryCount });
      }
    },

    onSuccess: (data, key, config) => {
      user.data.user = data.data.user
    },
  });

  const { control, handleSubmit } = useForm<DetailsInputs>({
    resolver: zodResolver(DetailsSchema),
    mode: "onSubmit"
  });
  const onSubmit: SubmitHandler<DetailsInputs> = async (data) => {
    const res = await fetch('https://api.moirai.nz/api/update', {
      method: 'POST',
      body: JSON.stringify(data),

      headers: {
        'Authorization': `Bearer ${user.data.token}`,    
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      mutate({ data: data });
    }
  }

  if (isLoading) return (
    <>
      <h1 className="text-2xl">Hello,&nbsp;{user.data.user.name.split(' ')[0]}</h1>
      <h4 className="mt-6 text-md">Personal Information</h4>
      <div className="flex flex-col gap-4 mt-4">
        <Skeleton className="rounded-lg">
          <div className="rounded-lg h-14 bg-default-300"></div>
        </Skeleton>
        <Skeleton className="rounded-lg">
          <div className="rounded-lg h-14 bg-default-300"></div>
        </Skeleton>
        <Skeleton className="rounded-lg">
          <div className="rounded-lg h-14 bg-default-300"></div>
        </Skeleton>
      </div>

      <h4 className="mt-6 text-md">Address</h4>
      <div className="flex flex-col gap-4 mt-4">
        <Skeleton className="rounded-lg">
          <div className="h-48 rounded-lg bg-default-300"></div>
        </Skeleton>
      </div>
      <Button
        className="w-full mt-4"

        color="primary"
        variant="flat"

        disabled={true}
      >Save</Button>
    </>
  )

  return (
    <>
      <h1 className="text-2xl">Hello,&nbsp;{user.data.user.name.split(' ')[0]}</h1>
      <h4 className="mt-6 text-md">Personal Information</h4>
      <div className="flex flex-col gap-4 mt-4">
        <Controller
          name="user.name" control={control} defaultValue={user.data.user.name}
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

        <Controller
          name="user.email" control={control} defaultValue={user.data.user.email}
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
          name="user.phone_number" control={control} defaultValue={user.data.user.phone_number}
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
      </div>
      
      <h4 className="mt-6 text-md">Address</h4>
      <div className="flex flex-col gap-4 mt-4">
        <Controller
          name="address.line" control={control} defaultValue={data.data.address.line}
          render={({ field: { onChange, value }, fieldState: { invalid } }) => (
            <Input
              isRequired
              isClearable
              type="text"
              label="Line"
              placeholder="123 Main Street"

              onChange={onChange}
              value={value}

              validationState={invalid ? "invalid" : "valid"}
              errorMessage={invalid && "Please enter the address line"}
            />
          )}
        />
        <div className="flex flex-row justify-between">
          <Controller
            name="address.suburb" control={control} defaultValue={data.data.address.suburb}
            render={({ field: { onChange, value }, fieldState: { invalid } }) => (
              <Input
                isClearable
                type="text"
                label="Suburb"
                placeholder="Eastside"

                className="w-2/3"

                onChange={onChange}
                value={value}

                validationState={invalid ? "invalid" : "valid"}
                errorMessage={invalid && "Please a valid suburb"}
              />
            )}
          /> 

          <Controller
            name="address.unit" control={control} defaultValue={data.data.address.unit}
            render={({ field: { onChange, value }, fieldState: { invalid } }) => (
              <Input
                isClearable
                type="text"
                label="Unit"
                placeholder="Unit 101"

                className="w-1/3 ml-2"

                onChange={onChange}
                value={value}

                validationState={invalid ? "invalid" : "valid"}
                errorMessage={invalid && "Please a valid unit"}
              />
            )}
          />
        </div>
        <div className="flex flex-row justify-between">
          <Controller
            name="address.city" control={control} defaultValue={data.data.address.city}
            render={({ field: { onChange, value }, fieldState: { invalid } }) => (
              <Input
                isRequired
                isClearable
                type="text"
                label="City"
                placeholder="Springfield"

                className="w-1/3"

                onChange={onChange}
                value={value}

                validationState={invalid ? "invalid" : "valid"}
                errorMessage={invalid && "Please a valid city"}
              />
            )}
          />  

          <Controller
            name="address.region" control={control} defaultValue={data.data.address.region}
            render={({ field: { onChange, value }, fieldState: { invalid } }) => (
              <Input
                isRequired
                isClearable
                type="text"
                label="Region"
                placeholder="Auckland"

                className="w-1/3 ml-2"

                onChange={onChange}
                value={value}

                validationState={invalid ? "invalid" : "valid"}
                errorMessage={invalid && "Please a valid region"}
              />
            )}
          />  

          <Controller
            name="address.postcode" control={control} defaultValue={data.data.address.postcode}
            render={({ field: { onChange, value }, fieldState: { invalid } }) => (
              <Input
                isRequired
                isClearable
                type="text"
                label="Postcode"
                placeholder="9011"

                className="w-1/3 ml-2"

                onChange={onChange}
                value={value}

                validationState={invalid ? "invalid" : "valid"}
                errorMessage={invalid && "Please a valid postcode"}
              />
            )}
          />  
        </div>
      </div>
      <Button
        className="w-full mt-4"

        color="primary"
        variant="flat"

        onClick={handleSubmit(onSubmit)}
      >Save</Button>
   </>
  )
}