import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ReactElement } from "react";

interface ComponentProps {
  id: number | string;
  children: ReactElement;
  className?: string;
  DragHandler?: React.FC;
}

export const SortableItem = (props: ComponentProps) => {
  const { DragHandler, className } = props;
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return DragHandler ? (
    <div ref={setNodeRef} style={style} className={className}>
      <DragHandler {...attributes} {...listeners} />
      {props.children}
    </div>
  ) : (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={className}>
      {props.children}
    </div>
  );
};
