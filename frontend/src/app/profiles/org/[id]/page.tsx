export default function OrgProfilePage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Organization Profile {params.id}</h1>
    </div>
  );
}
