import { useApp } from '../AppContext';
import { Context, Page, Status } from '../components/ui';
import { FAULTS, OUTCOME_LABEL, SOURCES, SOURCE_KIND_LABEL, type Outcome } from '../data/demo';
import { evaluate } from '../logic/diagnosis';
import { formatNumber } from '../logic/measure';
import { NewCaseButton } from './NewCase';
import { StopCard } from './StopCard';

const TONE: Record<Outcome, 'ok' | 'warn' | 'stop'> = {
  bevestigd: 'ok',
  mogelijk: 'warn',
  'meer-onderzoek': 'warn',
  onvoldoende: 'warn',
  veiligheidsstop: 'stop',
};

export function OutcomeView() {
  const { session, dispatch } = useApp();
  const state = evaluate(session.faultCode, session.answers);
  const locked = !!session.safetyStop;

  // Terug = laatste antwoord wijzigen. Bij een veiligheidsstop kan dat niet.
  const onBack = () => {
    if (!locked) dispatch({ type: 'undoAnswer' });
    dispatch({ type: 'back' });
  };

  if (state.status !== 'end') {
    return (
      <Page title="Uitkomst">
        <Status tone="warn" title="Nog geen uitkomst">
          <p>De diagnose is nog niet afgerond.</p>
        </Status>
      </Page>
    );
  }

  const { terminal, lastCheck } = state;
  const isStop = terminal.outcome === 'veiligheidsstop';
  const fault = session.faultCode ? FAULTS[session.faultCode] : undefined;
  const src = lastCheck.sourceId ? SOURCES[lastCheck.sourceId] : undefined;
  const measurements = session.answers.flatMap((a) => {
    const c = fault?.checks[a.checkId];
    return a.kind === 'measurement' && c?.kind === 'measurement'
      ? [`${c.label}: ${formatNumber(a.value)} ${c.unit}`]
      : [];
  });

  return (
    <Page title="Uitkomst" onBack={onBack}>
      <Context />
      {isStop ? <StopCard /> : <Status tone={TONE[terminal.outcome]} title={OUTCOME_LABEL[terminal.outcome]} />}

      {!isStop && (
        <section className="card">
          <h2>Wat weten we?</h2>
          <p>{terminal.summary}</p>
          {measurements.length > 0 && (
            <ul>
              {measurements.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}
          {src && (
            <p className="meta">
              Laatste controle gebaseerd op: {SOURCE_KIND_LABEL[src.kind].toLowerCase()}
              {src.fictional ? ' (fictieve oefenbron)' : ''}
              {src.contentReviewed ? '.' : ', niet inhoudelijk gecontroleerd.'}
            </p>
          )}
        </section>
      )}

      {!isStop && terminal.nextStep && (
        <section className="card">
          <h2>Volgende stap</h2>
          <p>{terminal.nextStep}</p>
        </section>
      )}

      <button type="button" className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'navigate', view: { name: 'report' } })}>
        Maak servicerapport
      </button>
      {!locked && (
        <button type="button" className="btn btn-secondary btn-block" onClick={onBack}>
          Wijzig laatste antwoord
        </button>
      )}
      {locked && <NewCaseButton />}
    </Page>
  );
}
