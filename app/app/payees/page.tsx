'use client'

import { Card, Button, Skeleton, Input, Divider, Modal, ModalContent, ModalBody } from "@nextui-org/react";
import { ArrowRightIcon, PlusIcon } from '@heroicons/react/solid';
import { default as useUser } from '@/kwik/hooks/user';

import { useForm, Controller, SubmitHandler } from "react-hook-form";
import fetcher, { FetchError } from "@/kwik/app/fetcher";
import useSWR, { KeyedMutator, mutate } from 'swr';


import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { XIcon } from "@heroicons/react/outline";

type PayeeInputs = {
  name: string,
  picture?: string,
  email: string
}

const MAX_FILE_SIZE = 500000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const PayeeSchema = z.object({
  name: z.string().max(32).nonempty(),
  picture: z.any()
      .refine((file) => file?.size <= MAX_FILE_SIZE, "Max image size is 5MB.")
      .refine(
          (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
          "Only .jpg, .jpeg, .png and .webp formats are supported."
      )
      .optional(),
  email: z.string().email(),
});

const EmptyPayee = (props: { mutate: KeyedMutator<any> }) => {
  const { mutate } = props;

  const user = useUser();
  const { control, handleSubmit, setValue } = useForm<PayeeInputs>({
    resolver: zodResolver(PayeeSchema),
    mode: "onSubmit",
  });

  const onSubmit: SubmitHandler<PayeeInputs> = async (data) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payees`, {
      method: 'POST',
      body: JSON.stringify({
        op: "update",
        payees: [data]
      }),

      headers: {
        'Authorization': `Bearer ${user.data.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      mutate({ data: await res.json() })
    }
  }

  return (
    <Card className="max-w-sm gap-2 p-6">
      <div className="flex flex-col justify-between w-full h-full">
        <div className="flex flex-col justify-between">
          <Controller
            name="name" control={control} defaultValue=""
            render={({ field: { onChange, value, name }, fieldState: { invalid } }) => (
              <Input
                isRequired
                isClearable
                type="text"
                label="Name"
                placeholder="Joe Smith"
                description="Please enter the recepient's full legal name"

                onClear={() => setValue(name, "")}
                onChange={onChange}
                value={value}

                validationState={invalid ? "invalid" : "valid"}
                errorMessage={invalid && "Please enter the receipient's name"}
              />
            )}
          />
          <Controller
            name="email" control={control} defaultValue=""
            render={({ field: { onChange, value, name }, fieldState: { invalid } }) => (
              <Input
                isRequired
                isClearable
                type="email"
                label="Email"
                placeholder="joe@example.com"

                className="mt-2"

                onClear={() => setValue(name, "")}
                onChange={onChange}
                value={value}

                validationState={invalid ? "invalid" : "valid"}
                errorMessage={invalid && "Please enter a valid email address"}
              />
            )}
          />
        </div>
        <Divider orientation="horizontal" className="my-4" />
        <Button variant="flat" color="primary" className="w-full" onClick={handleSubmit(onSubmit)}>
          <div className="flex flex-row items-center justify-start">
            <span>Add Payee</span>
            <span><ArrowRightIcon className="w-4 h-4 ml-2" /></span>
          </div>
        </Button>
      </div>
    </Card>
  )
}

