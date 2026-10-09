import { notFound } from "next/navigation";
import { geography } from "@/lib/geo/repository";
import { geographyMetadata } from "@/lib/geo/page";
import GeographyPage from "@/components/geo/GeographyPage";
export const dynamic = "force-dynamic";
type Props = {
  params: Promise<{ zip: string }>;
  searchParams: Promise<{ page?: string }>;
};
export async function generateMetadata({ params }: Props) {
  return geographyMetadata(`/zip/${(await params).zip}`);
}
export default async function Page({ params, searchParams }: Props) {
  const { zip } = await params;
  if (!/^\d{5}$/.test(zip)) notFound();
  const geo = await geography(`zcta:${zip}`);
  if (!geo) notFound();
  return (
    <GeographyPage geo={geo} page={Number((await searchParams).page || 1)} />
  );
}
