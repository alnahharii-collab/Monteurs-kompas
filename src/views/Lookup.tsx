import { useState } from 'react';
import { useApp } from '../AppContext';
import { Page, Radio, SourceLine, Status } from '../components/ui';
import { DEVICES, FAULTS, deviceName, getDevice } from '../data/demo';

type Topic = { kind: 'fault'; code: string } | { kind: 'manual' };

export function LookupView() {
  const { session, dispatch } = useApp();
  const [topic, setTopic] = useState<Topic>();
  const device = getDevice(session.lookupDeviceId);
  const variant = device?.variants.find((v) => v.id === session.lookupVariantId);
  const needsVariant = !!device && device.variants.length > 0;
  const covered = device?.variants.filter((v) => v.coveredBySource).map((v) => v.label) ?? [];

  return (
    <Page title="Snel opzoeken" lead="Wat wil je opzoeken?">
      {session.safetyStop && (
        <Status tone="stop" title="VEILIGHEIDSSTOP">
          <p>
            Er is een veiligheidsstop actief voor {session.safetyStop.deviceLabel}. Opzoeken heft die niet op en je kunt
            de diagnose niet vanuit hier voortzetten.
          </p>
        </Status>
      )}

      <section className="card">
        <h2 id="lk-toestel">Toestel</h2>
        <div className="options" role="radiogroup" aria-labelledby="lk-toestel">
          {DEVICES.map((d) => (
            <Radio
              key={d.id}
              label={`${deviceName(d)}${d.fictional ? ' (fictief)' : ''}`}
              checked={d.id === session.lookupDeviceId}
              onSelect={() => {
                setTopic(undefined);
                dispatch({ type: 'lookupDevice', deviceId: d.id });
              }}
            />
          ))}
        </div>
        {needsVariant && (
          <>
            <h3 id="lk-uitvoering" style={{ marginTop: 16 }}>
              Uitvoering
            </h3>
            <div className="options" role="radiogroup" aria-labelledby="lk-uitvoering">
              {device!.variants.map((v) => (
                <Radio
                  key={v.id}
                  label={v.label}
                  checked={v.id === session.lookupVariantId}
                  onSelect={() => dispatch({ type: 'lookupVariant', variantId: v.id })}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {device && (
        <div className="options" role="radiogroup" aria-label="Onderwerp">
          {device.faultCodes.map((code) => (
            <Radio
              key={code}
              label={FAULTS[code].label}
              checked={topic?.kind === 'fault' && topic.code === code}
              onSelect={() => setTopic({ kind: 'fault', code })}
            />
          ))}
          <Radio label="Handleiding" checked={topic?.kind === 'manual'} onSelect={() => setTopic({ kind: 'manual' })} />
        </div>
      )}

      {device && device.faultCodes.length === 0 && (
        <Status tone="warn" title="Geen storingsinformatie">
          <p>Voor dit toestel is in deze demo geen storingsinformatie beschikbaar.</p>
        </Status>
      )}

      {device && topic && (
        <section className="card" aria-live="polite">
          {topic.kind === 'fault' ? (
            <>
              <h2>{FAULTS[topic.code].label}</h2>
              <p>{FAULTS[topic.code].description ?? 'Geen omschrijving vastgelegd in de bron.'}</p>
            </>
          ) : (
            <h2>Handleiding</h2>
          )}
          {needsVariant && !variant && (
            <Status tone="warn" title="Uitvoering niet gekozen">
              <p>Deze informatie geldt alleen voor: {covered.join(', ')}. Controleer het typeplaatje.</p>
            </Status>
          )}
          {variant && !variant.coveredBySource && (
            <Status tone="warn" title="Geldt niet voor deze uitvoering">
              <p>
                De bron geldt alleen voor {covered.join(', ')}. Voor {variant.label} is geen informatie beschikbaar.
              </p>
            </Status>
          )}
          <SourceLine
            sourceId={device.sourceId}
            anchor={topic.kind === 'fault' ? FAULTS[topic.code].rootCheck : 'handleiding'}
          />
        </section>
      )}
    </Page>
  );
}
