"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Confetti from "react-confetti";

import { Button } from "@gramflow/ui";

export default function SuccessPage({
  params,
}: {
  params: { orderId: string };
}) {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });
  const [confettiPieces, setConfettiPieces] = useState(100);

  useEffect(() => {
    // Check if window is defined (client side) before accessing its properties
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      // Initial size
      handleResize();

      window.addEventListener("resize", handleResize);

      // Clean up the listener when the component is unmounted
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  useEffect(() => {
    // Gradually reduce confetti pieces after 4 seconds
    const timer = setInterval(() => {
      if (confettiPieces > 10) {
        setConfettiPieces(confettiPieces - 10);
      } else {
        clearInterval(timer);
      }
    }, 400);

    return () => clearInterval(timer);
  }, [confettiPieces]);

  return (
    <div className={"max-auto flex items-center justify-center"}>
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        numberOfPieces={confettiPieces}
        gravity={0.1}
        colors={["black", "pink"]}
      />

      <div className=" mx-8 flex min-h-screen max-w-md flex-col items-center justify-center animate-in fade-in duration-200">
        <Link
          href="#"
          className="dark: group mt-5 flex w-fit space-x-1 rounded-full bg-white/30 px-5 py-2 text-center text-sm text-gray-600 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-lg active:shadow-sm dark:bg-gray-800/50 dark:text-white sm:mt-0 md:mt-5"
        >
          <p>
            Order ID- <span className={"font-medium"}>{params.orderId}</span>
          </p>
        </Link>
        <h1 className="bg-gradient-to-br from-black via-[#171717] to-[#4b4b4b] bg-clip-text pb-3 pt-4 text-center text-4xl font-medium tracking-tight text-transparent dark:text-white md:text-5xl ">
          Order Confirmed
        </h1>
        <p className={"text-center text-sm text-muted-foreground md:text-base"}>
          Thank you for your purchase. Your order is being processed. We will
          notify you about the shipping details via Email.
        </p>
        <Link href={"https://instagram.com/re_skinn"}>
          <Button className={"mt-4"}>Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}
