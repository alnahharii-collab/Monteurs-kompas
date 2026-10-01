import { MapPinOff } from 'lucide-react';
import { AppHeader } from '@/components/ui/AppHeader';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';

export default function NotFound() {
  return (
    <Screen header={<AppHeader back={{ href: '/', label: 'Naar start' }} title="Monteur Kompas" />}>
      <EmptyState icon={<MapPinOff size={24} />} title="Pagina niet gevonden" action={<ButtonLink href="/">Naar start</ButtonLink>}>
        Deze pagina bestaat niet.
      </EmptyState>
    </Screen>
  );
}
