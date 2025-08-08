import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import room101 from "@/assets/room-101.jpg";
import room102 from "@/assets/room-102.jpg";
import room103 from "@/assets/room-103.jpg";

export type RoomInfo = {
  id: string;
  label: string;
  type: string;
  price: number;
  image: string;
};

const FloorPlan = () => {
  const rooms = useMemo<RoomInfo[]>(
    () => [
      { id: "101", label: "Room 101", type: "King Room", price: 189, image: room101 },
      { id: "102", label: "Room 102", type: "Double Room", price: 169, image: room102 },
      { id: "103", label: "Room 103", type: "Suite", price: 249, image: room103 },
      { id: "104", label: "Room 104", type: "King Room", price: 199, image: room101 },
      { id: "105", label: "Room 105", type: "Double Room", price: 179, image: room102 },
      { id: "106", label: "Room 106", type: "Suite", price: 259, image: room103 },
      { id: "107", label: "Room 107", type: "King Room", price: 209, image: room101 },
      { id: "108", label: "Room 108", type: "Double Room", price: 189, image: room102 },
    ],
    []
  );

  const [selected, setSelected] = useState<RoomInfo | null>(rooms[0]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Stylized plan using grid blocks */}
      <div className="rounded-lg border p-4">
        <div
          className="grid grid-cols-4 gap-3"
          role="listbox"
          aria-label="Hotel floor plan rooms"
        >
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelected(room)}
              className={`relative aspect-square rounded-md border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                selected?.id === room.id ? "ring-2 ring-ring" : "hover:translate-y-[-2px]"
              } group bg-accent/40`}
              role="option"
              aria-selected={selected?.id === room.id}
            >
              <span className="absolute inset-0 rounded-md bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="absolute bottom-2 left-2 rounded bg-background/80 px-2 py-1 text-xs font-medium">
                {room.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview card */}
      <Card className="overflow-hidden card-elevated">
        {selected && (
          <div className="relative aspect-[3/2] overflow-hidden">
            <img
              src={selected.image}
              alt={`${selected.label} preview`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
          </div>
        )}
        <CardContent className="space-y-2 p-4">
          <h3 className="text-lg font-semibold leading-tight">{selected?.label}</h3>
          <p className="text-sm text-muted-foreground">{selected?.type} • Sleeps 2</p>
          <p className="text-base font-semibold">${selected?.price} / night</p>
          <div className="pt-2">
            <Button variant="hero" className="w-full">Book Now</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FloorPlan;
