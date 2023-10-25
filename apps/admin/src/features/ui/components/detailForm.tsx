"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ca } from "date-fns/locale";
import { motion } from "framer-motion";
import { HomeIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Separator,
} from "@gramflow/ui";

const addressFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  house_number: z.string().min(2, {
    message: "Address must be at least 2 characters.",
  }),
  locality: z.string().min(2, {
    message: "Locality must be at least 2 characters.",
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters.",
  }),
  state: z.string().min(2, {
    message: "State must be at least 2 characters.",
  }),
  pincode: z.string().min(6).max(6, {
    message: "Pincode must be at least 6 characters.",
  }),
  phone_no: z.string().min(10).max(10, {
    message: "Phone Number must be at least 10 characters.",
  }),
  instagram_username: z.string().min(2, {}),
  landmark: z.string().nullish(),
  email: z.string().email(),
});

export type Root = Root2[];

export interface Root2 {
  Message: string;
  Status: string;
  PostOffice: PostOffice[];
}

export interface PostOffice {
  Name: string;
  Description: any;
  BranchType: string;
  DeliveryStatus: string;
  Circle: string;
  District: string;
  Division: string;
  Region: string;
  Block: string;
  State: string;
  Country: string;
  Pincode: string;
}

export enum FormState {
  IDLE,
  LOADING,
  ADDRESS,
}

async function getPincodeInfo(
  pincode: string,
): Promise<{ city: string; state: string }> {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`,
      );
      if (res.ok) {
        const data = (await res.json()) as Root;
        if (!data[0] || data[0].Status !== "Success") {
          reject("Error fetching pincode");
        }
        if (data[0] && data[0].PostOffice) {
          //iterate over the post office array and find the first one with a DeliveryStatus as "Delivery" and has a District and State
          const postOffice = data[0].PostOffice.find(
            (postOffice) =>
              postOffice.DeliveryStatus === "Delivery" &&
              postOffice.District &&
              postOffice.State,
          );
          if (postOffice) {
            resolve({ city: postOffice.District, state: postOffice.State });
          } else {
            reject("Error fetching pincode");
          }
        }
      } else {
        reject("Error fetching pincode");
      }
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
}

export function DetailForm({ orderId }: { orderId: string }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [currentStep, setCurrentStep] = useState(FormState.ADDRESS);

  const description = {
    [FormState.ADDRESS]:
      "Enter the customer's address to get their order delivered.",
  };

  const addressHookForm = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      name: "",
      house_number: "",
      city: "",
      state: "",
      pincode: "",
      phone_no: "",
      email: "",
      landmark: "",
      locality: "",
      instagram_username: "",
    },
  });

  useEffect(() => {
    console.log(currentStep);
  }, [currentStep]);

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof addressFormSchema>) {
    setLoading(true);
    console.log(values);
    // make a put request to the /api/order
    // with the values
    fetch("/api/add", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: orderId, country: "India", ...values }),
    })
      .then((res) => {
        if (res.ok) {
          // show success
          console.log("Success");
          addressHookForm.reset();
          router.push(`/`);
          console.log(res);
        } else {
          // show error
          toast.error("Error submitting the form");
          console.log(res);
        }
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const setPincodeInfo = (pincode: string) => {
    getPincodeInfo(pincode)
      .then((data) => {
        addressHookForm.clearErrors("pincode");
        if (data && data.city && data.state) {
          addressHookForm.setValue("city", data.city);
          addressHookForm.setValue("state", data.state);
        }
      })
      .catch((e) => {
        //set the error on the form for pincode
        console.log(e);
        console.log("Wrong pincode");
        addressHookForm.setError("pincode", {
          type: "custom",
          message: "Invalid Pincode",
        });
      });
  };

  useEffect(() => {
    const subscription = addressHookForm.watch((value, { name, type }) => {
      if (type === "change" && name === "pincode") {
        if (value.pincode?.length === 6) {
          setPincodeInfo(value.pincode);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [addressHookForm.watch]);

  const AddressForm = () => {
    return (
      <Form {...addressHookForm}>
        <form
          onSubmit={addressHookForm.handleSubmit(onSubmit)}
          className="w-5/6 space-y-8 animate-in fade-in duration-200 md:max-w-sm"
        >
          <FormField
            control={addressHookForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email <span className={"text-pink-400"}>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={addressHookForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name <span className={"text-pink-400"}>*</span>
                </FormLabel>
                <FormControl>
                  <Input disabled={loading} placeholder="Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={addressHookForm.control}
            name="house_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  House/Apartment No. <span className={"text-pink-400"}>*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="House/Apartment Number & Name"
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={addressHookForm.control}
            name="locality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Locality <span className={"text-pink-400"}>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Sector/Locality" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={addressHookForm.control}
            name="landmark"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Landmark</FormLabel>
                <FormControl>
                  {/*@ts-ignore*/}
                  <Input placeholder="Landmark" disabled={loading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className={"grid grid-cols-3 space-x-3"}>
            <div className={"col-span-1"}>
              <FormField
                control={addressHookForm.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Pincode <span className={"text-pink-400"}>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        maxLength={6}
                        type={"number"}
                        disabled={loading}
                        placeholder="Pincode"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className={"col-span-2"}>
              <FormField
                control={addressHookForm.control}
                name="phone_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Phone Number <span className={"text-pink-400"}>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        maxLength={10}
                        type={"number"}
                        disabled={loading}
                        placeholder="Phone Number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className={"grid grid-cols-2 gap-x-3"}>
            <FormField
              control={addressHookForm.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    City <span className={"text-pink-400"}>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input disabled={true} placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={addressHookForm.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    State <span className={"text-pink-400"}>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input disabled={true} placeholder="State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator className={"opacity-50"} />
          <FormField
            control={addressHookForm.control}
            name="instagram_username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Instagram Username <span className={"text-pink-400"}>*</span>
                </FormLabel>
                <FormControl>
                  <Input disabled={loading} placeholder="Username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className={"w-full"} type="submit">
            <span>
              {loading && <Loader2 className={"mr-2 animate-spin text-xs"} />}
            </span>
            {!loading && <p>Submit</p>}
          </Button>
        </form>
      </Form>
    );
  };
  return (
    <div className={"mt-32"}>
      <Button onClick={() => router.push(`/`)} variant={"outline"}>
        <HomeIcon className="h-4 w-4" />
      </Button>

      <h1 className="text-center text-lg font-semibold md:text-xl">
        Order- {orderId}
      </h1>
      <p className={"text-center text-sm text-muted-foreground md:text-base"}>
        {
          // @ts-ignore
          description[currentStep.valueOf()]
        }
      </p>
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={"my-12 flex w-full items-center justify-center"}
      >
        {currentStep === FormState.ADDRESS && AddressForm()}
      </motion.div>
    </div>
  );
}
