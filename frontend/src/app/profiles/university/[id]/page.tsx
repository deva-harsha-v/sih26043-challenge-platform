export default function UniversityProfilePage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">University Profile {params.id}</h1>
    </div>
  );
}