const Payee = (props: { payee: { name: string, email: string, picture?: string }, mutate: KeyedMutator<any> }) => {
  const { payee, mutate } = props;

  const user = useUser();
  const { control, handleSubmit, setValue } = useForm<PayeeInputs>({
    resolver: zodResolver(PayeeSchema),
    mode: "onSubmit",
  });

  const onSubmit: SubmitHandler<PayeeInputs> = async (data) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payees`, {
      method: 'POST',
      body: JSON.stringify({
        op: "update",
        payees: [data]
      }),

      headers: {
        'Authorization': `Bearer ${user.data.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      mutate({ data: await res.json() })
    }
  }

  const openDeleteModal = () => setDeleteOpen(true);
  const onDelete = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payees`, {
      method: 'POST',
      body: JSON.stringify({
        op: "remove",
        payees: [{
          name: payee.name,
          email: payee.email
        }]
      }),

      headers: {
        'Authorization': `Bearer ${user.data.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      mutate({ data: await res.json() })
    }
  };

  const [isEditable, setEditable] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <Card className="max-w-sm p-6">
      <Modal isOpen={deleteOpen} isDismissable onClose={() => setDeleteOpen(false)}>
        <ModalContent>
          <ModalBody className="p-6">
            <span>Are you sure you wish to delete {payee.name} as a Payee?</span>
            <Divider orientation="horizontal" className="my-2" />
            <div className="flex flex-row w-full">
              <Button variant="flat" color="primary" className="w-full" onClick={() => setDeleteOpen(false)}>
                <span>Cancel</span>
              </Button>
              <Button variant="flat" color="danger" className="w-full ml-2" onClick={() => { setDeleteOpen(false); onDelete() }}>
                <span>Delete</span>
              </Button>          
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
      <div className="flex flex-col justify-between w-full h-full">
        <div className="flex flex-col justify-between">
          <Controller
            name="name" control={control} defaultValue={payee.name}
            render={({ field: { onChange, value, name }, fieldState: { invalid } }) => (
              <Input
                isReadOnly={!isEditable}
                isRequired={isEditable}
                {...(isEditable ? { onClear: () => setValue(name, "") } : {})}
                isClearable={isEditable}
                type="text"
                label="Name"
                placeholder="Joe Smith"
                description={isEditable ? "Please enter the recepient's full legal name" : ""}

                onChange={onChange}
                value={value}

                validationState={invalid ? "invalid" : "valid"}
                errorMessage={invalid && "Please enter the receipient's name"}
              />
            )}
          />
          <Controller
            name="email" control={control} defaultValue={payee.email}
            render={({ field: { onChange, value, name }, fieldState: { invalid } }) => (
              <Input
                isReadOnly={!isEditable}
                isRequired={isEditable}
                {...(isEditable ? { onClear: () => setValue(name, "") } : {})}
                isClearable={isEditable}
                type="email"
                label="Email"
                placeholder="joe@example.com"

                className="mt-2"

                onChange={onChange}
                value={value}

                validationState={invalid ? "invalid" : "valid"}
                errorMessage={invalid && "Please enter a valid email address"}
              />
            )}
          />
        </div>
        <Divider orientation="horizontal" className="my-4" />
        <div className="flex flex-row">
          <Button variant="flat" color="primary" className="w-full" onClick={isEditable ? () => { handleSubmit(onSubmit); setEditable(false); } : () => setEditable(true)}>
            <span>{isEditable ? "Save" : "Edit"} Payee</span>
          </Button>
          {!isEditable &&
            <Button variant="flat" color="danger" className="w-full ml-2" onClick={() => openDeleteModal()}>
              <span>Delete</span>
            </Button>
          }
          {isEditable &&
            <Button variant="flat" color="danger" className="w-full ml-2" onClick={() => setEditable(false)}>
              <span>Cancel</span>
            </Button>
          }
        </div>
      </div>
    </Card>
  )
}

export default () => {
  const user = useUser();
  const { data, isLoading, error } = useSWR(['/api/payees', {
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
  });

  if (isLoading) return (
    <>
      <div className="flex flex-row justify-center mb-6">
        <h1 className="text-2xl">Payees</h1>
      </div>
      <div className="flex w-full flex-row justify-center items-center">
        <Card className="max-w-sm gap-4 p-6">
          <div className="flex flex-row">
            <Skeleton className="w-32 h-32 rounded-lg bg-default-300" />
            <div className="flex flex-col w-full ml-2">
              <Skeleton className="w-3/5 h-10 rounded-lg bg-default-300" />
              <Skeleton className="w-4/5 h-10 mt-2 rounded-lg bg-default-300" />
            </div>
          </div>
        </Card>
      </div>
    </>
  )

  return (
    <>
      <div className="flex flex-row justify-center mb-6">
        <h1 className="text-2xl mr-4">Payees</h1>
        {data.data.payees.length != 0 && (
          <Button isIconOnly variant="flat" color="primary">
            <PlusIcon className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div className="flex w-full flex-row justify-center items-center gap-4">
        {data.data.payees.map((item: { name: string, email: string, picture?: string }) =>
          <Payee key={item.email} payee={item} mutate={mutate} />
        )}
        <EmptyPayee mutate={mutate} />
      </div>
    </>
  )
}