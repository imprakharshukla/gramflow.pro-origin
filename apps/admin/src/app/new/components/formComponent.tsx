"use client";

import React, {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Title } from "@tremor/react";
import { DeleteIcon, Trash2Icon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Loader,
  Separator,
} from "@gramflow/ui";
import { AppConfig, cn } from "@gramflow/utils";

import { RecordDisplay } from "~/app/dashboard/components/dashboardOrderDetailSheet";
import { GreetingsComponent } from "~/features/ui/components/greetingsComponent";
import { State } from "./gridComponent";

interface PackageDetails {
  weight: string;
  length: string;
  breadth: string;
  height: string;
  charge: string;
  payment_mode: string;
}

interface SizeSelectionProps {
  setPackageSize: Dispatch<SetStateAction<string>>;
  packageSize: string;
}

export interface Root {
  product: Product[];
}

export interface Product {
  price: string;
}

export interface SelectedPostsPropType {
  parent: string;
  url: string;
  caption: string;
  index: number;
}

function extractPricesFromCaption(inputString: string): number[] {
  const regex = /\d{3,}/g;
  const matches = inputString.match(regex);
  if (matches) {
    return matches.map((match) => parseInt(match, 10));
  }
  return [];
}

export const SizeSelection: React.FC<SizeSelectionProps> = ({
  setPackageSize,
  packageSize,
}) => {
  return (
    <div className="grid w-fit grid-cols-1 gap-3">
      {Object.entries(AppConfig.DefaultPackageDetails).map(([size, pack]) => {
        return (
          <RecordDisplay
            onClick={() => setPackageSize(size)}
            className={packageSize === size ? "border-blue-500" : ""}
            label={size}
            value={`${pack.length} cm x ${pack.breadth} cm x ${pack.height} cm x ${pack.weight} gm @  ₹${pack.charge}`}
          />
        );
      })}
    </div>
  );
};

