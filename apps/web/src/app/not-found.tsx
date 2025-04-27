import { ErrorPage } from "$/components/ErrorPage";

export default function NotFound() {
  return ErrorPage({
    name: "404",
    message:
      "Essa página se perdeu no universo.\nO link pode estar errado ou não existe mais.",
  });
}
