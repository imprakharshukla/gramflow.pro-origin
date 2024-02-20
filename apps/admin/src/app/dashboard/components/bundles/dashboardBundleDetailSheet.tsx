"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { COURIER, Status } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge as StatusBadge, type Color } from "@tremor/react";
import { format } from "date-fns";
import {
  ArrowRight,
  ChevronRightSquare,
  Globe,
  Instagram,
  Loader2,
  Mail,
  Phone,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { ImPinterest2 } from "react-icons/im";
import { toast } from "sonner";

import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { z } from "zod";

import { CompleteBundles, type CompleteOrders } from "@gramflow/db/prisma/zod";
import {
  Button,
  Card,
  CardContent,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  Separator,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@gramflow/ui";
import { SheetClose, SheetTrigger } from "@gramflow/ui/src/sheet";
import { AppConfig } from "@gramflow/utils";
import { OrderShippingUpdateSchema } from "@gramflow/utils/src/schema";

import { ImageViewer } from "~/features/ui/components/imageViewer";
import NextJsImage from "~/features/ui/components/nextImage";
import { DashboardOrderDetailSheet } from "../dashboardOrderDetailSheet";
import { RecordText } from "../recordText";

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
    <p className="ml-2 break-all text-sm text-muted-foreground lg:text-base">
      {value}
    </p>
  </Card>
);

export const pillColors: { [key: string]: Color } = {
  [Status.PENDING]: "amber",
  [Status.ACCEPTED]: "indigo",
};
export const sizePillColors: { [key: string]: Color } = {
  extra_small: "amber",
  small: "indigo",
  medium: "purple",
  large: "orange",
  extra_large: "blue",
};

export function AcceptForm({
  params,
}: {
  params: {
    bundle_id: string;
  };
}) {
  const acceptFormSchema = z.object({
    price: z.string(),
  });

  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(acceptFormSchema),
  });

  const { mutate: acceptMutate, isLoading: acceptLoading } = useMutation(
    async ({ price, id }: { price: string; id: string }) => {
      const res = await fetch(`/api/bundle?id=${id}&price=${price}`, {
        method: "POST",
      });
      const data = await res.json();
      return data;
    },
    {
      onSuccess: async () => {
        toast.success("Bundle Accepted");
        await queryClient.invalidateQueries({
          queryKey: ["allOrders"],
        });
        await queryClient.invalidateQueries({
          queryKey: ["allBundles"],
        });
      },
      onError: () => {
        toast.error("Bundle Acceptance Failed");
      },
    },
  );

  //onSubmit function

  async function onSubmit(values: z.infer<typeof acceptFormSchema>) {
    if (params.bundle_id) {
      acceptMutate({ price: values.price, id: params.bundle_id });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormDescription>Enter the price of the bundle.</FormDescription>
              <FormControl>
                <Input
                  disabled={acceptLoading}
                  placeholder="Price"
                  type="number"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={acceptLoading} type="submit">
          {acceptLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Accept Bundle
        </Button>
      </form>
    </Form>
  );
}

export function DashboardBundleDetailSheet({
  bundle,
}: {
  bundle: CompleteBundles;
}) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  return (
    <>
      <SheetContent
        side={"right"}
        className={"max-h-screen w-full overflow-y-scroll pb-10 lg:w-full"}
      >
        <SheetHeader className="top-0 bg-background pb-4 pt-6 dark:bg-background">
          <div className="flex justify-end">
            <SheetClose>
              <Button variant={"ghost"}>
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
          <div className="flex flex-col space-y-2 text-left">
            <div className="flex items-center gap-x-3">
              <SheetTitle>
                {bundle.id.replace(/^(.{8}).+(.{8})$/, "$1").toUpperCase()}
              </SheetTitle>
            </div>
            <div
              onClick={async () => {
                if (navigator.clipboard) {
                  await navigator.clipboard.writeText(bundle.id);
                  toast.success("Copied to clipboard");
                } else {
                  console.log("Clipboard API not available");
                }
              }}
            >
              <SheetDescription>{bundle.id}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* <StatusBadge
            size="xs"
            color={pillColors[order.status] as Color}
            className={"mt-2 text-xs font-medium"}
          >
            {order.status}
          </StatusBadge> */}

          {bundle.user && (
            <div className="flex flex-wrap items-center gap-2">
              <Button size={"sm"} variant={"outline"}>
                <Link
                  href={`tel:${bundle.user?.phone_no}`}
                  className="flex items-center space-x-2"
                >
                  <span>Call</span>
                  <Phone className="h-4 w-4" />
                </Link>
              </Button>
              <Button size={"sm"} variant={"outline"}>
                <Link
                  href={`mailto:${bundle.user?.email}`}
                  className="flex items-center space-x-2"
                >
                  <span>Email</span>
                  <Mail className="h-4 w-4" />
                </Link>
              </Button>
              <Button size={"sm"} variant={"outline"}>
                <Link
                  href={`https://instagram.com/${bundle.user?.instagram_username}`}
                  className="flex items-center space-x-2"
                >
                  <span>IG</span>
                  <Instagram className="h-4 w-4" />
                </Link>
              </Button>
              {bundle.link_input.includes("pin") ? (
                <Button size={"sm"} variant={"outline"}>
                  <Link
                    href={bundle.link_input}
                    className="flex items-center space-x-2"
                  >
                    <span>Pintrest Board</span>
                    <ImPinterest2 className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button size={"sm"} variant={"outline"}>
                  <Link
                    href={`https://instagram.com/${bundle.user?.instagram_username}`}
                    className="flex items-center space-x-2"
                  >
                    <span>User Link</span>
                    <Globe className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="text-wrap grid gap-6 overflow-x-auto">
          <Card className={"mt-5 flex flex-col space-y-2"}>
            <p className="p-3 text-xs font-medium text-muted-foreground">
              Images in bundle
            </p>
            <CardContent className="flex items-center gap-3 flex-wrap">
              {bundle.images.map((url, index) => {
                return (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Image
                      onClick={() => setIsLightboxOpen(true)}
                      width={60}
                      height={60}
                      className="rounded-md"
                      src={bundle.images[index] ?? ""}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <ImageViewer
            isOpen={isLightboxOpen}
            setIsOpen={setIsLightboxOpen}
            images={bundle.images}
          />
          {bundle.user && (
            <>
              <div className="item-center flex w-full justify-normal gap-10">
                <RecordText title="Name" value={bundle.user?.name ?? ""} />
                <RecordText
                  title="Phone"
                  value={`${bundle.user?.phone_no}` ?? ""}
                />
              </div>
              <RecordText title="Email" value={bundle.user?.email} />
              <RecordText
                title="Date"
                value={format(
                  new Date(bundle.created_at ?? new Date()),
                  "dd/MM/yy, hh:mm a",
                )}
              />
            </>
          )}
          <div className="my-4">
            <Separator />
          </div>
          <div>
            <div className="grid grid-cols-1 gap-3">
              <RecordText
                title="Description"
                value={bundle.bundle_description}
              />
              <RecordText
                title="Aesthetic"
                value={
                  bundle.aesthetics
                    ? bundle.aesthetics
                    : bundle.other_aesthetics ?? "Not provided"
                }
              />
              <RecordText
                title="Dislikes"
                value={bundle.fashion_dislikes ?? "Not provided"}
              />
              <RecordText title="Top Size" value={bundle.top_size.toUpperCase()} />
              <div className="flex items-center justify-normal gap-10">
                <RecordText
                  title="Bottom Length"
                  value={bundle.length ?? "Not provided"}
                />
                <RecordText
                  title="Bottom Waist"
                  value={bundle.waist ?? "Not provided"}
                />
              </div>
            </div>
          </div>
          <div className="my-4">
            <Separator />
          </div>
          <AcceptForm params={{ bundle_id: bundle.id }} />
        </div>
      </SheetContent>
    </>
  );
}
