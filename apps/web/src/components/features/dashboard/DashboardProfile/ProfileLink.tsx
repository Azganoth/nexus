import { Icon } from "$/components/ui/Icon";
import { Link } from "$/components/ui/Link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { AuthenticatedLink } from "@repo/shared/contracts";
import clsx from "clsx";
import { useState } from "react";
import { DeleteLinkModal } from "./modals/DeleteLinkModal";
import { EditLinkModal } from "./modals/EditLinkModal";

interface ProfileLinkProps {
  link: AuthenticatedLink;
  onDelete: () => void;
  onEdit: () => void;
  onToggleVisibility: (linkId: number, currentVisibility: boolean) => void;
}

export function ProfileLink({
  link,
  onDelete,
  onEdit,
  onToggleVisibility,
}: ProfileLinkProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // dnd
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      className={clsx(
        "rounded-4xl flex items-center gap-4 bg-white p-4 shadow-lg transition-all duration-200 ease-in-out",
        isDragging && "z-50",
      )}
      style={style}
    >
      <button
        className="text-medium-grey focus-ring cursor-grab py-1 active:cursor-grabbing"
        type="button"
        aria-label="Reordenar link"
        {...attributes}
        {...listeners}
      >
        <Icon className="icon-[ph--dots-six-vertical-bold] text-2xl" />
      </button>
      <div className="min-w-0 grow">
        <h3 className="font-bold">{link.title}</h3>
        <Link
          className="text-dark-grey hover:text-purple focus-ring truncate !no-underline"
          href={link.url}
          newTab
          aria-label={`Visitar ${link.title} (abre em nova aba)`}
        >
          {link.url.replace(/^https?:\/\//, "")}
        </Link>
      </div>
      <div
        className="flex items-center gap-4"
        role="group"
        aria-label="Ações do link"
      >
        <button
          className="text-dark-grey focus-ring hover:text-black"
          type="button"
          aria-label={`Editar link: ${link.title}`}
          onClick={() => setIsEditModalOpen(true)}
        >
          <Icon className="icon-[fa6-solid--pen] text-lg" />
        </button>
        <button
          className="text-dark-grey focus-ring hover:text-black"
          type="button"
          aria-label={
            link.isPublic
              ? `Esconder link: ${link.title}`
              : `Mostrar link: ${link.title}`
          }
          onClick={() => onToggleVisibility(link.id, link.isPublic)}
        >
          <Icon
            className={`min-w-[30px] text-xl ${
              link.isPublic
                ? "icon-[fa6-solid--eye]"
                : "icon-[fa6-solid--eye-slash]"
            }`}
          />
        </button>
        <button
          className="text-dark-grey focus-ring hover:text-black"
          type="button"
          aria-label={`Excluir link: ${link.title}`}
          onClick={() => setIsDeleteModalOpen(true)}
        >
          <Icon className="icon-[fa6-solid--trash] text-lg" />
        </button>
      </div>
      <EditLinkModal
        link={link}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onEdit={onEdit}
      />
      <DeleteLinkModal
        link={link}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
        }}
        onDelete={onDelete}
      />
    </li>
  );
}
