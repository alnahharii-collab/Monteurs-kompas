import { useId, useState } from 'react';
import { useApp } from '../AppContext';
import { Context, Page, Radio, SourceLine, Status } from '../components/ui';
import { SOURCES, SOURCE_KIND_LABEL, type Check, type MeasurementCheck, type ObservationCheck } from '../data/demo';
import { evaluate, type Answer, type ObservationValue } from '../logic/diagnosis';
import { formatRange, parseMeasurement } from '../logic/measure';
import { reducer, type Pending } from '../logic/session';
import { StopCard } from './StopCard';

export function DiagnosisView() {
  const { session, dispatch } = useApp();
  const state = evaluate(session.faultCode, session.answers);
  const locked = !!session.safetyStop;

  const onBack = () => {
    if (!locked && session.answers.length > 0) dispatch({ type: 'undoAnswer' });
    else dispatch({ type: 'back' });
  };

  const submit = (answer: Answer) => {
    const after = reducer(session, { type: 'answer', answer });
    dispatch({ type: 'answer', answer });
    if (evaluate(after.faultCode, after.answers).status === 'end') {
      dispatch({ type: 'navigate', view: { name: 'outcome' } });
    }
  };

  if (state.status === 'unavailable') {
    return (
      <Page title="Diagnose">
        <Status tone="warn" title="Geen storing gekozen">
          <p>Kies eerst een storing.</p>
        </Status>
      </Page>
    );
  }

  if (state.status === 'end') {
    return (
      <Page title="Diagnose" onBack={onBack}>
        <Context />
        {locked ? <StopCard /> : <Status tone="info" title="Alle controles voor deze storing zijn gedaan." />}
        <button type="button" className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'navigate', view: { name: 'outcome' } })}>
          Bekijk uitkomst
        </button>
      </Page>
    );
  }

  const { check, index } = state;
  const pending = session.pending?.checkId === check.id ? session.pending : undefined;

  return (
    <Page title={`Controle ${index + 1}`} onBack={onBack}>
      <Context />
      <section className="card stack-sm" aria-labelledby="controle-titel" key={check.id}>
        <h2 id="controle-titel">{check.title}</h2>
        <p>{check.instruction}</p>
        {check.safety && (
          <Status tone="danger" title="Veiligheid">
            <p>{check.safety}</p>
          </Status>
        )}
        {check.kind === 'observation' ? (
          <ObservationInput check={check} pending={pending} onSubmit={submit} />
        ) : (
          <MeasurementInput check={check} pending={pending} onSubmit={submit} />
        )}
        <CheckSource check={check} />
      </section>
    </Page>
  );
}

function CheckSource({ check }: { check: Check }) {
  return (
    <div>
      <SourceLine sourceId={check.sourceId} anchor={check.id} />
      <p className="meta">
        Soort: {SOURCE_KIND_LABEL[check.sourceKind]}
        {check.sourceId && SOURCES[check.sourceId]?.fictional ? ' (fictief)' : ''}
      </p>
      {check.why && (
        <details className="why">
          <summary>Waarom deze controle?</summary>
          <p>{check.why}</p>
        </details>
      )}
    </div>
  );
}

const OBS: { value: ObservationValue; label: string }[] = [
  { value: 'ja', label: 'Ja' },
  { value: 'nee', label: 'Nee' },
  { value: 'weet-niet', label: 'Weet ik niet' },
];

function ObservationInput({
  check,
  pending,
  onSubmit,
}: {
  check: ObservationCheck;
  pending?: Pending;
  onSubmit: (a: Answer) => void;
}) {
  const { dispatch } = useApp();
  const value = pending?.observation;
  const setValue = (observation: ObservationValue) =>
    dispatch({ type: 'setPending', pending: { checkId: check.id, observation } });
  const qid = useId();
  return (
    <>
      <p className="field-label" id={qid}>
        {check.question}
      </p>
      <div className="options" role="radiogroup" aria-labelledby={qid}>
        {OBS.map((o) => (
          <Radio key={o.value} label={o.label} checked={value === o.value} onSelect={() => setValue(o.value)} />
        ))}
      </div>
      <button
        type="button"
        className="btn btn-primary btn-block"
        disabled={!value}
        onClick={() => value && onSubmit({ checkId: check.id, kind: 'observation', value })}
      >
        Ga verder
      </button>
    </>
  );
}

function MeasurementInput({
  check,
  pending,
  onSubmit,
}: {
  check: MeasurementCheck;
  pending?: Pending;
  onSubmit: (a: Answer) => void;
}) {
  const { dispatch } = useApp();
  const raw = pending?.raw ?? '';
  const setRaw = (text: string) => dispatch({ type: 'setPending', pending: { checkId: check.id, raw: text } });
  const [error, setError] = useState<string>();
  const id = useId();
  const range = formatRange(check.min, check.max, check.unit);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = parseMeasurement(raw);
    if (r.status === 'empty') return setError('Vul een meetwaarde in. Een leeg veld telt niet als 0.');
    if (r.status === 'invalid') return setError(r.message);
    setError(undefined);
    onSubmit({ checkId: check.id, kind: 'measurement', value: r.value });
  };

  return (
    <form className="field stack-sm" onSubmit={submit} noValidate>
      <div>
        <label htmlFor={id}>Vul je meting in: {check.label.toLowerCase()}</label>
        <div className="input-row">
          <input
            id={id}
            className="input"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            enterKeyHint="done"
            placeholder="bijv. 12,5"
            value={raw}
            aria-invalid={!!error}
            aria-describedby={`${id}-hint${error ? ` ${id}-err` : ''}`}
            onChange={(e) => {
              setRaw(e.target.value);
              setError(undefined);
            }}
          />
          <span className="unit" aria-label={`eenheid ${check.unit}`}>
            {check.unit}
          </span>
        </div>
        {error && (
          <p className="field-error" id={`${id}-err`} role="alert">
            {error}
          </p>
        )}
        <p className="field-hint" id={`${id}-hint`}>
          {range ? `Oefengrens (fictief): ${range}` : 'Grenswaarde niet vastgelegd'}
        </p>
      </div>
      <button type="submit" className="btn btn-primary btn-block">
        Ga verder
      </button>
    </form>
  );
}
