import { useState } from 'react';
import { useApp } from '../AppContext';
import { Choice, Context, Page, Status } from '../components/ui';
import { FAULTS, getDevice } from '../data/demo';
import { StopCard } from './StopCard';

export function FaultView() {
  const { session, dispatch } = useApp();
  const [other, setOther] = useState(false);
  const device = getDevice(session.deviceId);
  const locked = !!session.safetyStop;

  if (!device || !session.variantConfirmed) {
    return (
      <Page title="Wat is het probleem?">
        <Status tone="warn" title="Eerst toestel controleren">
          <p>Kies en bevestig eerst het toestel en de uitvoering.</p>
        </Status>
        <button type="button" className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'navigate', view: { name: 'device' } })}>
          Naar toestel kiezen
        </button>
      </Page>
    );
  }

  const choose = (code: string) => {
    dispatch({ type: 'selectFault', faultCode: code });
    dispatch({ type: 'navigate', view: { name: 'diagnosis' } });
  };

  return (
    <Page title="Wat is het probleem?">
      <Context />
      {locked && (
        <>
          <StopCard />
          <button type="button" className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'navigate', view: { name: 'outcome' } })}>
            Bekijk uitkomst
          </button>
        </>
      )}
      {!locked && (
        <>
          {session.notice && <Status tone="warn" title={session.notice} />}
          <div className="stack-sm">
            {device.faultCodes.map((code) => {
              const f = FAULTS[code];
              return <Choice key={code} title={f.label} sub={f.description} onClick={() => choose(code)} />;
            })}
            <Choice title="Andere storing" onClick={() => setOther(true)} />
          </div>
          {other && (
            <Status tone="warn" title="Niet ondersteund">
              <p>Deze storing wordt in deze demo nog niet ondersteund.</p>
            </Status>
          )}
        </>
      )}
    </Page>
  );
}
