"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { Button, Separator } from "@gramflow/ui";

import { FAQSectionDrawer } from "~/app/bundles/components/faqSectionDrawer";
import { AppConfig } from "@gramflow/utils";

export default function HeroSection({
  props,
}: {
  props: {
    areBundlesAvailable: boolean;
  };
}) {
  const { areBundlesAvailable } = props;
  const { theme, setTheme } = useTheme();
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    setIsDarkTheme(theme === "dark" || (theme === "system" && prefersDark));
  }, [theme]);

  const logoSrc = isDarkTheme ? "/cl_logo_dark.png" : "/cl_logo.png";
  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={""}
    >
      <div className="min-h-screen">
        <div className="">
          <FAQSectionDrawer
            faqItems={[
              {
                question: `What is ${AppConfig.StoreName}?`,
                answer:
                  "We are a thrift store that sources clothes for various styles and sizes.",
              },
              {
                question: "Were are we based out of?",
                answer:
                  "We are based out of the Delhi NCR, India. We ship nationwide.",
              },
              {
                question: "Do we ship internationally?",
                answer:
                  "We do not ship internationally at the moment. We are working on it.",
              },
              {
                question: "Can I return my order?",
                answer:
                  "We do not accept returns at the moment but in case of any issues, please reach out to us at.",
              },
              {
                question: "How can I track my order?",
                answer:
                  "You can track your orders by clicking on the link provided to you for filling your information. You will also be notified via email.",
              },
              {
                question: "How do we ship?",
                answer:
                  "We ship via Delhivery. We will defult to surface shipping but if you want express shipping, please reach out to us at.",
              },
            ]}
          >
            <div className="flex items-center justify-end">
              <Button
                // onClick={handleShareButton}
                size={"sm"}
                className="m-3 -mb-5 flex w-fit justify-end space-x-2"
                variant={"outline"}
              >
                <span>FAQs</span>
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
          </FAQSectionDrawer>
          <div className="mx-auto max-w-[85rem] px-4 pb-10 pt-24 sm:px-6 lg:px-8">
            <div className="flex justify-center"></div>

            <img src={logoSrc} className="mx-auto mt-4 h-24" alt="" />
            {/* End Title */}

            <div className="mx-auto mt-5 max-w-3xl text-center">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {AppConfig.StoreName} is your one-stop thrift store for all your
                thrifting needs.
              </p>
            </div>

            {/* Buttons */}

            <div className="mt-5 flex items-center justify-center gap-x-2">
              <Button
                onClick={() => {
                  if (areBundlesAvailable) {
                    window.location.href = "/bundles";
                  } else {
                    toast.error(
                      "We are not accepting new bundle requests at the moment. Please check back later.",
                    );
                  }
                }}
              >
                Book a Bundle
              </Button>
              <Button variant={"outline"}>
                <Link href={"https://instagram.com/re_skinn"}>Shop @ IG</Link>
              </Button>
            </div>
            {/* End Buttons */}

            <div className="prose mx-auto mt-10">
              {/* <h1 className="">Presenting Bundles</h1> */}
              <div>
                <Separator className={"mb-10"} />
                <div className="not-prose w-full rounded-xl border bg-muted shadow-sm  dark:shadow-slate-700/[.7] sm:flex">
                  <div className="sm:rounded-s-xl md:rounded-se-none relative w-full flex-shrink-0 overflow-hidden rounded-t-xl pt-52 sm:max-w-[15rem] md:max-w-xs">
                    <img
                      className="start-0 absolute top-0 object-cover"
                      src="/bundles_header_img.jpg"
                      alt="Image Description"
                    />
                  </div>
                  <div className="flex flex-wrap">
                    <div className="flex h-full flex-col p-4 sm:p-5">
                      <h3 className="not-prose text-lg font-bold text-gray-800 no-underline dark:text-white">
                        {AppConfig.StoreShortName} Bundles
                      </h3>
                      <p className="not-prose mt-1 text-gray-500 no-underline dark:text-gray-400">
                        Book your very own bundle of clothes and accessories
                        that match your style and aesthetic.
                      </p>
                      <Button
                        onClick={() => {
                          if (areBundlesAvailable) {
                            window.location.href = "/bundles";
                          } else {
                            toast.error(
                              "We are not accepting new bundle requests at the moment. Please check back later.",
                            );
                          }
                        }}
                        variant={"link"}
                        className="mt-2 w-fit p-0 font-semibold text-primary "
                      >
                        Book your Bundle
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
