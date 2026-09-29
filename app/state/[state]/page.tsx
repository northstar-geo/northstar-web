import { notFound } from "next/navigation";
import { geographyByRoute } from "@/lib/geo/repository";
import { geographyMetadata } from "@/lib/geo/page";
import GeographyPage from "@/components/geo/GeographyPage";
export const dynamic = "force-dynamic";
type Props = {
  params: Promise<{ state: string }>;
  searchParams: Promise<{ page?: string }>;
};
export async function generateMetadata({ params }: Props) {
  return geographyMetadata(`/state/${(await params).state}`);
}
export default async function Page({ params, searchParams }: Props) {
  const geo = geographyByRoute(`/state/${(await params).state}`);
  if (!geo) notFound();
  return (
    <GeographyPage geo={geo} page={Number((await searchParams).page || 1)} />
  );
}
