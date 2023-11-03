"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Text, Title } from "@tremor/react";
import { ArrowLeft, Loader2, RefreshCcw } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";

import { Button, Input, Loader } from "@gramflow/ui";
import { AppConfig } from "@gramflow/utils";

import { SizeSelection } from "~/app/order/components/orderForm";
import { UploadButton } from "../components/uploader";

const enum State {
  IMAGE_UPLOAD,
  PRICE,
  SUCCESS,
}
const formSchema = z.object({
  prices: z.array(
    z.object({
      price: z.string(),
    }),
  ),
});

export default function Prebook() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm({
    resolver: async (values) => {
      try {
        const validData = formSchema.parse(values);
        return {
          values: validData,
          errors: {},
        };
      } catch (error) {
        return {
          values: {},
          // @ts-ignore
          errors: error.formErrors.fieldErrors,
        };
      }
    },
    defaultValues: {
      prices: [
        {
          price: "",
        },
      ],
    },
  });

  const [URIs, setURIs] = useState([]);
  const [state, setState] = useState<State>(State.IMAGE_UPLOAD);

  const {
    mutate: createOrderMutate,
    isLoading: createOrderLoading,
    error: createOrderError,
  } = useMutation(
    async ({ orders, images }: { orders: string[]; images: string[] }) => {
      // Transform the orders array into the format expected by your API

      const requestBody = {
        instagram_post_urls: orders,
        prebook: true,
        images,
        //@ts-ignore
        size: AppConfig.DefaultPackageDetails[packageSize],
      };

      const req = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (req.ok) return req.text();
      else
        throw `Request Failed ${req.statusText} ${
          req.status
        } ${await req.text()}`;
    },
    {
      onSuccess: async (data) => {
        form.reset();
        console.log({ data });
        try {
          await navigator.clipboard.writeText(data);
        } catch (e) {
          console.log({ e });
        }
        toast.success("Order has been created! Link has been copied.");
        setGeneratedOrderId(data);
      },
      onError: async (error) => {
        toast.error(
          `Error occurred during the creating of the order. ${error}`,
        );
        console.log(error);
      },
    },
  );

  function onSubmit(
    values: { prices: { price: string }[] },
    e: React.FormEvent,
  ) {
    console.log({ values });
    e.preventDefault();

    const mockOrders = values.prices.map((item) => {
      const randomString = Math.random().toString(36).substring(2, 6);
      return `https://www.instagram.com/p/prebooking${randomString}/?img_index=0&price=${item.price}`;
    });
    console.log({
      orders: mockOrders,
      images: URIs,
    });
    createOrderMutate({
      orders: mockOrders,
      images: URIs,
    });

    return;
  }

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "prices",
  });
  const [generatedOrderId, setGeneratedOrderId] = useState<string | null>(null);

  useEffect(() => {
    console.log({ URIs });
    if (URIs.length > 0 && state === State.PRICE) {
      for (let i = 0; i < URIs.length - 1; i++) {
        append({ price: "" });
      }
    }
  }, [URIs]);

  const handleShareButton = async () => {
    const text = `Thank you for your order love 🥰. Please fill up the details by clicking the following link- ${generatedOrderId}. This is a one time process and the details will be saved for future orders. You can visit the link anytime to track your order.`;
    if (navigator.share) {
      try {
        await navigator
          .share({ text })
          .then(() =>
            console.log("Hooray! Your content was shared to tha world"),
          );
      } catch (error) {
        console.log(`Oops! I couldn't share to the world because: ${error}`);
      }
    } else {
      // fallback code
      //copy the text
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
      } else {
        console.log("Clipboard API not available");
      }
    }
  };
  const { formState } = form;

  const { errors } = formState;

  useEffect(() => {
    if (errors.prices) {
      toast.error(errors?.prices?.message || "");
      console.log({ errors });
    }
  }, [errors]);
  const [packageSize, setPackageSize] = useState("MEDIUM");

  return (
    <main className="container mx-auto px-6 lg:px-10">
      <Button
        className="my-6"
        onClick={() => {
          router.push("/dashboard");
        }}
        variant={"outline"}
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>

      <h1 className="mb-4 mt-6 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Create Prebooking
      </h1>
      {generatedOrderId && (
        <div className="flex w-fit cursor-pointer flex-col space-y-4 py-4">
          <p
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(generatedOrderId);
                toast.success("Copied to clipboard");
              } catch (e) {
                console.log({ e });
                toast.error("Failed to copy to clipboard");
              }
            }}
            className="text-lg font-semibold"
          >
            Order ID: {generatedOrderId}
          </p>
          <div className="mb-5 flex gap-x-3 pb-5">
            <Button
              className="w-fit"
              onClick={handleShareButton}
              variant="outline"
            >
              Copy Template Message
            </Button>
            <Button
              onClick={() => {
                if (window) window.location.reload();
              }}
              variant={"outline"}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      {createOrderLoading && (
        <div className="flex items-center">
          <Loader />
        </div>
      )}
      {!createOrderLoading && !generatedOrderId && (
        // @ts-ignore
        <div className="mt-5 w-fit">
          <h2 className="my-3 font-semibold">
            {state === State.IMAGE_UPLOAD
              ? "1. Select Image(s)"
              : "2. Enter Price"}
          </h2>
          {loading && <Loader2 className={"mr-2 animate-spin text-xs"} />}
          {!loading && state === State.IMAGE_UPLOAD && (
            <div>
              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  console.log("Files: ", res);
                  toast.success(`Uploaded ${res?.length} images!`);
                  //@ts-ignore
                  setURIs(res.map((r) => r.fileUrl));
                  setState(State.PRICE);
                }}
                onUploadError={(error: Error) => {
                  console.log("Error: ", error);
                  toast.error("Error uploading image");
                }}
              />
            </div>
          )}
          {!loading && state === State.PRICE && (
            <div>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {fields.map((field, index) => (
                  <div key={field.id}>
                    <img
                      width={150}
                      className="my-4 rounded"
                      src={URIs[index]}
                      alt=""
                    />
                    <Input
                      className="w-max-md w-full"
                      disabled={loading}
                      placeholder={`Product ${index + 1} Price`}
                      {...form.register(`prices.${index}.price` as const)}
                    />
                  </div>
                ))}
                <div className="mt-5">
                  <SizeSelection
                    setPackageSize={setPackageSize}
                    packageSize={packageSize}
                  />
                </div>
                <Button className={"w-full"} type="submit">
                  <span>
                    {loading && (
                      <Loader2 className={"mr-2 animate-spin text-xs"} />
                    )}
                  </span>
                  {!loading && <p>Create Prebooking</p>}
                </Button>
              </form>
            </div>
          )}
        </div>
      )}
      {/* <div className="flex space-x-3">
          <Button>
            <Link href="/new" rel="noopener noreferrer" target="_blank">
              Prebook Order
            </Link>
          </Button>
          <UiButton variant="outline">
            <Link href="/order" rel="noopener noreferrer" target="_blank">
              <Plus className="h-4 w-4" />
            </Link>
          </UiButton>
        </div> */}
    </main>
  );
}
