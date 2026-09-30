import { useApp } from '../AppContext';
import { Page, Radio, SourceLine, Status } from '../components/ui';
import { DEVICES, SOURCES, deviceName, getDevice } from '../data/demo';
import { StopCard } from './StopCard';

export const UNKNOWN_VARIANT = 'onbekend';

export function DeviceView() {
  const { session, dispatch } = useApp();
  const locked = !!session.safetyStop;
  const device = getDevice(session.deviceId);
  const variant = device?.variants.find((v) => v.id === session.variantId);
  const src = device?.sourceId ? SOURCES[device.sourceId] : undefined;

  const canContinue = !!variant?.coveredBySource && session.variantConfirmed && !locked;

  let blocker: string | undefined;
  if (!device) blocker = 'Kies eerst een toestel.';
  else if (device.variants.length === 0 || device.faultCodes.length === 0) blocker = undefined;
  else if (!session.variantId) blocker = 'Kies de uitvoering van het typeplaatje.';
  else if (variant?.coveredBySource && !session.variantConfirmed) blocker = 'Bevestig dat de uitvoering overeenkomt met de bron.';

  return (
    <Page title="Toestel kiezen" lead="Welk toestel staat voor je?">
      {locked && <StopCard />}
      {session.notice && <Status tone="warn" title={session.notice} />}

      <div className="options" role="radiogroup" aria-label="Toestel">
        {DEVICES.map((d) => (
          <Radio
            key={d.id}
            label={`${deviceName(d)}${d.fictional ? ' (fictief)' : ''}`}
            checked={d.id === session.deviceId}
            disabled={locked}
            onSelect={() => dispatch({ type: 'selectDevice', deviceId: d.id })}
          />
        ))}
      </div>

      {device && device.faultCodes.length === 0 && (
        <Status tone="warn" title="Niet beschikbaar in deze demo">
          <p>Voor dit toestel zijn in deze demo geen storingen beschikbaar.</p>
        </Status>
      )}

      {device && device.variants.length > 0 && device.faultCodes.length > 0 && (
        <section className="card" aria-labelledby="uitvoering">
          <h2 id="uitvoering">Controleer uitvoering</h2>
          <p className="meta">Welke uitvoering staat op het typeplaatje?</p>
          <div className="options" role="radiogroup" aria-labelledby="uitvoering">
            {device.variants.map((v) => (
              <Radio
                key={v.id}
                label={v.label}
                checked={v.id === session.variantId}
                disabled={locked}
                onSelect={() => dispatch({ type: 'selectVariant', variantId: v.id })}
              />
            ))}
            <Radio
              label="Weet ik niet"
              checked={session.variantId === UNKNOWN_VARIANT}
              disabled={locked}
              onSelect={() => dispatch({ type: 'selectVariant', variantId: UNKNOWN_VARIANT })}
            />
          </div>

          {session.variantId === UNKNOWN_VARIANT && (
            <div style={{ marginTop: 12 }}>
              <Status tone="warn" title="Controleer eerst het typeplaatje">
                <p>Zonder uitvoering kun je niet verder: de controles gelden maar voor één uitvoering.</p>
              </Status>
            </div>
          )}
          {variant && !variant.coveredBySource && (
            <div style={{ marginTop: 12 }}>
              <Status tone="warn" title="Bron geldt niet voor deze uitvoering">
                <p>{variant.label} valt buiten de gekoppelde bron. Diagnose is in deze demo niet beschikbaar.</p>
              </Status>
            </div>
          )}

          {src && <SourceLine sourceId={src.id} anchor="handleiding" />}

          {variant?.coveredBySource && (
            <label className="checkline">
              <input
                type="checkbox"
                checked={session.variantConfirmed}
                disabled={locked}
                onChange={(e) => dispatch({ type: 'confirmVariant', confirmed: e.target.checked })}
              />
              <span>
                {variant.label} op het typeplaatje komt overeen met de bron
                {src?.device ? ` (${src.device})` : ''}.
              </span>
            </label>
          )}
        </section>
      )}

      <div>
        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={!canContinue}
          onClick={() => dispatch({ type: 'navigate', view: { name: 'fault' } })}
        >
          Ga verder
        </button>
        {!canContinue && blocker && !locked && <p className="field-hint">{blocker}</p>}
      </div>
    </Page>
  );
}
