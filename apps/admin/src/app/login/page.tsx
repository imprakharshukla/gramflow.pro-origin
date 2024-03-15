"use client";

import { Button, Input, Label, OtpInputComponent, buttonVariants } from "@gramflow/ui";
import { AppConfig, cn } from "@gramflow/utils";
import { useSession, signIn, signOut } from "next-auth/react"
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Icons } from "~/features/ui";

enum LoginState {
    Email,
    OTP
}

export default function Login() {
    const searchParams = useSearchParams()

    const redirect = searchParams.get('redirect') ?? "/dashboard/orders"

    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const emailRef = React.useRef<HTMLInputElement>(null)
    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
        }, 3000)
    }
    const { data: session } = useSession()

    const router = useRouter()
    useEffect(() => {
        if (session) {
            toast.success(`Logged in as ${session.user?.email}`)

            router.push(redirect)
        }
    }, [session])

    const [loginState, setLoginState] = useState(LoginState.Email)
    const [otpEnterComplete, setOtpEnterComplete] = useState(false)
    const [otp, setOtp] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    return (
        <>
            <div className="flex items-center justify-center h-screen -mt-16">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <img className="mx-auto" src="/cl_logo_dark.png" width={200} alt="" />
                    <div className="flex flex-col space-y-2 text-center">
                        {/* <h1 className="text-2xl font-semibold tracking-tight">
                            Continue to {AppConfig.StoreName} {" "}
                            <span className="">🎀</span>
                        </h1> */}
                        <p className="text-sm text-muted-foreground">
                            Enter your email below to continue.
                        </p>
                    </div>
                    <div className={cn("grid gap-6")}>
                        <form onSubmit={onSubmit}>
                            <div className="grid gap-2">
                                <div className="grid gap-1">
                                    {loginState === LoginState.Email ?
                                        <>
                                            <Label className="sr-only" htmlFor="email">
                                                Email
                                            </Label>
                                            <Input
                                                id="email"
                                                ref={emailRef}
                                                placeholder="name@example.com"
                                                type="email"
                                                autoCapitalize="none"
                                                autoComplete="email"
                                                autoCorrect="off"

                                                disabled={isLoading}
                                            />
                                        </>
                                        : <div className="my-4">
                                            <OtpInputComponent maxLength={6} onOtpChangeFunction={setOtp} otpEnterCompleteFunction={setOtpEnterComplete} />
                                        </div>
                                    }
                                </div>
                                <Button disabled={isLoading || (loginState === LoginState.OTP && !otpEnterComplete)} onClick={() => {
                                    if (loginState === LoginState.Email) {
                                        const email = emailRef.current?.value
                                        const validated = z.string().email().safeParse(email)
                                        if (validated.success) {
                                            setIsLoading(true)
                                            setEmail(validated.data)
                                            signIn("email", { email: validated.data, redirect: false }).then((res) => {
                                                console.log(res)
                                                toast.success("Email sent")
                                                setLoginState(LoginState.OTP)
                                            }).catch((err) => {
                                                console.log(err)
                                            }).finally(() => {
                                                setIsLoading(false)
                                            })
                                        } else {
                                            toast.error("Invalid email")
                                        }
                                    } else {
                                        setIsLoading(true)
                                        const url = `/api/auth/callback/email?email=${encodeURIComponent(
                                            email ?? ""
                                        )}&token=${otp}${"" ? `&callbackUrl=${redirect}` : ''}`
                                        console.log({
                                            url
                                        })
                                        // @TODO error handling
                                        window.location.href = url;
                                    }

                                }}>
                                    {isLoading && (
                                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {loginState === LoginState.Email ? "Continue with Email" : "Verify OTP"}
                                </Button>
                            </div>
                        </form>


                    </div>
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By clicking continue, you agree to our{" "}
                        <Link
                            href="/terms"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                            href="/privacy"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div >
            </div >
        </>
    )
}
