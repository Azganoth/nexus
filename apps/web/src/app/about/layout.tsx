import { Logo } from "$/components/ui/Logo";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="tablet:p-12 pb-32! p-8">
      <header>
        <Logo className="mx-auto" variant="icon-and-name" />
      </header>
      {children}
    </div>
  );
}
