import { Logo } from "$/components/ui/Logo";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 pb-32 pt-6">
      <header>
        <Logo className="mx-auto" variant="icon-and-name" />
      </header>
      {children}
    </div>
  );
}
