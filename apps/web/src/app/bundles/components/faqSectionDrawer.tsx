"use client";

import React, { useState } from "react";
import { HelpCircle } from "lucide-react";

import {
  Button,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  ScrollArea,
  Separator,
} from "@gramflow/ui";

export const FAQSectionDrawer = ({
  faqItems,
  children,
}: {
  faqItems: {
    question: string;
    answer: string;
  }[];
  children: React.ReactNode;
}) => {
  const [snap, setSnap] = useState<number | string | null>("148px");

  return (
    <Drawer
      snapPoints={["355px", 1]}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
    >
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader>
            <DrawerTitle>Frequently Asked Questions</DrawerTitle>
            <DrawerDescription>
              Get the answers to your questions!
            </DrawerDescription>
          </DrawerHeader>
          <ScrollArea>
            <div className="mx-auto max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
              {/* Title */}
              {/* <div className="mx-auto mb-10 max-w-2xl text-center lg:mb-14">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 md:text-3xl md:leading-tight">
                Frequently Asked Questions
              </h2>
              <Separator className={"my-4"} />
            </div> */}
              {/* End Title */}

              <div className="mx-auto">
                {/* Grid */}
                <div className="grid gap-6 sm:grid-cols-2 md:gap-12">
                  {/* FAQ items */}
                  {faqItems.map((item, index) => (
                    <div key={index}>
                      <h3 className="text-md font-semibold lg:text-lg">
                        ❤︎ {item.question}
                      </h3>
                      <p className="mt-2 text-sm md:text-base">{item.answer}</p>
                    </div>
                  ))}
                  {/* End FAQ items */}
                </div>
                {/* End Grid */}
              </div>
            </div>
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
