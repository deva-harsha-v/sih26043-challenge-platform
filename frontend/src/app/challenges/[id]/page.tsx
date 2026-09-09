export default function ChallengeDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Challenge Detail {params.id}</h1>
    </div>
  );
}
