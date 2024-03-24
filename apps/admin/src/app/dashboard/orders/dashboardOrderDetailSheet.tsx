"use client";

import { Dispatch, useEffect, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { COURIER, Status } from "@gramflow/db/types"
import { useQueryClient } from "@tanstack/react-query";
import { type Color } from "@tremor/react";
import useRestClient from "~/features/hooks/use-rest-client";
import { format } from "date-fns";
import { CompleteBundles, CompleteUsers, UsersModel } from "@gramflow/db/prisma/zod";
import {
  Box,
  BoxIcon,
  ChevronRight,
  Instagram,
  Loader2,
  Lock,
  LockIcon,
  Mail,
  MessageCircle,
  Phone,
  ShareIcon,
  X,
} from "lucide-react";
import { UseFormReturn, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { type CompleteOrders } from "@gramflow/db/prisma/zod";
import {
  Button,
  Card,
  CardContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  Pill,
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
} from "@gramflow/ui";
import { SheetClose, SheetTrigger } from "@gramflow/ui/src/sheet";
import { AppConfig, cn } from "@gramflow/utils";
import { OrderShippingUpdateSchema } from "@gramflow/utils/src/schema";

import { DashboardBundleDetailSheet } from "../components/bundles/dashboardBundleDetailSheet";
import { RecordText } from "../components/recordText";
import { SetStateAction } from "jotai";
import { fontSans } from "~/lib/fonts";

const SheetHeaderDetails = ({
  title,
  status,
  size,
  description,
  id
}: {
  title: string, status: Status, size: string,
  description: string,
  id: string,
}) => {
  return (
    <>
      <div className="flex justify-end">
        <SheetClose>
          <Button variant={"ghost"}>
            <X className="h-4 w-4" />
          </Button>
        </SheetClose>
      </div>
      <div className="items flex flex-col space-y-2 text-left">
        <div className="flex items-center gap-2">
          <SheetTitle>
            {title}
          </SheetTitle>
          <Pill
            variant={pillColors[status] as Color}
          >
            {(status.slice(0, 1) +
              status.slice(1).toLowerCase()).replaceAll("_", " ")}
          </Pill>
          <Pill className="-ml-1" variant="orange">
            {size}
          </Pill>
        </div>
        <div
          onClick={async () => {
            if (navigator.clipboard) {
              await navigator.clipboard.writeText(id);
              toast.success("Copied to clipboard");
            } else {
              console.log("Clipboard API not available");
            }
          }}
        >
          <SheetDescription>{description}</SheetDescription>
        </div>
      </div>
    </>
  )
}

export const OrderDetailsContent = ({ order }: { order: CompleteOrders | null | undefined }) => {
  if (order === null || order === undefined) return null;
  const [editDetailsFormVisible, setEditDetailsFormVisible] = useState(false);
  return (
    <div className="">
      <ActionPanel user={order.user} id={order.id} />
      <div className="grid gap-4 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <AcceptButton id={order.id} status={order.status} />
          <BundleDetails bundle={order.bundles} />
        </div>
      </div>

      <div className="text-wrap grid gap-6 overflow-x-auto">
        <ProductDetails post_urls={order.instagram_post_urls} images={order.images} price={order.price} />
        <UserDetails user={order.user} />
        <RecordText
          title="Date"
          value={format(
            new Date(order.created_at ?? new Date()),
            "dd/MM/yy, hh:mm a",
          )}
        />
        <ShippingDetails user={order.user} height={order.height} weight={order.weight} length={order.length} breadth={order.breadth} awb={order.awb} shipping_cost={order.shipping_cost} />
        <SheetFooter>
          <EditButton setEditDetailsFormVisible={setEditDetailsFormVisible} editDetailsFormVisible={editDetailsFormVisible} />
        </SheetFooter>
        {editDetailsFormVisible && <UpdateForm order={order} />}
      </div>
    </div>
  );
};

export const RecordDisplay =
  ({
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
  const { client } = useRestClient();
  const queryClient = useQueryClient();
  const { mutate: updateOrderMutate, isLoading: updateOrderLoading } =
    client.order.updateOrders.useMutation({
      onSuccess: async () => {
        toast.success("Done!");
        await queryClient.invalidateQueries({
          queryKey: ["orders"],
        });
      },
      onError: (e) => {
        console.log("Error");
        toast.error(`Error ${e}`);
      },
    });

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

  async function onSubmit(values: z.infer<typeof OrderShippingUpdateSchema>) {
    updateOrderMutate({
      body: {
        update: values,
        order_ids: order.id,
      },
    });
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
              render={({ field }: {
                field: any
              }) => (
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
              render={({ field }: {
                field: any
              }) => (
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
          <SizeSelection form={form} order={order} />
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <FormField
              control={form.control}
              name="length"
              render={({ field }: {
                field: any
              }) => (
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
              render={({ field }: {
                field: any
              }) => (
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
              render={({ field }: {
                field: any
              }) => (
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
              render={({ field }: {
                field: any
              }) => (
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
            render={({ field }: {
              field: any
            }) => (
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
              {updateOrderLoading && (
                <Loader2 className={"mr-2 animate-spin text-xs"} />
              )}
            </span>
            {!updateOrderLoading && <p>Update</p>}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export const SizeSelection = ({ form, order }: {
  form: UseFormReturn<{
    awb: string;
    length: string;
    breadth: string;
    height: string;
    weight: string;
    courier?: any;
    status?: any;
  }, any, undefined>,
  order?: CompleteOrders
}) => {
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
                form.setValue("weight", order?.weight ?? "");
                form.setValue("length", order?.length ?? "");
                form.setValue("breadth", order?.breadth ?? "");
                form.setValue("height", order?.height ?? "");
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
  order: CompleteOrders | null | undefined;
}) {

  const height = order?.height;
  const length = order?.length;
  const weight = order?.weight;
  const breadth = order?.breadth;
  let packageSize = "Custom";
  Object.entries(AppConfig.DefaultPackageDetails).forEach(
    ([key, value]) => {
      if (
        value.height === height &&
        value.length === length &&
        value.weight === weight &&
        value.breadth === breadth
      ) {
        packageSize = key;
      }
    },
  )
  return (
    <>
      <SheetContent
        side={"right"}
        className={cn("max-h-screen w-full overflow-y-scroll pb-10 lg:w-full", fontSans.className)}
      >
        {!order ? (
          <div>Order not found</div>
        ) : (
          <SheetHeader className="top-0 px-3 pb-4 pt-6">
            <SheetHeaderDetails title={
              order.id.replace(/^(.{8}).+(.{8})$/, "$1").toUpperCase()
            } status={
              order.status
            } size={packageSize.slice(0, 1) + packageSize.slice(1).toLowerCase()} id={order.id} description={order.id} />
          </SheetHeader>
        )}
        <div className="px-3">
        <OrderDetailsContent order={order} />
        </div>
      </SheetContent>
    </>
  );
}



const EditButton = ({ setEditDetailsFormVisible, editDetailsFormVisible }: { setEditDetailsFormVisible: Dispatch<SetStateAction<boolean>>, editDetailsFormVisible: boolean }) => {

  return (
    <>  {!editDetailsFormVisible && (
      <Button
        onClick={() => {
          setEditDetailsFormVisible((prevState) => !prevState);
        }}
      >
        {!editDetailsFormVisible ? "Edit Details" : "Close"}{" "}
      </Button>
    )}</>
  )
}

const AcceptButton = ({ id, status }: { id: string, status: Status }) => {
  return (
    <>
      {status === "PENDING" && (
        <Button className="mt-3" variant={"secondary"}>
          <a
            className=" flex items-center space-x-2"
            href={`/add?orderId=${id}`}
          >
            <span>Accept Manually</span>
            <ChevronRight className="h-4 w-4" />
          </a>
        </Button>
      )}
    </>
  )
}


const ActionPanel = ({
  user,
  id,
}: {
  user: CompleteUsers | null | undefined,
  id: string
}) => {

  const handleShareClick = async ({ text }: {
    text: string
  }) => {

    if (navigator.share) {
      try {
        await navigator
          .share({ text })
          .then(() =>
            toast.success("Shared to the world! 🌍. Thank you for sharing!"),
          );
      } catch (error) {
        console.log(`Oops! I couldn't share to the world because: ${error}`);
      }
    } else {
      // fallback code
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
      } else {
        console.log("Clipboard API not available");
      }
    }
  }
  return (<div className="flex flex-wrap items-center justify-between gap-4">
    {user && (
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button size={"sm"} variant={"outline"}>
          <Link
            href={`tel:${user?.phone_no}`}
            className="flex items-center space-x-2"
          >
            <span>Call</span>
            <Phone className="h-4 w-4" />
          </Link>
        </Button>
        <Button size={"sm"} variant={"outline"}>
          <Link
            href={`mailto:${user?.email}`}
            className="flex items-center space-x-2"
          >
            <span>Email</span>
            <Mail className="h-4 w-4" />
          </Link>
        </Button>
        <Button size={"sm"} variant={"outline"}>
          <Link
            href={`https://instagram.com/${user?.instagram_username}`}
            className="flex items-center space-x-2"
          >
            <span>IG</span>
            <Instagram className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    )}
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          size={"sm"}
          className="flex items-center space-x-2"
          variant={"secondary"}
        >
          <span>Share</span>
          <ShareIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={fontSans.className}>
        <DropdownMenuItem
          className="flex items-center space-x-2"
          onClick={() => handleShareClick({ text: `Thank you for your order. Please fill up the details by clicking the link below. ${AppConfig.BaseOrderUrl}/order/${id}. This is a one time process and the details will be saved for future orders. You can visit the link anytime to track your order.` })}
        >
          <MessageCircle className="h-4 w-4" />
          <span>Template Message</span>

        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center space-x-2"
          onClick={() => handleShareClick({ text: `${AppConfig.BaseOrderUrl}/order/${id}` })}
        >

          <BoxIcon className="h-4 w-4" />
          <span>Order Link</span>

        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center space-x-2"
          onClick={() => handleShareClick({ text: `${AppConfig.BaseAdminUrl}/dashboard/orders/${id}` })}
        >

          <LockIcon className="h-4 w-4" />
          <span>Admin Link</span>

        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>

  </div>)
}

const BundleDetails = ({ bundle }:
  {
    bundle: CompleteBundles | null | undefined
  }) => {
  return (
    <>
      {bundle && (
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
          <DashboardBundleDetailSheet bundle={bundle} />
        </Sheet>
      )}
    </>
  )
}

const ShippingDetails = ({
  user,
  shipping_cost,
  height,
  length,
  breadth,
  weight,
  awb,
}: {
  user: CompleteUsers | null | undefined,
  shipping_cost: number | null | undefined,
  height: string | null | undefined,
  length: string | null | undefined,
  breadth: string | null | undefined,
  weight: string | null | undefined,
  awb: string | null | undefined,
}) => {
  return (
    <div className="item-center justify-normal flex flex-col gap-8">
      {user && (
        <RecordText
          title="Est. Shipping Cost"
          value={"₹ " + shipping_cost?.toString()}
        />
      )}
      {(length && breadth && height && weight) && (
        <RecordText
          title="Dimensions"
          value={`${length} cm x ${breadth} cm x ${height} cm @ ${weight} gm`}
        ></RecordText>
      )}
      {awb && <RecordText title="AWB" value={awb} />}
    </div>
  )
}

const UserDetails = ({ user }: {
  user: CompleteUsers | null | undefined
}) => {
  return (
    <>
      {user &&
        <>
          <div className="item-center justify-normal flex w-full gap-10">
            <RecordText title="Name" value={user?.name ?? ""} />
            <RecordText
              title="Phone"
              value={`${user?.phone_no}` ?? ""}
            />
          </div>
          <RecordText
            title="Address"
            value={`${user?.house_number}, \n ${user?.locality}, ${user?.landmark} ${user?.city}, ${user?.state}- ${user?.pincode}`}
          />
          <RecordText title="Email" value={user?.email} />

        </>
      }
    </>
  )
}

const ProductDetails = ({
  post_urls,
  images,
  price,

}: {
  post_urls: string[],
  images: string[],
  price: number
}) => {
  return (
    <Card className={"flex flex-col space-y-2 max-w-md"}>
      <p className="p-3 text-xs font-medium text-muted-foreground">
        Products in order
      </p>
      <CardContent className="grid grid-cols-1 gap-2">
        {post_urls.map((url, index) => {
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
                  src={images[index]}
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
            <p className="text-sm font-medium">{`₹ ${price}`}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}