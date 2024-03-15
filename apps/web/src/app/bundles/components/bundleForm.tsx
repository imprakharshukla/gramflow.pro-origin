"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { UploadButton } from "@uploadthing/react";
import { motion } from "framer-motion";
import { Loader2, ShareIcon, SignalZero } from "lucide-react";
import ReactConfetti from "react-confetti";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  Button,
  Checkbox,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Textarea,
} from "@gramflow/ui";
import { AppConfig, cn } from "@gramflow/utils";
import { bundleFormSchema } from "@gramflow/utils/src/schema";

import { fontSerif } from "~/lib/fonts";
import useBundleQueryClient from "~/features/ui/hooks/use-bundle-query-client";

export const termsFormSchema = z.object({
  acceptTerms: z.boolean(),
});
export const emailFormSchema = z.object({
  email: z.string().email(),
});
export const verificationFormSchema = z.object({
  otp: z.string().length(4),
});

const bundleQueryClient = useBundleQueryClient();

enum FormState {
  Terms,
  Verification,
  OtpSent,
  OptVerified,
  Details,
  Success,
}

export default function BundleForm() {
  const {
    mutate: createBundleMutation,
    isLoading: createBundleLoading,
  } = bundleQueryClient.createBundle.useMutation();


  const createBundle = async (data: z.infer<typeof bundleFormSchema>) => {

    setLoading(true);
    createBundleMutation({
      body: {
        bundle: data
      }
    }, {
      onSuccess: (response) => {
        setBundleId(response.body.id);
        setFormStage(FormState.Success);
        setLoading(false);
      },
      onError: (error) => {
        console.log("Error", error);
        console.log("Something went wrong!");
        toast.error("Something went wrong!");
        setLoading(false);
      }
    });
  }

  const sendOtp = async (email: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/otp?email=${email}`, {
        method: "GET",
      });

      if (response.ok) {
        setFormStage(FormState.OtpSent);
      } else {
        console.log("Something went wrong!");
        toast.error("Something went wrong!");
      }
    } catch (e) {
      console.log("Something went wrong!");
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (data: { email: string; otp: string }) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/otp?email=${data.email}&otp=${data.otp}`,
        {
          method: "POST",
        },
      );
      if (!response.ok) {
        verficiationForm.setError("otp", {
          type: "custom",
          message: "Invalid OTP",
        });
      }
      const jsonRes = await response.json();
      console.log({ jsonRes });
      if (jsonRes.success) {
        //checking if the token is present in the request
        if (!jsonRes.token) {
          verficiationForm.setError("otp", {
            type: "custom",
            message: "OTP Verification Failed",
          });
          return;
        }
        form.setValue("email", emailForm.getValues("email"));
        form.setValue("otp", jsonRes.token);
        if (jsonRes.user) {
          form.setValue("name", jsonRes.user.name);
          form.setValue("phoneNumber", jsonRes.user.phone_no);
          form.setValue("instagramUsername", jsonRes.user.instagram_username);
        }
        setFormStage(FormState.Details);
      } else {
        // show error
        verficiationForm.setError("otp", {
          type: "custom",
          message: "Invalid OTP",
        });
        console.log("Error");
      }
    } catch (e) {
      console.log("Something went wrong!");
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(bundleFormSchema),
  });

  const { errors } = form.formState;

  const termsForm = useForm({
    resolver: zodResolver(termsFormSchema),
  });

  const emailForm = useForm({
    resolver: zodResolver(emailFormSchema),
  });
  const verficiationForm = useForm({
    resolver: zodResolver(verificationFormSchema),
  });

  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });
  const [confettiPieces, setConfettiPieces] = useState(100);

  useEffect(() => {
    // Check if window is defined (client side) before accessing its properties
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      // Initial size
      handleResize();

      window.addEventListener("resize", handleResize);

      // Clean up the listener when the component is unmounted
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  //log all the errors:
  useEffect(() => {
    console.log(errors);
  }, [errors]);

  useEffect(() => {
    // Gradually reduce confetti pieces after 4 seconds
    const timer = setInterval(() => {
      if (confettiPieces > 10) {
        setConfettiPieces(confettiPieces - 10);
      } else {
        clearInterval(timer);
      }
    }, 400);

    return () => clearInterval(timer);
  }, [confettiPieces]);

  const [formStage, setFormStage] = useState<FormState>(FormState.Terms);
  const [imageLoading, setImageLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bundleId, setBundleId] = useState<string | null>(null);

  function onEmailSubmit(values: z.infer<typeof emailFormSchema>, e: any) {
    console.log({ values });
    sendOtp(values.email);
    e.preventDefault();
  }

  function onOtpSubmit(values: z.infer<typeof verificationFormSchema>, e: any) {
    console.log({ values });
    verifyOtp({
      email: emailForm.getValues("email"),
      otp: values.otp,
    });
    e.preventDefault();
  }

  function onSubmit(values: z.infer<typeof bundleFormSchema>, e: any) {
    console.log({ values });
    createBundle(values);
    e.preventDefault();
  }

  useEffect(() => {
    console.log({ loading });
  }, [loading]);

  return (
    <div className="p-2 pb-10 text-justify md:p-10">

      {formStage == FormState.Success && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={confettiPieces}
          gravity={0.1}
          colors={["black", "pink"]}
        />
      )}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={""}
      >
        {formStage == FormState.Details && (
          <div className="rounded-md shadow">
            <img
              src="/bundles_header_img.jpg"
              className="object-fit my-0 rounded-md object-cover"
              alt=""
            />
          </div>
        )}
        <div
          className={cn(
            fontSerif.className,
            " text-start text-sm md:text-center md:text-lg lg:text-xl",
          )}
        >
          {formStage == FormState.Terms && (
            <h1 className="mt-5">Terms and Conditions</h1>
          )}
          {formStage == FormState.Verification && (
            <h1 className="mt-5">Email Verification</h1>
          )}
          {formStage == FormState.OtpSent && (
            <h1 className="mt-5">Verify OTP</h1>
          )}
          {formStage == FormState.Success && (
            <h1 className="mt-5">Yay! Deets recorded˚🎧⊹♡</h1>
          )}
        </div>

        {formStage == FormState.Terms && (
          <p className="md:text-md text-start text-sm md:text-center">
            Please read the following terms and conditions before proceeding.
          </p>
        )}
        {(formStage === FormState.Details ||
          formStage === FormState.Verification ||
          formStage === FormState.OtpSent) && (
            <div className="flex flex-col gap-y-0.5">
              <p className="md:text-md text-start md:text-center">
                ⋆｡°✩ ✮ 𝓐 𝓫𝓾𝓷𝓭𝓵𝓮 𝓶𝓪𝓭𝓮 𝓳𝓾𝓼𝓽 𝓯𝓸𝓻 𝔂𝓸𝓾 ‧₊˚🖇️✩ ₊˚🎧⊹♡
              </p>
            </div>
          )}

        {formStage == FormState.Success && (
          <div>
            <p className="md:text-md text-start text-sm md:text-center">
              Thank you so much for your interest in {AppConfig.StoreName} Bundles! We'll get
              back to you soon.
            </p>
            <div className="lg:text-md flex items-center justify-start text-sm md:justify-center md:text-base">
              <p className="rounded-md border px-3 py-2">
                Bundle ID-{" "}
                <span className={"font-medium "}>
                  {bundleId ? bundleId : "Loading..."}
                </span>
              </p>
            </div>
            <div className="flex items-center justify-start md:justify-center">
              <Link href={"https://instagram.com/re_skinn"}>
                <Button className={"mt-4 "}>Continue Shopping</Button>
              </Link>
            </div>
          </div>
        )}
        {!formStage == FormState.Success && <Separator />}
      </motion.div>
      {formStage === FormState.Terms && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={""}
        >
          <Form {...form}>
            <form
              onSubmit={termsForm.handleSubmit(onSubmit)}
              className="mx-auto max-w-md space-y-8 pb-5"
            >
              <ul className="heart-bullet-list not-prose mt-4 space-y-3 text-justify">
                <li>After we confirm your slot, we'll reach out to you.</li>
                <li>
                  It might take <strong> 15-20 days or more </strong>to gather
                  the items for your special bundle, depending on your request.
                </li>
                <li>
                  <strong>Payments are split into two parts</strong>: you pay
                  the first half when we finalize the details after you fill out
                  the form, and the second half is due just before we ship your
                  order.
                </li>
                <li>
                  Your box will be unique, and while we'll do our best to match
                  your style, it might not be an exact match.{" "}
                  <strong>
                    {" "}
                    We hope you're okay with a bit of creative flexibility.
                  </strong>
                </li>
                <li>
                  Once a slot is reserved, we appreciate your understanding that
                  refunds or cancellations are not possible. Additionally,
                  please be informed that we do not support Cash on Delivery.
                </li>
              </ul>

              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(check: boolean) => {
                          if (check) setFormStage(FormState.Verification);
                          return field.onChange;
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        {" "}
                        I have read the terms and conditions carefully and I
                        agree to them.{" "}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </motion.div>
      )}
      {formStage === FormState.Verification && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={""}
        >
          <Form {...emailForm}>
            <form
              onSubmit={emailForm.handleSubmit(onEmailSubmit)}
              className="mx-auto mt-5 max-w-md space-y-8"
            >
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        className="w-max-md w-full"
                        {...field}
                        placeholder="Email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button disabled={loading} type="submit">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send OTP
              </Button>
            </form>
          </Form>
        </motion.div>
      )}
      {formStage === FormState.OtpSent && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={""}
        >
          <Form {...verficiationForm}>
            <form
              onSubmit={verficiationForm.handleSubmit(onOtpSubmit)}
              className="mx-auto mx-auto mt-5 max-w-md  space-y-8"
            >
              <FormField
                control={verficiationForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OTP</FormLabel>
                    <FormDescription>
                      <div className="flex items-center space-x-3 text-sm">
                        <span className="m-0">
                          ({emailForm.getValues("email")})
                        </span>
                        <span
                          className="cursor-pointer underline"
                          onClick={() => setFormStage(FormState.Verification)}
                        >
                          Edit
                        </span>
                      </div>
                    </FormDescription>
                    <FormControl>
                      <Input
                        disabled={loading}
                        className="w-max-md w-full"
                        {...field}
                        placeholder="OTP"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={loading} type="submit">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify OTP
              </Button>
            </form>
          </Form>
        </motion.div>
      )}

      {formStage === FormState.Details && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={""}
        >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mx-auto mt-5 max-w-md  space-y-8"
            >
              {/* Fields 1-4 */}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        disabled={true}
                        className="w-max-md w-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        className="w-max-md w-full"
                        {...field}
                        placeholder="Name"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        className="w-max-md w-full"
                        {...field}
                        placeholder="Phone Number"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="hidden"
                        disabled={loading}
                        className="w-max-md w-full"
                        {...field}
                        placeholder="OTP"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instagramUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram Username</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        className="w-max-md w-full"
                        {...field}
                        placeholder="Instagram Username"
                      />
                    </FormControl>
                    <FormDescription>
                      Please do not prefix it with @.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fields 5-6 */}
              <FormField
                control={form.control}
                name="bundleSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bundle Size</FormLabel>
                    <FormDescription>
                      Please select your bundle size. The numbers in the
                      brackets indicate the number of items.
                      <br />
                      <strong>
                        * The quantity of the items in the bundle might wary
                        depending upon the price of the pieces.
                      </strong>
                    </FormDescription>
                    <FormControl>
                      <RadioGroup
                        disabled={loading}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="my-2 flex flex-col space-y-1 py-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="small" id="r1" />
                          <Label htmlFor="r1">Small (3-4) | ₹3K-4K</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medium" id="r2" />
                          <Label htmlFor="r2">Medium (4-7) | ₹4K-6K</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="large" id="r3" />
                          <Label htmlFor="r3">Large (7-12) | ₹6K-10K</Label>
                        </div>
                        <div className="flex items-center space-x-2 ">
                          <RadioGroupItem value="extra_large" id="r3" />
                          <Label htmlFor="r3">
                            Extra Large (12 & above) | ₹10K & above
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="topSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Top Size</FormLabel>
                    <FormDescription>
                      Please select your top size.
                    </FormDescription>
                    <Select
                      disabled={loading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select the size of your tops." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="xs">Extra Small</SelectItem>
                        <SelectItem value="s">Small</SelectItem>
                        <SelectItem value="m">Medium</SelectItem>
                        <SelectItem value="l">Large</SelectItem>
                        <SelectItem value="xl">Extra Large</SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fields 7-8 */}

              <div className="flex flex-col items-start gap-x-5 gap-y-5 lg:flex-row lg:items-center">
                <FormField
                  control={form.control}
                  name="bottomSize.waist"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bottom Length (in)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          disabled={loading}
                          placeholder="Length of your bottoms"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bottomSize.length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bottom Waist (in)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          disabled={loading}
                          placeholder="Waist of your bottom"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="aesthetics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aesthetics</FormLabel>
                    <FormDescription>
                      Please select your preferred aesthetic.
                    </FormDescription>
                    <Select
                      disabled={loading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your preferred aesthetic" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="y2k/2000s">Y2K/2000s</SelectItem>
                        <SelectItem value="coastal_cowboy/boho">
                          Coastal Cowboy/Boho
                        </SelectItem>
                        <SelectItem value="60s/70s">60s/70s</SelectItem>
                        <SelectItem value="90s_(ex/_friends_&_full_house)">
                          90s (ex/ Friends & Full House)
                        </SelectItem>
                        <SelectItem value="sporty_model_off_duty">
                          Sporty Model Off Duty
                        </SelectItem>
                        <SelectItem value="coquette_dainty">
                          Coquette Dainty
                        </SelectItem>
                        <SelectItem value="streetwear">Streetwear</SelectItem>
                        <SelectItem value="cozy_simple_fall/winter">
                          Cozy Simple Fall/Winter
                        </SelectItem>
                        <SelectItem value="witchy_whimsical">
                          Witchy Whimsical
                        </SelectItem>
                        <SelectItem value="late_90s/early_2000s">
                          Late 90s/Early 2000s
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch("aesthetics") === "other" && (
                <FormField
                  control={form.control}
                  name="otherAesthetic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Aesthetic</FormLabel>
                      <FormDescription>
                        Please specify your preferred aesthetic.
                      </FormDescription>
                      <FormControl>
                        <Input disabled={loading} {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Fields 11-12 */}
              <FormField
                control={form.control}
                name="bundleDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bundle Description</FormLabel>
                    <FormDescription>
                      Please add details about the type of clothes you are
                      interested in.
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        disabled={loading}
                        className="w-max-md w-full"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkInput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Picture Board Link</FormLabel>
                    <FormDescription>
                      Please enter any links to items you like. You can paste
                      the links to a Google Doc, Pinterest board, iCloud Photo
                      Album, etc.
                    </FormDescription>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="https://in.pinterest.com..."
                        className="w-max-md w-full"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pictures</FormLabel>
                    <FormDescription>
                      You can upload pictures of your style inspiration here.
                    </FormDescription>
                    <FormControl>
                      {!form.watch("pictures") ? (
                        <UploadButton
                          className="ut-ready:items-start ut-readying:items-start ut-button:text-primary-foreground ut-uploading:items-start ut-button:bg-primary mt-3"
                          endpoint="imageUploader"
                          onUploadBegin={() => {
                            setImageLoading(true);
                          }}
                          onClientUploadComplete={(res) => {
                            setImageLoading(false);
                            toast.success(`Uploaded ${res?.length} images!`);
                            console.log({ res });
                            form.setValue(
                              "pictures",
                              res.map((r) => r.fileUrl),
                            );
                          }}
                          onUploadError={(error: Error) => {
                            setImageLoading(false);
                            // Do something with the error.
                            alert(`ERROR! ${error.message}`);
                          }}
                        />
                      ) : (
                        <p>
                          {form.watch("pictures").length > 0
                            ? `Uploaded ${form.watch("pictures").length
                            } image(s)!`
                            : "No images uploaded"}
                        </p>
                      )}
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fields 9-10 */}

              <FormField
                control={form.control}
                name="fashionDislikes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fashion Dislikes</FormLabel>
                    <FormControl>
                      <Textarea
                        className="w-max-md w-full"
                        {...field}
                        disabled={loading}
                        placeholder="E.g. I do not like baggy fits"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button disabled={loading || imageLoading} type="submit">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Details
              </Button>
            </form>
          </Form>
        </motion.div>
      )}
    </div>
  );
}
