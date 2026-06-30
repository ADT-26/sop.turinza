import { notFound } from "next/navigation";
import { obtenerSopPorId } from "@/lib/sopStore";
import { EditarSopForm } from "@/components/dashboard/EditarSopForm";

export const dynamic = "force-dynamic";

export default async function EditarSopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sop = await obtenerSopPorId(id);
  if (!sop) notFound();

  return <EditarSopForm id={sop.id} valoresIniciales={sop.data} />;
}
