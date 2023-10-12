"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Text, Title } from "@tremor/react";
import { HomeIcon } from "lucide-react";
import { type z } from "zod";

import { type PostsModel } from "@acme/db/prisma/zod";
import { Button, Loader } from "@acme/ui";

import { getGreetings } from "~/app/dashboard/page";
import { GreetingsComponent } from "~/features/ui/components/greetingsComponent";
import { OrderFormComponent } from "./formComponent";
import OrderCreationSuccessComponent from "./orderCreationSuccessComponent";

export enum State {
  Loading,
  Selection,
  Form,
  Success,
}
export const GridComponent = ({
  posts,
  page,
  state,
}: {
  posts: z.infer<typeof PostsModel>[];
  page: number;
  limit: number;
  state: State;
}) => {
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
    console.log({ selectedImages });
  }, [selectedImages]);

  return (
    <div className="px-4 py-5 lg:px-10">
      {state === State.Loading && <Loader />}
      {state === State.Selection && (
        <div className="">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Title>Create Order</Title>
              <GreetingsComponent text="please select the pictures you want to create the orders with." />
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() =>
                  router.push(`/new?page=${page}&state=${State.Form}`)
                }
                disabled={selectedImages.length <= 0}
              >
                Proceed
              </Button>
              <Button onClick={() => router.push(`/`)} variant={"outline"}>
                <HomeIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 py-4 md:grid-cols-3 lg:grid-cols-4">
            {posts &&
              posts.map((post) => {
                return post.slides.map((slide, index) => {
                  const isSelected = selectedImages.some(
                    (image) => image.url === slide,
                  );

                  const caption = post.caption;

                  return (
                    <div
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
                      <img
                        alt=""
                        src={slide}
                        className={`h-full w-full object-cover ${
                          isSelected ? "opacity-100" : "opacity-80"
                        } transition-opacity duration-300 ease-in-out`}
                      />
                    </div>
                  );
                });
              })}
          </div>{" "}
          <div className="flex space-x-6">
            <Button
              onClick={() =>
                router.push(
                  `/new?page=${page > 1 ? page - 1 : 1}&state=${state}`,
                )
              }
            >
              Previous
            </Button>

            <Button
              onClick={() =>
                router.push(`/new?page=${page + 1}&state=${state}`)
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
      {state === State.Form && (
        <div>
          <OrderFormComponent
            page={page}
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
    </div>
  );
};
