import { Link } from "$/components/ui/Link";
import logo from "$/images/Logo.png";
import logoWithName from "$/images/LogoWithName.png";
import Image from "next/image";

interface Props {
  className?: string;
  variant: "icon-only" | "icon-and-name";
}

export function Logo({ className, variant }: Props) {
  return (
    <Link className={className} href="/" variant="unstyled">
      {variant === "icon-only" ? (
        <Image
          src={logo}
          alt="Nexus logo: a purple hexagon with black lines converging into its center"
        />
      ) : (
        <Image
          src={logoWithName}
          alt="Nexus logo: a purple hexagon with black lines converging into its center"
        />
      )}
    </Link>
  );
}
