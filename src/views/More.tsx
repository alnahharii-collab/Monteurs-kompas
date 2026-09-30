import { useApp } from '../AppContext';
import { Choice, Page } from '../components/ui';
import { hasActiveCase } from '../logic/session';
import { NewCaseButton } from './NewCase';

export function MoreView() {
  const { session, dispatch } = useApp();
  return (
    <Page title="Meer">
      <Choice title="Documentenbeheer" sub="Bronnen van deze demo" onClick={() => dispatch({ type: 'navigate', view: { name: 'docs' } })} />
      {hasActiveCase(session) && <NewCaseButton />}
      <section className="card">
        <h2>Over deze demo</h2>
        <p>Alle toestellen, storingen, grenswaarden en bronnen zijn fictieve oefendata. Niet gebruiken in de praktijk.</p>
        <p>
          Je gegevens staan alleen in dit tabblad. Teruggaan en een bron openen houden je case vast. Verversen of sluiten
          wist alles. Er is geen offline of permanente opslag.
        </p>
      </section>
    </Page>
  );
}
