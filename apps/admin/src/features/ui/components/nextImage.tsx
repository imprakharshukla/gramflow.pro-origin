import Image, { StaticImageData } from "next/image";
import {
  RenderSlideProps,
  isImageFitCover,
  useLightboxProps,
  isImageSlide,
  Slide,
} from "yet-another-react-lightbox";

function isNextJsImage(slide: Slide): slide is StaticImageData {
  return (
    isImageSlide(slide) &&
    typeof slide.width === "number" &&
    typeof slide.height === "number"
  );
}

/*
 * For JavaScript version of this sandbox please visit
 * https://codesandbox.io/p/sandbox/yet-another-react-lightbox-nextjs-bfjgb0?file=%2Fpages%2Findex.jsx
 */
export default function NextJsImage({
  slide,
  rect,
}: Pick<RenderSlideProps, "slide" | "rect">) {

  if (!isNextJsImage(slide)) return undefined;

  const width =
    rect.width;

  const height = rect.height;

  return (
    <div style={{ position: "relative", width, height }}>
      <Image
        fill
        alt=""
        src={slide.src}
        loading="eager"
        draggable={false}
        placeholder={slide.blurDataURL ? "blur" : undefined}
        style={{ objectFit: "contain" }}
        sizes={`${Math.ceil((width / window.innerWidth) * 100)}vw`}
      />
    </div>
  );
}
