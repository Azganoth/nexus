"use client";

import { Icon } from "$/components/ui/Icon";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { AuthenticatedLink } from "@repo/shared/contracts";
import { ProfileLink } from "./ProfileLink";

interface ProfileLinkListProps {
  links: AuthenticatedLink[];
  onDelete: () => void;
  onEdit: () => void;
  onToggleVisibility: (linkId: number, currentVisibility: boolean) => void;
  onReorder: (orderedIds: number[]) => void;
}

export function ProfileLinkList({
  links,
  onDelete,
  onEdit,
  onToggleVisibility,
  onReorder,
}: ProfileLinkListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250,
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = links.findIndex((link) => link.id === active.id);
    const newIndex = links.findIndex((link) => link.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(links, oldIndex, newIndex);
      const orderedIds = newOrder.map((link) => link.id);
      onReorder(orderedIds);
    }
  };

  if (links.length === 0) {
    return (
      <div
        className="mt-16 flex flex-col items-center"
        role="status"
        aria-live="polite"
      >
        <Icon className="icon-[fa6-solid--link-slash] text-4xl text-black/50" />
        <h3 className="mt-8 text-lg font-semibold">Nenhum link adicionado</h3>
        <p className="text-sm">Adicione seu primeiro link!</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={links.map((link) => link.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul
          className="desktop:max-w-[600px] mt-8 w-full max-w-[500px] space-y-8"
          aria-label="Lista de links do perfil"
        >
          {links.map((link) => (
            <ProfileLink
              key={link.id}
              link={link}
              onDelete={onDelete}
              onEdit={onEdit}
              onToggleVisibility={onToggleVisibility}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
