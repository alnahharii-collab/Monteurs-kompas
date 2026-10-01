import type { Source } from '@/domain/sources';
import { provider } from '@/services/diagnosis-provider';

export function resolveSources(ids: string[]): Array<Source | null> {
  return ids.map((id) => provider.getSource(id));
}
