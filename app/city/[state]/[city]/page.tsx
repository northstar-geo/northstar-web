import { notFound } from "next/navigation";
import { geographyByRoute } from "@/lib/geo/repository";
import { geographyMetadata } from "@/lib/geo/page";
import GeographyPage from "@/components/geo/GeographyPage";
export const dynamic = "force-dynamic";
type Props = {
  params: Promise<{ state: string; city: string }>;
  searchParams: Promise<{ page?: string }>;
};
export async function generateMetadata({ params }: Props) {
  const p = await params;
  return geographyMetadata(`/city/${p.state}/${p.city}`);
}
export default async function Page({ params, searchParams }: Props) {
  const p = await params;
  const geo = await geographyByRoute(`/city/${p.state}/${p.city}`);
  if (!geo) notFound();
  return (
    <GeographyPage geo={geo} page={Number((await searchParams).page || 1)} />
  );
}
