"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { COURIER, Size, Status } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge as StatusBadge, type Color } from "@tremor/react";
import { format } from "date-fns";
import { Loader2, ShareIcon, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { type z } from "zod";

import { type CompleteOrders } from "@acme/db/prisma/zod";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@acme/ui";
import { SheetClose } from "@acme/ui/src/sheet";
import { AppConfig } from "@acme/utils";
import { OrderShippingUpdateSchema } from "@acme/utils/src/schema";

export const RecordDisplay = ({
  label,
  value,
  className,
  ...restProps
}: {
  label: string;
  value?: string | null;
  className?: string;
  onClick?: () => void;
}) => (
  <Card
    className={`flex items-center border p-3 text-sm ${className}`}
    {...restProps}
  >
    <Label className={"border-r pr-2"}>{label}</Label>
    <p className="ml-2 text-xs text-muted-foreground">{value}</p>
  </Card>
);

export const pillColors: { [key: string]: Color } = {
  [Status.PENDING]: "amber",
  [Status.ACCEPTED]: "indigo",
  [Status.MANIFESTED]: "teal",
  [Status.SHIPPED]: "blue",
  [Status.DELIVERED]: "emerald",
  [Status.CANCELLED]: "red",
  [Status.RTO]: "gray",
  [Status.HOLD]: "yellow",
};

const UpdateForm = ({ order }: { order: CompleteOrders }) => {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof OrderShippingUpdateSchema>>({
    resolver: zodResolver(OrderShippingUpdateSchema),
    defaultValues: {
      awb: order.awb ?? "",
      courier: order.courier ?? COURIER.DEFAULT,
      status: order.status ?? Status.PENDING,
      length: order.length ?? "",
      breadth: order.breadth ?? "",
      height: order.height ?? "",
      weight: order.weight ?? "",
    },
  });

  const [loading, setLoading] = useState(false);

  const [allowUpdating, setAllowUpdating] = useState(false);

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (type === "change") {
        if (name === "status") {
          setAllowUpdating(value.status === "SHIPPED");
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof OrderShippingUpdateSchema>) {
    setLoading(true);
    try {
      const req = await fetch(`/api/admin/`, {
        method: "PUT",
        body: JSON.stringify({ id: order.id, ...values }),
      });
      if (req.ok) {
        console.log({ req });
        console.log("Updated!");
        await queryClient.invalidateQueries(["allOrders"]);
        toast.success("Order updated successfully!");
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  // @ts-ignore
  return (
    <div className={""}>
      <SheetTitle className={"mb-5"}>Update Product</SheetTitle>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.keys(Status).map((status) => {
                      return (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="courier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Courier</FormLabel>

                <Select
                  disabled={!allowUpdating}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={"Courier"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.keys(COURIER).map((courier) => {
                      return (
                        <SelectItem key={courier} value={courier}>
                          {courier.toUpperCase()}
                        </SelectItem>
                      );
                    }) || []}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          <SizeSelection form={form} />
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <FormField
              control={form.control}
              name="length"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Length</FormLabel>
                  <FormControl>
                    {/*@ts-ignore*/}
                    <Input placeholder={"Length"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="breadth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Breadth</FormLabel>
                  <FormControl>
                    {/*@ts-ignore*/}
                    <Input placeholder={"Breadth"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height</FormLabel>
                  <FormControl>
                    {/*@ts-ignore*/}
                    <Input placeholder={"Height"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight</FormLabel>
                  <FormControl>
                    {/*@ts-ignore*/}
                    <Input placeholder={"Weight"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="awb"
            render={({ field }) => (
              <FormItem>
                <FormLabel>AWB</FormLabel>
                <FormControl>
                  {/*@ts-ignore*/}
                  <Input
                    disabled={!allowUpdating}
                    placeholder={"AWB"}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className={"w-full"} type="submit">
            <span>
              {loading && <Loader2 className={"mr-2 animate-spin text-xs"} />}
            </span>
            {!loading && <p>Update</p>}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export const SizeSelection = ({ form }) => {
  return (
    <>
      <div className="grid grid-cols-1 gap-3 w-fit">
        {Object.keys(AppConfig.DefaultPackageDetails).map((size) => {
          //@ts-ignore
          const order = AppConfig.DefaultPackageDetails[size];
          return (
            <RecordDisplay
              onClick={() => {
                form.setValue("weight", order.weight);
                form.setValue("length", order.length);
                form.setValue("breadth", order.breadth);
                form.setValue("height", order.height);
              }}
              className="cursor-pointer hover:border-blue-500"
              label={size}
              value={`${order.length} cm x ${order.breadth} cm x ${order.height} cm @ ${order.weight} gm`}
            />
          );
        }) || []}
      </div>
    </>
  );
};

export function DashboardOrderDetailSheet({
  order,
}: {
  order: CompleteOrders;
}) {
  const handleShareButton = async () => {
    const text = `Thank you for your order love 🥰. Please fill up the details by clicking the link below. ${AppConfig.BaseOrderUrl}/order/${order.id}. This is a one time process and the details will be saved for future orders. You can visit the link anytime to track your order.`;
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
  return (
    <SheetContent
      side={"top"}
      className={"max-h-screen overflow-y-scroll pb-20"}
    >
      <SheetHeader className="sticky top-0 bg-background pb-4 pt-6 dark:bg-background">
        <SheetClose className="flex justify-end">
          <Button variant={"ghost"}>
            <X className="h-4 w-4" />
          </Button>
        </SheetClose>
        <SheetTitle>Manage Order</SheetTitle>
        <SheetDescription>
          <div className="flex items-center justify-between gap-4">
            <span className={"break-all text-xs text-muted-foreground"}>
              {order.id}
            </span>
            <div>
              <Button
                onClick={handleShareButton}
                size={"sm"}
                variant={"outline"}
              >
                <ShareIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetDescription>
      </SheetHeader>
      <StatusBadge
        size="xs"
        color={pillColors[order.status] as Color}
        className={"mt-2 text-xs font-medium"}
      >
        {order.status}
      </StatusBadge>
      <div className={"flex space-x-3"}>
        {order.images.map((image) => (
          <Image
            key={image}
            src={image ?? ""}
            alt={"product_image"}
            width={100}
            height={100}
            className="mt-5 rounded-md shadow"
          />
        ))}
      </div>

      <div className="grid gap-4 py-4">
        {order.instagram_post_urls.map((url, index) => {
          const uri = new URL(url);
          const priceValue = uri.searchParams.get("price");
          const parsedPrice = Number(priceValue);
          return (
            <div className={"flex flex-col space-y-2"}>
              <Link className={""} href={url} key={index}>
                <RecordDisplay label="Link" value={url} />
              </Link>
              <RecordDisplay label={"Price"} value={`₹ ${parsedPrice}`} />
            </div>
          );
        })}
        <div className="p-1"></div>
        <RecordDisplay label="Order ID" value={order.id} />
        <RecordDisplay
          label="Size"
          value={`${order.length} cm x ${order.breadth} cm x ${order.height} cm @ ${order.weight} gm`}
        />
        <RecordDisplay
          label="Date"
          value={format(
            new Date(order.created_at ?? new Date()),
            "dd/MM/yy, hh:mm a",
          )}
        />
        <>
          {order.user && (
            <div className="grid gap-4 py-4">
              <RecordDisplay label="Name" value={order.user?.name} />
              <RecordDisplay
                label="Address"
                value={`${order.user?.house_number}, ${order.user?.locality}, ${order.user?.landmark}, ${order.user?.city}, ${order.user?.state}- ${order.user?.pincode}`}
              />
              <RecordDisplay
                label={"Phone"}
                value={`+91 ${order.user?.phone_no}`}
              />
              <RecordDisplay label="Email" value={order.user?.email} />

              <RecordDisplay
                label={"Buyer's Username"}
                value={`${order.user?.instagram_username}`}
              />
            </div>
          )}
        </>
        <hr className={"my-4"} />

        <UpdateForm order={order} />
      </div>

      {/* <div>
        {order.user?.pincode &&
          (order.status === "PENDING" || order.status === "ACCEPTED") && (
            <div>
              <hr className={"my-4"} />
              <SheetTitle className={"mb-5"}>Shipping Costs</SheetTitle>
              {order.user?.pincode && (
                <DashboardShippingRateDisplayComponent
                  pincode={order.user?.pincode}
                />
              )}
            </div>
          )}
      </div> */}
      <SheetFooter className={"text-left"}></SheetFooter>
    </SheetContent>
  );
}
