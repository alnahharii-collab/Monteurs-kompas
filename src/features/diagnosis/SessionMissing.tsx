import { FileQuestion } from 'lucide-react';
import { AppHeader } from '@/components/ui/AppHeader';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';

export function SessionMissing({ title = 'Diagnose' }: { title?: string }) {
  return (
    <Screen header={<AppHeader back={{ href: '/', label: 'Naar start' }} title={title} />}>
      <EmptyState icon={<FileQuestion size={24} />} title="Sessie niet gevonden" action={<ButtonLink href="/">Naar start</ButtonLink>}>
        Deze diagnose staat niet op dit apparaat. Sessies worden lokaal bewaard: op een ander apparaat of na het wissen van
        browsergegevens zijn ze niet beschikbaar.
      </EmptyState>
    </Screen>
  );
}

export function CaseMissing({ title = 'Diagnose' }: { title?: string }) {
  return (
    <Screen header={<AppHeader back={{ href: '/', label: 'Naar start' }} title={title} />}>
      <EmptyState icon={<FileQuestion size={24} />} title="Nog niet beschikbaar" tone="warn" action={<ButtonLink href="/">Naar start</ButtonLink>}>
        De diagnoseboom van deze sessie staat niet (meer) in Monteur Kompas.
      </EmptyState>
    </Screen>
  );
}

export function Loading() {
  return (
    <div className="flex min-h-dvh flex-col" aria-busy="true" aria-label="Laden">
      <div className="h-[calc(3.5rem+env(safe-area-inset-top))] bg-header" />
    </div>
  );
}
