import { notFound } from "next/navigation";
import { geographyByRoute } from "@/lib/geo/repository";
import { geographyMetadata } from "@/lib/geo/page";
import GeographyPage from "@/components/geo/GeographyPage";
export const dynamic = "force-dynamic";
type Props = {
  params: Promise<{ state: string; county: string }>;
  searchParams: Promise<{ page?: string }>;
};
export async function generateMetadata({ params }: Props) {
  const p = await params;
  return geographyMetadata(`/county/${p.state}/${p.county}`);
}
export default async function Page({ params, searchParams }: Props) {
  const p = await params;
  const geo = geographyByRoute(`/county/${p.state}/${p.county}`);
  if (!geo) notFound();
  return (
    <GeographyPage geo={geo} page={Number((await searchParams).page || 1)} />
  );
}
