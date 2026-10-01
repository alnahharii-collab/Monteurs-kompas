import { useApp } from '../AppContext';
import { Status } from '../components/ui';

export function StopCard() {
  const { session } = useApp();
  const stop = session.safetyStop;
  if (!stop) return null;
  return (
    <Status tone="stop" title="VEILIGHEIDSSTOP">
      <p>
        <strong>{stop.summary}</strong>
      </p>
      {stop.nextStep && <p>{stop.nextStep}</p>}
      <p>
        {stop.deviceLabel} · {stop.faultLabel} · {stop.checkTitle}
      </p>
      <p>De diagnose is gestopt. Je kunt deze case niet verder aanpassen.</p>
    </Status>
  );
}
