"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Email } from "@clerk/nextjs/dist/types/server";
import { zodResolver } from "@hookform/resolvers/zod";
import { COURIER, Status } from "@prisma/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge as StatusBadge, type Color } from "@tremor/react";
import { format } from "date-fns";
import {
  ArrowRight,
  ChevronRight,
  Instagram,
  Loader2,
  Mail,
  Phone,
  ShareIcon,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { type CompleteOrders } from "@gramflow/db/prisma/zod";
import {
  Button,
  Card,
  CardContent,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
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
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  useMediaQuery,
} from "@gramflow/ui";
import { SheetClose, SheetTrigger } from "@gramflow/ui/src/sheet";
import { AppConfig, cn } from "@gramflow/utils";
import { OrderShippingUpdateSchema } from "@gramflow/utils/src/schema";

import { DashboardBundleDetailSheet } from "./bundles/dashboardBundleDetailSheet";
import { RecordText } from "./recordText";

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
    className={`flex w-fit max-w-md cursor-pointer items-center border p-3 text-sm ${className}`}
    {...restProps}
  >
    <Label className={"border-r pr-2"}>{label}</Label>
    <p className="ml-2 break-all text-xs text-muted-foreground lg:text-base">
      {value}
    </p>
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
  [Status.OUT_FOR_DELIVERY]: "purple",
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
      {/* <SheetTitle className={"mb-5"}>Update Product</SheetTitle> */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex flex-col gap-3">
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
          </div>
          <SizeSelection form={form} />
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
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
                    className="w-fit"
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

export const SizeSelection = ({ form }: { form: any }) => {
  const watchLength = form.watch(
    "length",
    AppConfig.DefaultPackageDetails["MEDIUM"]?.length,
  );
  return (
    <>
      <div className="">
        <Label>Package Size</Label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Object.keys(AppConfig.DefaultPackageDetails).map((size) => {
          //@ts-ignore
          const order =
            AppConfig.DefaultPackageDetails[size] ??
            AppConfig.DefaultPackageDetails["MEDIUM"];
          return (
            <Button
              type="button"
              onClick={() => {
                form.setValue("weight", order.weight);
                form.setValue("length", order.length);
                form.setValue("breadth", order.breadth);
                form.setValue("height", order.height);
              }}
              className={cn(
                "cursor-pointer",
                watchLength === order?.length && "border-primary",
              )}
              variant={"outline"}
            >
              {size}
            </Button>
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
  return (
    <SheetContent
      side={"right"}
      className={"max-h-screen w-full overflow-y-scroll pb-10 lg:w-full"}
    >
      <SheetHeader className="top-0 bg-background px-3 pb-4 pt-6 dark:bg-background">
        <div className="flex justify-end">
          <SheetClose>
            <Button variant={"ghost"}>
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        </div>
        <div className="flex flex-col items space-y-2 text-left">
          <div className="flex items-center gap-3">
            <SheetTitle>
              {order.id.replace(/^(.{8}).+(.{8})$/, "$1").toUpperCase()}
            </SheetTitle>
            <StatusBadge
              size="xs"
              color={pillColors[order.status] as Color}
              className={"text-xs font-medium"}
            >
              {order.status.slice(0, 1) + order.status.slice(1).toLowerCase()}
            </StatusBadge>
          </div>
          <div
            onClick={async () => {
              if (navigator.clipboard) {
                await navigator.clipboard.writeText(order.id);
                toast.success("Copied to clipboard");
              } else {
                console.log("Clipboard API not available");
              }
            }}
          >
            <SheetDescription>{order.id}</SheetDescription>
          </div>
        </div>
      </SheetHeader>
      <DetailsContent order={order} />
      <SheetFooter className={"text-left"}></SheetFooter>
    </SheetContent>
  );
}

const DetailsContent = ({ order }: { order: CompleteOrders }) => {
  const [editDetailsFormVisible, setEditDetailsFormVisible] = useState(false);
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
    <div className="px-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {order.user && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button size={"sm"} variant={"outline"}>
              <Link
                href={`tel:${order.user?.phone_no}`}
                className="flex items-center space-x-2"
              >
                <span>Call</span>
                <Phone className="h-4 w-4" />
              </Link>
            </Button>
            <Button size={"sm"} variant={"outline"}>
              <Link
                href={`mailto:${order.user?.email}`}
                className="flex items-center space-x-2"
              >
                <span>Email</span>
                <Mail className="h-4 w-4" />
              </Link>
            </Button>
            <Button size={"sm"} variant={"outline"}>
              <Link
                href={`https://instagram.com/${order.user?.instagram_username}`}
                className="flex items-center space-x-2"
              >
                <span>IG</span>
                <Instagram className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
        <Button
          onClick={handleShareButton}
          size={"sm"}
          className="flex items-center space-x-2"
          variant={"secondary"}
        >
          <span>Share</span>
          <ShareIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid gap-4 py-4">
        <div className="flex flex-wrap items-center gap-3">
          {order.status === "PENDING" && (
            <Button className="mt-3" variant={"secondary"}>
              <a
                className=" flex items-center space-x-2"
                href={`/add?orderId=${order.id}`}
              >
                <span>Accept Manually</span>
                <ChevronRight className="h-4 w-4" />
              </a>
            </Button>
          )}
          {order.bundles && (
            <Sheet>
              <SheetTrigger>
                <Button
                  variant={"outline"}
                  className="mb-3 flex items-center space-x-2"
                >
                  <span>View Bundle</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <DashboardBundleDetailSheet bundle={order.bundles} />
            </Sheet>
          )}
        </div>
      </div>
      {/* <Card className="my-3">
        <div className="flex items-center justify-between py-1 px-4">
          <p>Bundle Order</p>
          <ChevronRight className="" />
        </div>
      </Card> */}

      <div className="text-wrap grid gap-6 overflow-x-auto">
        <Card className={"flex flex-col space-y-2"}>
          <p className="p-3 text-xs font-medium text-muted-foreground">
            Products in order
          </p>
          <CardContent className="grid grid-cols-1 gap-2">
            {order.instagram_post_urls.map((url, index) => {
              const uri = new URL(url);
              const priceValue = uri.searchParams.get("price");
              const parsedPrice = Number(priceValue);
              const postId = uri.pathname.split("/")[2];
              const slideNumber = uri.searchParams.get("img_index");
              return (
                <div className="flex items-center justify-between">
                  <a href={url} target="_blank">
                    <img
                      width={50}
                      height={50}
                      className="rounded-md"
                      src={order.images[index]}
                    />
                  </a>
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">Item {index + 1}</p>
                    <p className="text-xs text-muted-foreground">
                      {postId} ({slideNumber})
                    </p>
                  </div>
                  <p className="text-sm font-medium">{`₹ ${parsedPrice}`}</p>
                </div>
              );
            })}
            <div>
              <div className="my-3">
                <Separator />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm font-medium">Total</p>
                <p className="text-sm font-medium">{`₹ ${order.price}`}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {order.user && (
          <>
            <div className="item-center justify-normal flex w-full gap-10">
              <RecordText title="Name" value={order.user?.name ?? ""} />
              <RecordText
                title="Phone"
                value={`${order.user?.phone_no}` ?? ""}
              />
            </div>
            <RecordText
              title="Address"
              value={`${order.user?.house_number}, \n ${order.user?.locality}, ${order.user?.landmark} ${order.user?.city}, ${order.user?.state}- ${order.user?.pincode}`}
            />
            <RecordText title="Email" value={order.user?.email} />
            <RecordText
              title="Date"
              value={format(
                new Date(order.created_at ?? new Date()),
                "dd/MM/yy, hh:mm a",
              )}
            />
          </>
        )}
        <div className="item-center justify-normal flex flex-col gap-8">
          {order.user && (
            <RecordText
              title="Est. Shipping Cost"
              value={"₹ " + order.shipping_cost?.toString()}
            />
          )}
          {order.user && (
            <RecordText
              title="Dimensions"
              value={`${order.length} cm x ${order.breadth} cm x ${order.height} cm @ ${order.weight} gm`}
            ></RecordText>
          )}
        </div>

        {order.awb && <RecordText title="AWB" value={order.awb} />}

        <SheetFooter>
          {!editDetailsFormVisible && (
            <Button
              onClick={() => {
                setEditDetailsFormVisible((prevState) => !prevState);
              }}
            >
              {!editDetailsFormVisible ? "Edit Details" : "Close"}{" "}
            </Button>
          )}
        </SheetFooter>

        {editDetailsFormVisible && <UpdateForm order={order} />}
      </div>
    </div>
  );
};
