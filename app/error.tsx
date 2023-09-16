'use client'

import { RefreshIcon } from "@heroicons/react/outline"
import { Button, Card, Divider } from "@nextui-org/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { v4 as uuid } from 'uuid';

export default ({error, reset}: {error: Error, reset: () => void}) => {
  const router = useRouter();

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex flex-col items-center justify-center w-full h-screen px-6 max-w-7x">
      <Card className="max-w-sm p-6">
        <div className="flex flex-row justify-between">
          <h1 className="text-xl font-bold">Hm.</h1>
          <Button isIconOnly color="danger" variant="flat" onPress={() => router.refresh()}>
            <RefreshIcon className="w-4 h-4" />
          </Button>
        </div>
        <p className="mt-4">Something went wrong, please try again later.</p>
        {error.message && <p className="mt-4">Message: {error.message}</p>}

        <Divider orientation="horizontal" className="my-2" />
        <span className="text-sm text-default-400">If you seek support, please mention this ID: {uuid()}</span>
      </Card>
    </main>
  )
}