"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Loader2, RefreshCcw } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "sonner";
import * as z from "zod";

import { Button, Input, Loader } from "@gramflow/ui";
import { AppConfig, cn } from "@gramflow/utils";

import { RecordDisplay } from "~/app/dashboard/components/dashboardOrderDetailSheet";

type Product = {
  link: string;
  slideNumber: string;
  price: string; // New field "price"
};
const formSchema = z.object({
  product: z.array(
    z.object({
      link: z.string().min(1),
      slideNumber: z.string().min(1),
      price: z.string().min(1), // Validation for the new "price" field
    }),
  ),
});

export const SizeSelection = ({
  setPackageSize,
  packageSize,
}: {
  setPackageSize: Dispatch<SetStateAction<string>>;
  packageSize: string;
}) => {
  return (
    <>
      <div className="grid w-fit grid-cols-1 gap-3 ">
        {Object.keys(AppConfig.DefaultPackageDetails).map((size) => {
          console.log(packageSize);
          //@ts-ignore
          const order = AppConfig.DefaultPackageDetails[size];
          return (
            <RecordDisplay
              onClick={() => setPackageSize(size)}
              className={cn(
                "cursor-pointer",
                packageSize === size && "border-blue-500",
              )}
              label={size}
              value={`${order.length} cm x ${order.breadth} cm x ${order.height} cm @ ${order.weight} gm`}
            />
          );
        }) || []}
      </div>
    </>
  );
};
export default function OrderForm() {
  const [packageSize, setPackageSize] = useState("MEDIUM");
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
      product: [
        {
          link: "",
          slideNumber: "",
          price: "", // New field "price"
        },
      ],
    },
  });

  const { formState } = form;

  const { errors } = formState;

  useEffect(() => {
    console.log({ errors });
  }, [errors]);

  const {
    mutate: createOrderMutate,
    isLoading: createOrderLoading,
    error: createOrderError,
  } = useMutation(
    async (orders: string[]) => {
      // Transform the orders array into the format expected by your API

      const requestBody = {
        instagram_post_urls: orders,
        images: [],
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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "product",
  });
  const [generatedOrderId, setGeneratedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log({
        value,
        name,
        type,
      });
      if (type === "change") {
        console.log("Change");
        if (name?.includes(".link")) {
          console.log("is .link");
          const index = extractNumberFromLink(name);
          console.log({ index });
          if (index !== null) {
            const link = value.product[index].link;
            const regex = /\/p\/([^/?]+)(?:\/\?.*img_index=(\d+))?/;
            const regexResult = regex.exec(link);
            console.log({
              link,
              regexResult,
            });
            if (regexResult) {
              const [, postId, imgIndex] = regexResult;
              const slideNumber = imgIndex ?? "";
              console.log({
                imgIndex,
                postId,
                slideNumber,
              });
              form.setValue(
                `product.${index}.link`,
                `https://www.instagram.com/p/${postId}/`,
              );
              form.setValue(`product.${index}.slideNumber`, slideNumber);
            }
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  function extractNumberFromLink(link: string): number | null {
    const regex = /product\.(\d+)\.link/;
    const match = link.match(regex);

    if (match && match[1]) {
      return parseInt(match[1], 10);
    } else {
      return null;
    }
  }

  function onSubmit(values: { product: Product[] }, e: React.FormEvent) {
    console.log({ values });
    e.preventDefault();
    const dataToSend = values.product.map(
      (product) =>
        `${product.link}?img_index=${product.slideNumber}&price=${product.price}`,
    );
    createOrderMutate(dataToSend);
    console.log({ dataToSend });
    return;
  }

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

  const ErrorMessage = ({ error }: { error: any }) => {
    console.log("Error:", error); // Add this line
    console.log("Error Message:", error?.message); // Add this line
    return <p className="mt-1 text-sm text-red-500">{error?.message}</p>;
  };
  return (
    <div className="p-10">
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
        Create Order
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <p className="p-2 text-lg font-semibold">{`Product ${
                  index + 1
                }`}</p>
                <Button
                  disabled={createOrderLoading}
                  variant="link"
                  className="-mr-3 text-red-400"
                  type="button"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              </div>
              <Input
                className="w-max-md w-full"
                disabled={createOrderLoading}
                placeholder={`Product Link`}
                {...form.register(`product.${index}.link` as const)}
              />
              <Input
                className="w-max-md w-full"
                disabled={createOrderLoading}
                type="number"
                placeholder={`Slide Number`}
                {...form.register(`product.${index}.slideNumber` as const)}
              />
              <Input
                className="w-max-md w-full"
                disabled={createOrderLoading}
                type="number"
                placeholder={`Price`}
                {...form.register(`product.${index}.price` as const)}
              />
            </div>
          ))}

          <div className="flex space-x-4">
            <Button
              disabled={createOrderLoading}
              variant="outline"
              type="button"
              onClick={() => {
                append({ link: "", slideNumber: "", price: 0 });
              }}
            >
              Add Product
            </Button>
          </div>
          <div className="mt-5">
            <SizeSelection
              setPackageSize={setPackageSize}
              packageSize={packageSize}
            />
          </div>
          {fields.length > 0 && (
            <Button disabled={createOrderLoading} type="submit">
              {createOrderLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Generate Order
            </Button>
          )}
        </form>
      )}
    </div>
  );
}
