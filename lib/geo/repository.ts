import { readAsset } from "./asset-loader";
import { createRepository } from "./shard-repository";
export { createRepository } from "./shard-repository";
export const {
  data,
  geography,
  geographyByRoute,
  relatedPage,
  stateFor,
  indexable,
  search,
  nearby,
  asset,
} = createRepository(readAsset);
