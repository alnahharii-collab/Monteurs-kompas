'use client';

import { TriangleAlert } from 'lucide-react';
import { AppHeader } from '@/components/ui/AppHeader';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <Screen header={<AppHeader back={{ href: '/', label: 'Naar start' }} title="Monteur Kompas" />}>
      <EmptyState
        icon={<TriangleAlert size={24} />}
        title="Er ging iets mis"
        tone="warn"
        action={
          <div className="flex flex-col gap-3">
            <Button onClick={reset}>Opnieuw proberen</Button>
            <ButtonLink href="/" variant="secondary">
              Naar start
            </ButtonLink>
          </div>
        }
      >
        Dit scherm kon niet worden geladen. Een lopende diagnose blijft op dit apparaat bewaard.
      </EmptyState>
    </Screen>
  );
}
