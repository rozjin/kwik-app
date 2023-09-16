'use client'

import { Card, CardHeader, CardBody, Divider, Dropdown, DropdownTrigger, Button, DropdownMenu, DropdownItem, Table, TableHeader, TableColumn, TableBody, TableRow, Skeleton, CardFooter, TableCell, card, Listbox, ListboxItem, Input } from "@nextui-org/react";
import { default as useUser } from '@/kwik/hooks/user';
import fetcher, { FetchError } from "@/kwik/app/fetcher";
import useSWR from 'swr';
import React, { useCallback, useState } from "react";

import { useForm, Controller, SubmitHandler } from "react-hook-form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { autoUpdate, offset, size, useDismiss, useFloating, useInteractions } from "@floating-ui/react";

import matchAll from 'string.prototype.matchall';
import { ArrowRightIcon } from "@heroicons/react/outline";

type TransferInputs = {
  payee: string,
  currency: string,

  amount: number,
  desc?: string
}

const currencies = ["NZD", "AUD", "CAD", "USD"];
const TransferSchema = z.object({
  payee: z.string().email(),

  currency: z.enum(["NZD", "AUD", "CAD", "USD"]),
  amount: z.number()
      .refine(x => x > 0),

  desc: z.string().optional(),
})

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

  const getHighlights = (payees: {
    name: string, email: string, picture?: string
  }[],
  input: string): { email: string, matches: { text: string, match: boolean }[] }[] => {
    const results: { email: string, matches: { text: string, match: boolean }[] }[] = []
    for (const payee of payees) {
      const text = payee.email;
      const indexes = [...matchAll(text, new RegExp(input, 'gi'))];
      const matches: { text: string, match: boolean }[] = []

      if (indexes.length == 0) continue;

      var offset = 0;
      for(const match of indexes.filter(a => a.index != undefined)) {
        if ((match.index as number) != 0) {
          matches.push(
            { text: text.substring(offset, match.index), match: false },
          )
        }
        
        matches.push(
          { text: text.substring(match.index as number, (match.index as number) + match[0].length), match: true }
        )

        offset = (match.index as number) + match[0].length;
      }
      matches.push({ text: text.substring(offset), match: false });

      results.push({
        email: text,
        matches: matches
      })
    }

    return results;
  }

  const { control, handleSubmit, setValue, watch } = useForm<TransferInputs>({
    resolver: zodResolver(TransferSchema),
    mode: "onSubmit",
  });

  const [ payeesOpen, setPayeesOpen ] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open: payeesOpen,
    onOpenChange: setPayeesOpen,

    middleware: [offset(12), size({ apply({elements, rects}) {
      Object.assign(elements.floating.style, {
        width: `${rects.reference.width + 24}px`
      })
    }})],
    whileElementsMounted: autoUpdate
  });

  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([
    dismiss
  ]);

  const onSubmit: SubmitHandler<TransferInputs> = async (data) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transfer`, {
      method: 'POST',
      body: JSON.stringify(data),

      headers: {
        'Authorization': `Bearer ${user.data.token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  if (isLoading) return (
    <>
      <div className="flex flex-col items-center justify-center mb-6">
        <h1 className="text-2xl">Transfer</h1>
      </div>
      <Card className="gap-4 p-6 max-w-sm">
        <Skeleton className="rounded-lg">
          <div className="h-32 rounded-lg bg-default-300"></div>
        </Skeleton>
          <div className="flex flex-row justify-between">
            <Skeleton className="w-2/3 rounded-lg">
              <div className="h-10 rounded-lg bg-default-300"></div>
            </Skeleton>
            <Skeleton className="w-1/3 ml-2 rounded-lg">
              <div className="h-10 rounded-lg bg-default-300"></div>
            </Skeleton>
          </div>
      </Card>
    </>
  )

  return (
    <>
      <div className="flex flex-col items-center justify-center mb-6">
        <h1 className="text-2xl">Transfer</h1>
        <Card className="flex flex-col items-center justify-center max-w-sm p-6 mt-2">
          <Controller
            name="payee" control={control} defaultValue=""
            render={({ field: { onChange, value, name }, fieldState: { invalid } }) => (
              <Input
                isRequired
                isClearable

                type="text"
                label="Payee"
                placeholder="joe@example.com"

                onClear={() => {

                  setValue(name, "")
                }}

                onChange={(e) => {


                  onChange(e);
                  data.data.payees.length > 0 ? setPayeesOpen(true) : void(0);
                }}
                value={value}

                ref={refs.setReference}
                {...getReferenceProps()}

                validationState={invalid ? "invalid" : "valid"}
                errorMessage={invalid && "Please enter a valid payee"}
              />
            )}
          />
          {payeesOpen &&
            <Listbox
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}

              aria-label="Payee Suggestions"

              className="z-20 rounded-lg bg-default-100"
              items={getHighlights(data.data.payees, watch("payee"))}

              onAction={async (email) => {
                setValue("payee", email as string)
                setPayeesOpen(false)
              }}
            >
              {(item: { email: string, matches: { text: string, match: boolean }[] }) => (
                <ListboxItem
                  key={item.email}
                  textValue={item.email}
                  showDivider={true}
                >
                  {item.matches.map((match, index) => (
                    <span
                      key={index}
                      className={`${match.match ? "text-primary" : ""}`}
                    >{match.text}</span>
                  ))}
                </ListboxItem>
              )}
            </Listbox>
          }

          <Divider orientation="horizontal" className="my-4" />
          <Controller
            name="desc" control={control} defaultValue=""
            render={({ field: { onChange, value, name }, fieldState: { invalid } }) => (
              <Input
                isClearable

                type="text"                
                label="Description"
                placeholder="For nell."

                onClear={() => setValue(name, "")}
                onChange={onChange}
                value={value}
              />
            )}
          />
          <div className="flex flex-row w-full mt-2">
            <Controller
              name="amount" control={control} defaultValue={0}
              render={({ field: { onChange, value, name }, fieldState: { invalid } }) => (
                <Input
                  isRequired
                  isClearable

                  type="number"                  
                  label="Amount"
                  placeholder="1000"

                  onClear={() => setValue(name, 0)}
                  onChange={(e) => setValue(name, Number(e.target.value))}
                  value={String(value)}

                  validationState={invalid ? "invalid" : "valid"}
                  errorMessage={invalid && "Please enter a valid amount"}

                  startContent={"$"}
                />
              )}
            />
            <Controller
              name="currency" control={control} defaultValue="NZD"
              render={({ field: { onChange, value} }) => (
                <Dropdown>
                  <DropdownTrigger>
                    <Button className="h-[3.5rem] capitalize ml-2" variant="flat">
                      {value}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Currency"
                    variant="flat"
                    disallowEmptySelection
                    selectionMode="single"
                    selectedKeys={value}
                    onSelectionChange={onChange}
                    items={currencies.map((item: string) => ({ currency: item }))}
                  >
                    {(item) => (
                      <DropdownItem
                        key={(item as { currency: string }).currency}
                        textValue={(item as { currency: string }).currency}
                      >
                        <span>{(item as { currency: string }).currency}</span>
                      </DropdownItem>
                    )}
                  </DropdownMenu>
                </Dropdown>
              )}
            />
          </div>
          <Divider orientation="horizontal" className="my-2" />
          <Button variant="flat" color="primary" className="flex flex-row justify-between w-full mt-2" onClick={handleSubmit(onSubmit)}>
            <span>Send</span>
            <span><ArrowRightIcon className="w-4 h-4" /></span>
          </Button>
        </Card>
      </div>
    </>
  )
}