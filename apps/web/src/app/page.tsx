import { ApiStatus } from "@components/ApiStatus";
import { CounterButton } from "@components/CounterButton";
import { CustomLink } from "@components/Link";
import { Visitors } from "@components/Visitors";

export default function Page() {
  return (
    <div className="flex flex-col min-h-dvh gap-4 items-center justify-center">
      <h1 className="font-bold text-4xl">Web</h1>
      <ApiStatus />
      <CounterButton />
      <Visitors />
      <CustomLink href="/">Home</CustomLink>
    </div>
  );
}
