type GamePageProps = {
  params: Promise<{ game: string }>;

export default async function GamePage({ params }: GamePageProps) {
  const { game } = await params;

  return (
    <div className="flex h-full w-full items-center justify-center">
      <h1 className="text-3xl font-bold">Game Page: {game}</h1>
    </div>
  );
}
