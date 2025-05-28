import { Link } from "$/components/ui/Link";

export default function AboutIndexPage() {
  return (
    <main className="mt-16">
      <h1 className="mb-8 text-center text-2xl font-semibold">Sobre</h1>
      <ul className="space-y-4 text-center text-lg">
        <li>
          <Link href="/about/tos">Termos de Serviço</Link>
        </li>
        <li>
          <Link href="/about/privacy">Política de Privacidade</Link>
        </li>
        <li>
          <Link href="/about/cookies">Política de Cookies</Link>
        </li>
      </ul>
    </main>
  );
}
