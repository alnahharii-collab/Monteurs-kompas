import { SearchX } from 'lucide-react';
import { AppHeader } from '@/components/ui/AppHeader';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';

export function ApplianceNotFound() {
  return (
    <Screen header={<AppHeader back={{ href: '/toestellen', label: 'Terug naar toestellen' }} title="Toestel" />}>
      <EmptyState
        icon={<SearchX size={24} />}
        title="Toestel niet gevonden"
        action={<ButtonLink href="/toestellen">Toestel zoeken</ButtonLink>}
      >
        Dit toestel staat niet in Monteur Kompas. Zoek het toestel opnieuw.
      </EmptyState>
    </Screen>
  );
}
