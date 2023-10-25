"use client"

import Link from "next/link";
import Confetti from 'react-confetti'
import {useEffect, useState} from "react";
import {Button} from "@gramflow/ui";

export default function SuccessPage({params}: { params: { orderId: string } }) {
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
    <div className={"flex items-center justify-center max-auto"}>
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        numberOfPieces={confettiPieces}
        gravity={0.1}
        colors={["black", "pink"]}
      />
      <div
        className=" animate-in fade-in duration-200 flex mx-8 max-w-md min-h-screen flex-col items-center justify-center">

        <Link
          href=""
          className="group mt-5 md:mt-10 sm:mt-0 rounded-full flex space-x-1 text-center bg-white/30 shadow-sm ring-1 ring-gray-900/5 text-gray-600 text-sm px-5 py-2 hover:shadow-lg active:shadow-sm transition-all"
        >
          <p>Order ID- <span className={"font-medium"}>{params.orderId}</span></p>
        </Link>
        <h1
          className="pt-4 pb-4 bg-gradient-to-br from-black via-[#171717] to-[#4b4b4b] bg-clip-text text-center text-4xl font-semibold mt-4 tracking-tight text-transparent pinkmd:text-6xl">
          Order Confirmed
        </h1>
        <p className={"text-center text-muted-foreground text-sm md:text-base"}>Thank you for your purchase.
          Your order is being processed. We will notify you about the shipping details via Email.</p>
        <Link href={"https://instagram.com/re_skinn"}>
          <Button className={"mt-4"}>Continue Shopping</Button>
        </Link>
      </div>
    </div>
  )
}
