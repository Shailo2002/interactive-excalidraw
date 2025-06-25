import RoomCanvas from "@/components/RoomCanvas";

type Params = Promise<{ roomId: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const params = await props.params;
  const roomId = params.roomId;

  // Implement your metadata generation logic here
  return {
    title: `Room ${roomId} | Canvas`,
    description: `Collaborative canvas for room ${roomId}`,
    // ... other metadata properties
  };
}

export default async function CanvasPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const params = await props.params;
  const roomId = params.roomId;

  return <RoomCanvas roomId={roomId} />;
}
