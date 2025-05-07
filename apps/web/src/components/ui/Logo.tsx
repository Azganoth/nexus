import { Link } from "$/components/ui/Link";
import logo from "$/images/Logo.png";
import logoWithName from "$/images/LogoWithName.png";
import Image from "next/image";

const description =
  "Logo do Nexus: um hexágono roxo com linhas pretas convergindo para o centro.";

interface Props {
  className?: string;
  variant: "icon-only" | "icon-and-name";
}

export function Logo({ className, variant }: Props) {
  return (
    <Link className={className} href="/" variant="unstyled">
      {variant === "icon-only" ? (
        <Image src={logo} alt={description} />
      ) : (
        <Image src={logoWithName} alt={description} />
      )}
    </Link>
  );
}
