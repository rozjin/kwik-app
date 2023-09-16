'use client'

import { Card, CardHeader, CardBody, Divider, Dropdown, DropdownTrigger, Button, DropdownMenu, DropdownItem, Table, TableHeader, TableColumn, TableBody, TableRow, Skeleton, CardFooter, TableCell, Chip, Accordion, AccordionItem } from "@nextui-org/react";
import { MenuIcon } from '@heroicons/react/outline';
import { ArrowRightIcon } from '@heroicons/react/solid';
import { default as useUser } from '@/kwik/hooks/user';
import fetcher, { FetchError } from "@/kwik/app/fetcher";
import useSWR from 'swr';
import Link from "next/link";

const Transfers = () => {
  const user = useUser();
  const { data, isLoading, error } = useSWR(['/api/transfer', {
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
    <Table aria-label="Transactions table" className="mt-4">
      <TableHeader>
        <TableColumn>Date</TableColumn>
        <TableColumn>Amount</TableColumn>
        <TableColumn>Balance</TableColumn>
        <TableColumn>Status</TableColumn>
      </TableHeader>
      <TableBody emptyContent={
          <Skeleton className="rounded-lg">
            <div className="rounded-lg h-36 bg-default-300"></div>
          </Skeleton>
        }
      >
      </TableBody>
    </Table>
  )

  return (
    <Table aria-label="Transactions table" className="mt-4">
      <TableHeader>
        <TableColumn>Date</TableColumn>
        <TableColumn>Amount</TableColumn>
        <TableColumn>Balance</TableColumn>
        <TableColumn>Status</TableColumn>
      </TableHeader>
      <TableBody 
        emptyContent={"No transactions to display"} 
        items={data.data.transfers}
      >{(item: {
        id: number,

        status: string,
        last_balance: number,
        amount: number,
        date: string,

        desc?: string,

        to?: {
            email: string,
            name: string
        },

        from?: {
            email: string,
            name: string
        }
      }) => (
        <TableRow key={item.id}>
          <TableCell>{new Date(item.date).toLocaleDateString("en-NZ")}</TableCell>
          <TableCell className={`${!!item.to ? "text-danger" : "text-success"}`}>{!!item.to ? "-" : ""}{item.amount}</TableCell>
          <TableCell>{item.last_balance}</TableCell>
          <TableCell>
            <Accordion>
              <AccordionItem 
                key="1" 
                aria-label={`Transaction on ${new Date(item.date).toLocaleDateString("en-NZ")}`}
                hideIndicator
                isCompact
                title={{
                  "INIT": <Chip variant="flat" color="primary">Initiated</Chip>,
                  "CHARGING": <Chip variant="flat" color="warning">Charging</Chip>,
                  "SUCCESS": <Chip variant="flat" color="success">Finished</Chip>,
                  "FAILED": <Chip variant="flat" color="danger">Failed</Chip>
                }[item.status]}
              >
                <p className="text-md">{!!item.to ? "Sent to" : "Received from"} {!!item.to ? item.to.name : item.from?.name}</p>
                {!!item.desc ? <>
                  <p className="text-md">Note: </p>
                  <p className="text-default-400">{item.desc}</p>
                </>: ""}  
              </AccordionItem>
            </Accordion>
          </TableCell>
        </TableRow>
      )}
      </TableBody>
    </Table>
  )
}

export default () => {
  const user = useUser();
  const { data, isLoading, error } = useSWR(['/api/money', {
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
      <Card className="gap-4 p-6">
        <Skeleton className="rounded-lg">
          <div className="rounded-lg h-14 bg-default-300"></div>
        </Skeleton>
        <Skeleton className="rounded-lg">
          <div className="h-20 rounded-lg bg-default-300"></div>
        </Skeleton>
        <Skeleton className="rounded-lg">
          <div className="h-10 rounded-lg bg-default-300"></div>
        </Skeleton>
      </Card>
      <Transfers />
    </>
  )

  return (
    <>
      <Card className="p-6">
        <CardHeader className="justify-between p-0 m-0 mb-1">
            <h4 className="text-lg font-bold">Kwik Balance</h4>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  className="p-2"
                  color="primary"
                  variant="flat"
                >
                    <MenuIcon />
                  </Button>
              </DropdownTrigger>

              <DropdownMenu aria-label="Balance Menu">
                <DropdownItem key="wallet-link" className="text-primary" color="primary">
                  <Link href='/app/wallet' style={{
                    textDecoration: 'none'
                  }}>Go to Wallet</Link>
                </DropdownItem>
                <DropdownItem key="help">Help</DropdownItem>
              </DropdownMenu>
            </Dropdown>
        </CardHeader>
        <CardBody className="p-0 m-0 overflow-visible">
          <div className="text-4xl">
            <span>$</span>
            <span>{data.data.balance}</span>
          </div>
        </CardBody>
        <CardFooter className="relative justify-between px-0 pb-0 mt-1.5">
          <span>Available</span>
          <Button
            color="primary"
            variant="flat"
            endContent={<ArrowRightIcon className="w-4 h-4" />}
          >
            <Link href='/app/wallet' style={{
              textDecoration: 'none'
            }}>Add Funds</Link>            
          </Button>
        </CardFooter>
      </Card>
        { /*
          accepted Boolean @default(false)

    currency String @db.VarChar(3)
    amount Float
    last_balance Float

    desc String @db.Text
    date DateTime @default(now())

        */ }
      <Transfers />
    </>
  )
}