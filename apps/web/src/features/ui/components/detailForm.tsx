"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ca } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";

import { UsersModel } from "@gramflow/db/prisma/zod";
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
import { motion } from "framer-motion";

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

const emailFormSchema = z.object({
  email: z.string().email(),
});

const otpFormSchema = z.object({
  otp: z.string().min(4).max(4, {
    message: "OTP must be at least 4 characters.",
  }),
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
  EMAIL,
  OTP,
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

  const [currentStep, setCurrentStep] = useState(FormState.EMAIL);
  const [token, setToken] = useState("");

  const description = {
    [FormState.EMAIL]:
      "Please enter your email address to pre-fill the saved details. We will send an OTP to verify your email address.",
    [FormState.OTP]: "Please enter the OTP sent to your email address.",
    [FormState.ADDRESS]: "Enter your address to get your order delivered.",
  };

  const otpHookForm = useForm<z.infer<typeof otpFormSchema>>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      otp: "",
    },
  });

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

  const emailHookForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: "",
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
    fetch("/api/order", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ id: orderId, country: "India", ...values }),
    })
      .then((res) => {
        if (res.ok) {
          // show success
          console.log("Success");
          addressHookForm.reset();
          emailHookForm.reset();
          router.push(`/order/success/${orderId}`);
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

  async function onEmailSubmit(values: z.infer<typeof emailFormSchema>) {
    setLoading(true);
    console.log(values);

    try {
      addressHookForm.setValue("email", values.email);
      //send otp
      const otpJson = await generateOtp();
      console.log(otpJson);
      if (otpJson.success)
        // show otp form
        setCurrentStep(FormState.OTP);
      else {
        // show error
        emailHookForm.setError("email", {
          type: "custom",
          message: "We couldn't generate an OTP for this email.",
        });
        console.log("Error");
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  async function generateOtp() {
    const otpRes = await fetch(
      `/api/otp?email=${emailHookForm.getValues("email")}&order_id=${orderId}`,
    );
    if (!otpRes.ok) {
      otpHookForm.setError("otp", {
        type: "custom",
        message: "Couldn't generate OTP",
      });
    }
    toast.success("OTP sent to your email address!");
    return await otpRes.json();
  }

  async function onOtpSubmit(values: z.infer<typeof otpFormSchema>) {
    try {
      setLoading(true);
      console.log(values);
      const res = await fetch(
        `/api/otp?otp=${values.otp}&email=${emailHookForm.getValues("email")}`,
        { method: "POST" },
      );
      if (!res.ok) {
        otpHookForm.setError("otp", {
          type: "custom",
          message: "Invalid OTP",
        });
      }
      const jsonRes = await res.json();
      if (jsonRes.success) {
        //checking if the token is present in the request
        if (jsonRes.token) {
          setToken(jsonRes.token);
        } else {
          //show error
          otpHookForm.setError("otp", {
            type: "custom",
            message: "OTP Verification Failed",
          });
        }
        if (jsonRes.user) {
          // iterate the object and use the key value to set the form value in a loop
          console.log({ userJson: jsonRes.user });
          for (const [key, value] of Object.entries(jsonRes.user)) {
            // @ts-ignore
            if (value && !(value instanceof Date) && value.length > 0)
              console.log(key, value);
            // @ts-ignore
            addressHookForm.setValue(key, value);
          }
        }
        setCurrentStep(FormState.ADDRESS);
      } else {
        // show error
        otpHookForm.setError("otp", {
          type: "custom",
          message: "Invalid OTP",
        });
        console.log("Error");
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  const EmailForm = () => {
    return (
      <Form {...emailHookForm}>
        <form
          onSubmit={emailHookForm.handleSubmit(onEmailSubmit)}
          className="w-5/6 space-y-8 md:max-w-sm"
        >
          <FormField
            control={emailHookForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input disabled={loading} placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className={"w-full"} type="submit">
            <span>
              {loading && <Loader2 className={"mr-2 animate-spin text-xs"} />}
            </span>
            {!loading && <p>Next</p>}
          </Button>
        </form>
      </Form>
    );
  };
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
                  <Input disabled={true} placeholder="Your email" {...field} />
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
                  <Input
                    disabled={loading}
                    placeholder="Here Goes the Prettiest Name!"
                    {...field}
                  />
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

  const OtpForm = () => {
    return (
      <Form {...otpHookForm}>
        <form
          onSubmit={otpHookForm.handleSubmit(onOtpSubmit)}
          className="w-5/6 space-y-8 md:max-w-sm"
        >
          <FormField
            control={otpHookForm.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>OTP</FormLabel>
                <FormControl>
                  <Input
                    maxLength={4}
                    disabled={loading}
                    placeholder="4 digit OTP"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center justify-between">
            <p
              className="my-1 cursor-pointer text-sm text-pink-700 underline"
              onClick={() => {
                generateOtp();
              }}
            >
              Resend OTP
            </p>
            <p
              className="my-1 cursor-pointer text-sm text-pink-700 underline"
              onClick={() => {
                //reload the page
                if (window) window.location.reload();
              }}
            >
              Change Email
            </p>
          </div>
          <Button className={"w-full"} type="submit">
            <span>
              {loading && <Loader2 className={"mr-2 animate-spin text-xs"} />}
            </span>
            {!loading && <p>Next</p>}
          </Button>
        </form>
      </Form>
    );
  };

  return (
    <div className={"mt-32"}>
      <h1 className="pinkmd:text-6xl mt-4 bg-gradient-to-br from-black via-[#171717] to-[#4b4b4b] bg-clip-text pb-4 pt-4 text-center text-4xl font-semibold tracking-tight text-transparent">
        {currentStep === FormState.OTP ? "Verify OTP" : "Details Required"}
      </h1>
      <p className={"text-center text-sm text-muted-foreground md:text-base"}>
        {
          // @ts-ignore
          description[currentStep.valueOf()]
        }
      </p>
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }} className={"my-12 flex w-full items-center justify-center"}>
        {currentStep === FormState.EMAIL && EmailForm()}
        {currentStep === FormState.OTP && OtpForm()}
        {currentStep === FormState.ADDRESS && AddressForm()}
      </motion.div>
    </div>
  );
}
