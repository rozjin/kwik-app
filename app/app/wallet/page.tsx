'use client'

import { Card, CardHeader, CardBody, Divider, Dropdown, DropdownTrigger, Button, DropdownMenu, DropdownItem, Table, TableHeader, TableColumn, TableBody, TableRow, Skeleton, CardFooter, TableCell, card } from "@nextui-org/react";
import { ArrowRightIcon, PlusIcon } from '@heroicons/react/solid';
import { default as useUser } from '@/kwik/hooks/user';
import fetcher, { FetchError } from "@/kwik/app/fetcher";
import useSWR from 'swr';
import { useRouter } from "next/navigation";
import PaymentCardIcon from '@/kwik/components/PaymentCardIcon';
import { FastAverageColor } from 'fast-average-color';
import React, { useCallback, useState } from "react";
import PartnerIcon from "@/kwik/components/PartnerIcon";

type StripeCard = {
  brand: string,
  funding: string,
  digits: number,
  expiry: string
};

const PaymentCard = ({ card } : { card: StripeCard }) => {
  const [ cardColor, setCardColor ] = useState<string>("");
  const fac = new FastAverageColor();
  const cardIconRef: React.RefCallback<HTMLImageElement> = useCallback(async(node) => {
    if (node) {
      const color = (await fac.getColorAsync(node.src, {
        algorithm: 'dominant'
      })).hex;
      
      setCardColor(color);
    }
  }, []);

  return (
    <Card className="max-w-sm gap-4 p-0 mb-6" key={card.expiry}>
      <div className="flex flex-col justify-between h-48 rounded-lg" style={{
        backgroundColor: cardColor
      }}>
        <div className="flex flex-row justify-between mx-4 mt-4">
          <PaymentCardIcon type={card.brand} size={64} ref={cardIconRef} />
          <PartnerIcon src="/icons/partners/stripe.svg" size={72} />
        </div>
        <div className="flex flex-row justify-between mx-1 mb-4 text-xl">
          <div className="flex flex-row items-center justify-center w-3/4">
            {
              {
                'visa': <span className="font-mono">&#9679;&#9679;&#9679;&#9679;&nbsp;&#9679;&#9679;&#9679;&#9679;&nbsp;&#9679;&#9679;&#9679;&#9679;&nbsp;{card.digits}</span>,
                'mastercard': <span className="font-mono">&#9679;&#9679;&#9679;&#9679;&nbsp;&#9679;&#9679;&#9679;&#9679;&nbsp;&#9679;&#9679;&#9679;&#9679;&nbsp;{card.digits}</span>,
                'discover': <span className="font-mono">&#9679;&#9679;&#9679;&#9679;&nbsp;&#9679;&#9679;&#9679;&#9679;&nbsp;&#9679;&#9679;&#9679;&#9679;&nbsp;{card.digits}</span>,
                'amex': <span className="font-mono">&#9679;&#9679;&#9679;&#9679;&nbsp;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&nbsp;&#9679;&nbsp;{card.digits}</span>
              }[card.brand]
            }
          </div>
          <div className="flex flex-row items-center justify-center w-1/4 ml-2">
            <span className="font-mono">{card.expiry.padStart(5, '0')}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default () => {
  const user = useUser();
  const router = useRouter();
 
  const { data, isLoading, error } = useSWR(['/api/cards', {
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

  const onSubmit = async() => {
    const req = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cards`, {
      method: 'POST',
      body: JSON.stringify({
        "op": "new"
      }),

      headers: {
        'Authorization': `Bearer ${user.data.token}`,
        'Content-Type': 'application/json'
      },

      referrerPolicy: "unsafe-url"
    });

    const res = await req.json();
    if (req.ok) {
      router.push(res.data.url);
    }
  }

  if (isLoading) return (
    <>
      <div className="flex flex-row justify-center mb-6">
        <h1 className="text-2xl mr-4">Wallet</h1>
      </div>
      <div className="flex-row flex justify-center">
        <Card className="gap-4 p-6 max-w-sm w-full">
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
      </div>
    </>
  )

  return (
    <>
      <div className="flex flex-row justify-center mb-6">
        <h1 className="text-2xl mr-4">Wallet</h1>
        {data.data.length != 0 && (
          <Button isIconOnly variant="flat" color="primary" onPress={onSubmit}>
            <PlusIcon className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div className="flex flex-row justify-center">
        {data.data.map((card: StripeCard) => <PaymentCard card={card} key={card.expiry} />)}
        {data.data.length == 0 && (
          <Card className="gap-2 p-6 max-w-sm">
            <div className="flex items-center justify-center h-32 rounded-lg">
              <span>You have no cards setup.</span>
            </div>
            <Button variant="flat" color="primary" className="justify-center w-full" onPress={onSubmit}>
              <div className="flex flex-row items-center justify-start">
                <span>Add Card</span>
                <span><ArrowRightIcon className="w-4 h-4" /></span>
              </div>
            </Button>
          </Card>
        )}
      </div>
    </>
  )
}