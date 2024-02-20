import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@gramflow/ui";

export const ImageViewer = ({
  images,
  isOpen,
  setIsOpen,
}: {
  images: string[];
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <>
      {isOpen && (
        <div
          className="fixed top-0 left-0 z-50 h-full w-full bg-black opacity-50"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
      {isOpen && (
        <div className="fixed top-1/2 left-1/2 z-50 w-1/2 -translate-x-1/2 -translate-y-1/2 transform">
          <Carousel>
            <CarouselContent>
              {images.map((image, index) => {
                return (
                  <CarouselItem
                    key={index}
                    className="flex h-full w-full items-center justify-center overflow-hidden"
                  >
                    <div className="relative w-full pt-[200%] lg:pt-[100%] h-full rounded-lg" style={{ backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                      <div className="absolute top-2 right-2">
                        <div className="rounded-lg bg-black bg-opacity-40 px-2 py-1.5">
                          <p className="text-sm">
                            {index + 1}/{images.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            
            <CarouselPrevious />
            <CarouselNext />
            
          </Carousel>
        </div>
      )}
    </>
  );
};