export const OrderFormComponent = ({
  setSelectedImages,
  selectedPosts,
  setGeneratedOrderId,
}: {
  selectedPosts: SelectedPostsPropType[];
  setSelectedImages: Dispatch<
    SetStateAction<
      { parent: string; url: string; index: number; caption: string }[]
    >
  >;
  setGeneratedOrderId: Dispatch<SetStateAction<string>>;
}) => {
  const [packageSize, setPackageSize] = useState("MEDIUM");
  const [shippingChecked, setShippingChecked] = useState(true);
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    getValues,
    setValue,
  } = useForm<Root>();

  const onSubmit = (values: Root, e: React.FormEvent) => {
    console.log({ values });
    e.preventDefault();
    values.product.map((product) => {
      //map through the product array and see if the price param is empty
      if (product.price === "") {
        setError("product", {
          type: "manual",
          message: "Please provide a price for all selected images.",
        });
        toast.error("Please provide a price for all selected images.");
        return;
      }
    });
    console.log(values.product);
    const dataToSend = values.product.map((product, index) => {
      if (shippingChecked) {
        //add shipping to the last product
        const shippingPrice =
          AppConfig.DefaultPackageDetails[
            packageSize as keyof typeof AppConfig.DefaultPackageDetails
          ]?.charge ?? "0";
        if (index === values.product.length - 1) {
          return `${selectedPosts[index]?.parent}?img_index=${
            Number(selectedPosts[index]?.index) + 1
          }&price=${Number(product.price) + parseInt(shippingPrice)}`;
        }
      }
      return `${selectedPosts[index]?.parent}?img_index=${
        Number(selectedPosts[index]?.index) + 1
      }&price=${product.price}`;
    });
    const images = selectedPosts.map((post) => post.url);
    console.log({ dataToSend });
    //@ts-ignore
    createOrderMutate({
      orders: dataToSend,
      images,
      size: AppConfig.DefaultPackageDetails[
        packageSize as keyof typeof AppConfig.DefaultPackageDetails
      ],
    });
  };

  useEffect(() => {
    if (selectedPosts.length === 0) {
      router.push(`/new`);
      return;
    }
    console.log({ selectedPosts });
  }, [selectedPosts]);

  // useEffect(() => {
  //   console.log({ shippingChecked });
  //   if (shippingChecked) {
  //     toast.success(
  //       "Shipping will be added to the total price when the order is created.",
  //     );
  //   }
  // }, [shippingChecked]);

  const { mutate: createOrderMutate, isLoading: createOrderLoading } =
    useMutation(
      async ({
        orders,
        images,
        size,
      }: {
        orders: string[];
        images: string[];
        size: {
          length: string;
          breadth: string;
          height: string;
          weight: string;
        };
      }) => {
        // Transform the orders array into the format expected by your API
        const requestBody = { instagram_post_urls: orders, images, size };
        console.log({ requestBody });

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
          console.log({ data });
          try {
            await navigator.clipboard.writeText(data);
          } catch (e) {
            console.log({ e });
          }
          toast.success("Order has been created! Link has been copied.");
          setGeneratedOrderId(data);
          router.push(`/new?state=${State.Success}`);
        },
        onError: (error) => {
          toast.error(
            `Error occurred during the creating of the order. ${error}`,
          );
          console.log(error);
        },
      },
    );
  return (
    <div>
      {createOrderLoading && (
        <div className="min-h-scren flex items-center justify-center">
          <Loader />
        </div>
      )}
      {!createOrderLoading && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Title>Create Order</Title>
              <GreetingsComponent text="please add the prices of product(s) now." />
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => router.push(`/new?state=${State.Selection}`)}
                variant={"outline"}
                disabled={selectedPosts.length <= 0}
              >
                Edit Selection
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 ">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {selectedPosts.map((post, index) => (
                <div key={index}>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <CardTitle>Product {index + 1}</CardTitle>
                          <CardDescription className="mt-2">
                            Please enter the price of the product.
                          </CardDescription>
                        </div>
                        <Button
                          variant={"ghost"}
                          size={"sm"}
                          type="button"
                          onClick={() => {
                            //delete this product from the array
                            toast.success("Product has been deleted.");
                            const newSelectedPosts = selectedPosts.filter(
                              (post, inx) => {
                                return inx !== index;
                              },
                            );
                            setSelectedImages(newSelectedPosts);
                          }}
                          className="ml-3 text-red-500"
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="mt-8 flex flex-col space-y-8">
                      <div>
                        <Image
                          width={100}
                          height={100}
                          src={post.url}
                          className="rounded"
                          alt={`Selected Image ${index + 1}`}
                        />
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {extractPricesFromCaption(post.caption).map(
                          (price, inx) => {
                            return (
                              <Badge
                                className="cursor-pointer select-none"
                                onClick={() => {
                                  setValue(`product[${index}].price`, price);
                                }}
                                key={inx}
                              >
                                ₹ {price}
                              </Badge>
                            );
                          },
                        )}
                      </div>
                      <Controller
                        name={`product[${index}].price`}
                        control={control}
                        defaultValue=""
                        render={({ field }) => {
                          return (
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                              <Label htmlFor="price" className="mb-1">
                                Price
                              </Label>
                              <Input type="number" {...field} />
                            </div>
                          );
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <SizeSelection
                setPackageSize={setPackageSize}
                packageSize={packageSize}
              />
            </div>
            <div className="mt-3 flex flex-col gap-8">
              <div className="mt-5 flex items-center space-x-2">
                <Checkbox
                  id="shipping"
                  defaultChecked={shippingChecked}
                  onCheckedChange={() => setShippingChecked((state) => !state)}
                />
                <label
                  htmlFor="shipping"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Add ₹
                  {
                    AppConfig.DefaultPackageDetails[
                      packageSize as keyof typeof AppConfig.DefaultPackageDetails
                    ].charge
                  }{" "}
                  in shipping
                </label>
              </div>
              <Button
                onChange={(e) => {
                  console.log(e);
                }}
                disabled={createOrderLoading}
                type="submit"
                className="w-fit"
              >
                Create Order
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
