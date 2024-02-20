export const RecordText = ({ title, value }: { title: string; value: string }) => {
    return (
      <div
        onClick={async () => {
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(value);
            toast.success("Copied to clipboard");
          } else {
            console.log("Clipboard API not available");
          }
        }}
        className="overflow-wrap flex w-fit transform cursor-pointer flex-col gap-2 break-words transition duration-300 ease-in-out hover:-translate-y-1"
      >
        <div className="flex items-center">
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
        <p className="text-md font-medium">{value}</p>
      </div>
    );
  };