import { useApp } from '../AppContext';
import { Choice } from '../components/ui';
import { deviceName, getDevice } from '../data/demo';
import { hasActiveCase, type Session, type View } from '../logic/session';

export function resumeView(s: Session): View {
  if (s.faultCode) return { name: 'diagnosis' };
  if (s.variantConfirmed) return { name: 'fault' };
  return { name: 'device' };
}

export function StartView() {
  const { session, dispatch } = useApp();
  const device = getDevice(session.deviceId);
  const go = (view: View) => dispatch({ type: 'navigate', view });

  return (
    <>
      <h1 className="page-title">Waar wil je hulp bij?</h1>
      <div className="stack">
        {hasActiveCase(session) && device && (
          <Choice
            title="Verder met je laatste storing"
            sub={`${deviceName(device)}${session.faultCode ? ` · Storing ${session.faultCode}` : ''}${
              session.safetyStop ? ' · Veiligheidsstop' : ''
            }`}
            onClick={() => go(resumeView(session))}
          />
        )}
        <Choice
          primary
          title="Storing oplossen"
          sub="Onderzoek een storing stap voor stap"
          onClick={() => go({ name: 'device' })}
        />
        <Choice title="Snel opzoeken" sub="Zoek storingsinformatie of een handleiding" onClick={() => go({ name: 'lookup' })} />
      </div>
      <div className="foot-links">
        <button type="button" className="link" onClick={() => go({ name: 'more' })}>
          Meer
        </button>
      </div>
    </>
  );
}
