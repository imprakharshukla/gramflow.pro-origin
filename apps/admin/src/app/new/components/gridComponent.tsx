"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Text, Title } from "@tremor/react";
import { motion } from "framer-motion";
import { HomeIcon } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { type z } from "zod";

import { type PostsModel } from "@acme/db/prisma/zod";
import { Button, Loader, Separator } from "@acme/ui";

import { GreetingsComponent } from "~/features/ui/components/greetingsComponent";
import { OrderFormComponent } from "./formComponent";
import OrderCreationSuccessComponent from "./orderCreationSuccessComponent";

export enum State {
  Loading,
  Selection,
  Form,
  Success,
}
export const GridComponent = ({ state }: { state: State }) => {
  const fetchPosts = async ({
    page,
    limit,
  }: {
    page: number;
    limit: number;
  }) => {
    const response = await fetch(
      `/api/posts?page=${page}&results=${limit}`,
    ).then((res) => res.json());

    return response;
  };
  const LIMIT = 5;
  const { ref, inView } = useInView();

  const { data, isSuccess, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery<z.infer<typeof PostsModel>[]>(
      ["posts", LIMIT],
      ({ pageParam = 1 }) => fetchPosts({ page: pageParam, limit: LIMIT }),
      {
        getNextPageParam: (lastPage, allPages) => {
          const nextPage =
            lastPage.length === LIMIT ? allPages.length + 1 : undefined;
          return nextPage;
        },
      },
    );
  const router = useRouter();
  const [selectedImages, setSelectedImages] = useState<
    { parent: string; url: string; index: number; caption: string }[]
  >([]);

  const [generatedOrderId, setGeneratedOrderId] = useState<string>("");

  const toggleImageSelection = (
    slide: string,
    parent: string,
    index: number,
    caption: string,
  ) => {
    const selectedIndex = selectedImages.findIndex(
      (image) => image.url === slide,
    );

    if (selectedIndex !== -1) {
      // Image is already selected, remove it from the list
      setSelectedImages((prevSelectedImages) =>
        prevSelectedImages.filter((image) => image.url !== slide),
      );
    } else {
      // Image is not selected, add it to the list
      setSelectedImages((prevSelectedImages) => [
        ...prevSelectedImages,
        { parent: parent + "/", url: slide, index, caption },
      ]);
    }
  };

  useEffect(() => {
    if (inView && hasNextPage) {
      console.log("Component in view!");
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  useEffect(() => {
    console.log({ selectedImages });
  }, [selectedImages]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 py-5 lg:px-10"
    >
      {state === State.Loading && (
        <div className="flex min-h-screen items-center justify-center">
          <Loader />
        </div>
      )}
      {state === State.Selection && (
        <div className="">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Title>Create Order</Title>
              <GreetingsComponent text="please select the pictures you want to create the orders with." />
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => router.push(`/new?state=${State.Form}`)}
                disabled={selectedImages.length <= 0}
              >
                Proceed
              </Button>
              <Button onClick={() => router.push(`/`)} variant={"outline"}>
                <HomeIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {selectedImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="my-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4"
            >
              {selectedImages.map((image) => {
                return (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={image.url}
                    className="relative"
                  >
                    <img
                      src={image.url}
                      alt={"selected image"}
                      className="h-full w-full object-cover"
                    />
                    <div
                      className="absolute right-1 top-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white"
                      onClick={() =>
                        setSelectedImages((prevSelectedImages) =>
                          prevSelectedImages.filter(
                            (selectedImage) => selectedImage.url !== image.url,
                          ),
                        )
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 11.414l4.95 4.95 1.414-1.414L11.414 10l4.95-4.95-1.414-1.414L10 8.586 5.05 3.636 3.636 5.05 8.586 10l-4.95 4.95 1.414 1.414L10 11.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
          {selectedImages.length > 0 && <Separator />}
          <div className="grid grid-cols-2 gap-3 py-4 md:grid-cols-3 lg:grid-cols-4">
            {isSuccess &&
              data.pages.map((page) => {
                return page.map((post, index) => {
                  return post.slides.map((slide) => {
                    const isSelected = selectedImages.some(
                      (image) => image.url === slide,
                    );

                    const caption = post.caption;

                    return (
                      <div
                        ref={page.length === index + 1 ? ref : null}
                        key={slide}
                        className={`relative rounded ${
                          isSelected ? "brightness-125" : "grayscale filter"
                        } transition-opacity duration-300 ease-in-out`}
                        onClick={() => {
                          console.log({ slide, parent: post.post_link, index });
                          toggleImageSelection(
                            slide,
                            post.post_link,
                            index,
                            caption,
                          );
                        }}
                      >
                        <Image
                          alt=""
                          height={100}
                          width={100}
                          src={slide}
                          className={`h-full w-full object-cover ${
                            isSelected ? "opacity-100" : "opacity-80"
                          } transition-opacity duration-300 ease-in-out`}
                        />
                      </div>
                    );
                  });
                });
              })}
          </div>{" "}
          {isFetchingNextPage && <Loader />}
        </div>
      )}
      {state === State.Form && (
        <div className="mx-auto w-full">
          <OrderFormComponent
            setSelectedImages={setSelectedImages}
            setGeneratedOrderId={setGeneratedOrderId}
            selectedPosts={selectedImages}
          />
        </div>
      )}
      {state === State.Success && (
        <div>
          <OrderCreationSuccessComponent generatedOrderId={generatedOrderId} />
        </div>
      )}
    </motion.div>
  );
};
