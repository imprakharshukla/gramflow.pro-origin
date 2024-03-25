import { Button } from "@gramflow/ui";
import Link from "next/link";

export default async function ProductsPage() {
    return (
        <>
            <div className="grid grid-cols-2 w-full max-w-6xl mt-3 lg:mt-0 -mb-3 gap-2">
                <div className="grid gap-2">
                    <h1 className="text-3xl font-semibold">Products</h1>
                    <p className="text-muted-foreground text-sm">View your product catalogue</p>
                </div>
                <div className="flex justify-end">
                    <Button size={"sm"}>
                        <Link href={"/dashboard/products/add"}>Add Products</Link>
                    </Button>
                </div>
            </div>
        </>
    )
}