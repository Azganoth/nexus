import { Link } from "$/components/ui/Link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="prose mt-16">{children}</main>
      <footer className="mt-16 text-center">
        <Link href="/about">About</Link>
      </footer>
    </>
  );
}
