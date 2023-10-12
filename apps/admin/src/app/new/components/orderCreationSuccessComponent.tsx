import Link from "next/link";
import { useRouter } from "next/navigation";
import { Title } from "@tremor/react";
import { HomeIcon, RefreshCcw } from "lucide-react";
import { toast } from "react-hot-toast";
import { AppConfig } from "@acme/utils";
import { Button } from "@acme/ui";

import { GreetingsComponent } from "~/features/ui/components/greetingsComponent";

export default function OrderCreationSuccessComponent({
  generatedOrderId,
}: {
  generatedOrderId: string;
}) {
  const router = useRouter();
  const handleShareButton = async () => {
    const text = `Thank you for your order love 🥰. Please fill up the details by clicking the following link- ${AppConfig.BaseOrderUrl}/order/${generatedOrderId}. This is a one time process and the details will be saved for future orders. You can visit the link anytime to track your order.`;
    if (navigator.share) {
      try {
        await navigator
          .share({ text })
          .then(() =>
            console.log("Hooray! Your content was shared to tha world"),
          );
      } catch (error) {
        console.log(`Oops! I couldn't share to the world because: ${error}`);
      }
    } else {
      // fallback code
      //copy the text
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
      } else {
        console.log("Clipboard API not available");
      }
    }
  };

  return (
    <>
      {generatedOrderId && (
        <div>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Title>Order Created ✅</Title>
                <GreetingsComponent
                  text={`Your order ${generatedOrderId} has been created successfully.`}
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  variant={"outline"}
                  onClick={() => {
                    router.push(`/new`);
                  }}
                >
                  Create Another Order
                </Button>
                <Button onClick={() => router.push(`/`)} variant={"outline"}>
                <HomeIcon className="h-4 w-4" />
              </Button>
              </div>
            </div>
          </div>

          <div className="flex w-fit cursor-pointer flex-col space-y-4 py-4">
            <p>Order ID: {generatedOrderId}</p>
            <div className="mb-5 flex gap-x-3 pb-5">
              <Button
                className="w-fit"
                onClick={handleShareButton}
                variant="default"
              >
                Copy Template Message
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
