'use client'

import usePlacesService from 'react-google-autocomplete/lib/usePlacesAutocompleteService';

import { Card, CardHeader, CardBody, Divider, Button, Listbox, ListboxItem, Table, TableHeader, TableColumn, TableBody, TableRow, Skeleton, CardFooter, TableCell, Input, Modal, Popover, PopoverTrigger, PopoverContent, Dropdown, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { MenuIcon, SearchIcon } from '@heroicons/react/outline';
import { ArrowRightIcon } from '@heroicons/react/solid';
import { default as useUser } from '@/kwik/hooks/user';

import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import validator from 'validator';

import fetcher, { FetchError } from "@/kwik/app/fetcher";
import useSWR from 'swr';
import { useEffect, useRef, useState } from 'react';
import { useFloating, autoUpdate, offset, size, useDismiss, useInteractions } from '@floating-ui/react';

type DetailsInputs = {
  user?: {
    name: string,
    email: string,
    phone_number: string
  }

  address?: {
    line: string,
    unit?: string,

    city?: string,
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

  city: z.string().nonempty().optional(),
  region: z.string().nonempty(),

  postcode: z.string().max(6).min(4).nonempty()
});

const DetailsSchema = z.object({
  user: UserSchema.optional(),
  address: AddressSchema.optional()
});

export default () => {
  const [predictionsOpen, setPredictionsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: predictionsOpen,
    onOpenChange: setPredictionsOpen,

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


  const getHighlights = (desc: string, matches: {
    offset: number,
    length: number
  }[]): { text: string, match: boolean }[] => {
    const strings = [];
    var offset = 0;
    for(const match of matches.sort((a, b) => a.offset - b.offset)) {
      strings.push(
        { text: desc.substring(offset, match.offset), match: false },
        { text: desc.substring(match.offset, match.offset + match.length), match: true }
      )

      offset = match.offset + match.length;
    }
    strings.push({ text: desc.substring(offset), match: false });

    return strings;
  }

  const user = useUser();
  const {
    placesService,
    placePredictions,
    getPlacePredictions,
    isPlacePredictionsLoading
  } = usePlacesService({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY
  });

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

  const fetchAddress = async (place_id: string): Promise<{
    premise: string,
    line: string,

    city?: string,
    region: string,

    postcode: string
  }> => {
    const mappings = {
      premise: ["street_number"],
      line: ["route", "street_address"],

      city: [
        "locality",
        "sublocality",
        "sublocality_level_1",
        "sublocality_level_2",
        "sublocality_level_3",
        "sublocality_level_4"
      ],

      region: [
        "administrative_area_level_1",
        "administrative_area_level_2",
        "administrative_area_level_3",
        "administrative_area_level_4",
        "administrative_area_level_5"
      ],

      postcode: ["postal_code"]
    }

    return await new Promise((resolve, reject) => {
      const address = {
        premise: "",
        line: "",

        city: "",
        region: "",

        postcode: "",
        country: "NZ"
      }

      placesService?.getDetails({
        placeId: place_id,

        fields: ['address_components', 'formatted_address', 'type'],
        region: 'NZ'
      }, (place) => {
        place?.address_components?.forEach(component => {
          for (const mapping in mappings) {
            if (mappings[mapping as keyof typeof mappings].includes(component.types[0])) {
              address[mapping as keyof typeof address] = component.long_name;
            }
          }
        })

        resolve(address)
      })
    })
  }

  const { control, handleSubmit, setValue, setFocus } = useForm<DetailsInputs>({
    resolver: zodResolver(DetailsSchema),
    mode: "onSubmit",
  });

  const onSubmit: SubmitHandler<DetailsInputs> = async (data) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/update`, {
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
      <div className="flex flex-row justify-center">
        <div className="flex flex-col">
          <h1 className="text-2xl">Hey there, just a second.</h1>
          <h4 className="mt-6 text-md">Personal Information</h4>
        </div>
      </div>
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
      <div className="flex flex-row justify-center">
        <div className="flex flex-col">
          <h1 className="text-2xl">Hello,&nbsp;{user.data.user.name.split(' ')[0]}</h1>
          <h4 className="mt-6 text-md">Personal Information</h4>
        </div>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        <Controller
          name="user.name" control={control} defaultValue={user.data.user.name}
          render={({ field: { onChange, value, name }, fieldState: { invalid } }) => (
            <Input
              isRequired
              isClearable
              type="text"
              label="Name"
              placeholder="Joe Smith"
              description="Please enter your full legal name"

              onClear={() => setValue(name, "")}
              onChange={onChange}
              value={value}

              validationState={invalid ? "invalid" : "valid"}
              errorMessage={invalid && "Please enter your name"}
            />
          )}
        />

        <Controller
          name="user.email" control={control} defaultValue={user.data.user.email}
          render={({ field: { onChange, value, name }, fieldState: { invalid } }) => (
            <Input
              isRequired
              isClearable
              type="email"
              label="Email"
              placeholder="joe@example.com"

              onClear={() => setValue(name, "")}
              onChange={onChange}
              value={value}

              validationState={invalid ? "invalid" : "valid"}
              errorMessage={invalid && "Please enter a valid email address"}
            />
          )}
        />

        <Controller
          name="user.phone_number" control={control} defaultValue={user.data.user.phone_number}
          render={({ field: { onChange, value, name }, fieldState: { invalid } }) => (
            <Input
              isRequired
              isClearable
              type="tel"
              label="Phone Number"
              placeholder="0214443335"

              onClear={() => setValue(name, "")}
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
        <div className="flex flex-row justify-between">
          <Controller
            name="address.line" control={control} defaultValue={data.data.address.line}
            render={({ field: { onChange, value, name }, fieldState: { invalid } }) => (
              <Input
                isRequired
                isClearable

                type="text"
                label="Line"
                placeholder="123 Main Street"

                onClear={() => {
                  getPlacePredictions({ input: "", componentRestrictions: {
                    country: "NZ"
                  }})
                  setValue(name, "")
                }}

                onChange={(e) => {
                  getPlacePredictions({ input: e.target.value, componentRestrictions: {
                    country: "NZ"
                  }})

                  onChange(e);
                  placePredictions.length > 0 ? setPredictionsOpen(true) : void(0);
                }}
                value={value}
                
                ref={refs.setReference}
                {...getReferenceProps()}

                validationState={invalid ? "invalid" : "valid"}
                errorMessage={invalid && "Please enter the address line"}
              />
            )}
          />
          {predictionsOpen &&
            <Listbox
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}

              aria-label="Address Suggestions"

              className="z-10 rounded-lg bg-default-100"
              items={placePredictions}

              onAction={async (place_id) => {
                const address = await fetchAddress(place_id as string);

                setValue("address", {
                  line: address.premise + " " + address.line,
                  region: address.region,
                  city: address.city,

                  postcode: address.postcode
                });

                setPredictionsOpen(false)
              }}
            >
              {(item) => (
                <ListboxItem
                  key={item.place_id}
                  textValue={item.description}
                  showDivider={true}
                >
                  {getHighlights(item.description, item.matched_substrings)
                  .map((part, index) => (
                    <span
                      key={index}
                      className={`${part.match ? "text-primary" : ""}`}
                    >
                      {part.text}
                    </span>
                  ))}
                </ListboxItem>
              )}
            </Listbox>
          }
          <Controller
            name="address.unit" control={control} defaultValue={data.data.address.unit}
            render={({ field: { onChange, value, name }, fieldState: { invalid } }) => (
              <Input
                isClearable
                type="text"
                label="Unit"
                placeholder="Unit 101"

                className="w-1/3 ml-2"

                onClear={() => setValue(name, "")}
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
            render={({ field: { onChange, value, name }, fieldState: { invalid } }) => (
              <Input
                isClearable
                type="text"
                label="City"
                placeholder="Springfield"

                className="w-1/3"

                onClear={() => setValue(name, "")}
                onChange={onChange}
                value={value}

                validationState={invalid ? "invalid" : "valid"}
                errorMessage={invalid && "Please a valid city"}
              />
            )}
          />

          <Controller
            name="address.region" control={control} defaultValue={data.data.address.region}
            render={({ field: { onChange, value, name }, fieldState: { invalid } }) => (
              <Input
                isRequired
                isClearable
                type="text"
                label="Region"
                placeholder="Auckland"

                className="w-1/3 ml-2"

                onClear={() => setValue(name, "")}
                onChange={onChange}
                value={value}

                validationState={invalid ? "invalid" : "valid"}
                errorMessage={invalid && "Please a valid region"}
              />
            )}
          />

          <Controller
            name="address.postcode" control={control} defaultValue={data.data.address.postcode}
            render={({ field: { onChange, value, name }, fieldState: { invalid } }) => (
              <Input
                isRequired
                isClearable
                type="text"
                label="Postcode"
                placeholder="9011"

                className="w-1/3 ml-2"

                onClear={() => setValue(name, "")}
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