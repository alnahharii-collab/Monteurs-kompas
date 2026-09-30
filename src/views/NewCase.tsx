import { useState } from 'react';
import { useApp } from '../AppContext';

/** Expliciete, bevestigde reset. De enige manier om een veiligheidsstop op te heffen. */
export function NewCaseButton({ label = 'Nieuwe case starten' }: { label?: string }) {
  const { session, dispatch } = useApp();
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <button type="button" className="btn btn-secondary btn-block" onClick={() => setConfirming(true)}>
        {label}
      </button>
    );
  }
  return (
    <div className="card stack-sm" role="group" aria-label="Bevestig nieuwe case">
      <p>
        <strong>Nieuwe case starten?</strong> Alle gegevens van deze case worden gewist
        {session.safetyStop ? ', ook de veiligheidsstop. Doe dit alleen als de onveilige situatie is afgehandeld' : ''}.
      </p>
      <button type="button" className="btn btn-danger btn-block" onClick={() => dispatch({ type: 'newCase' })}>
        Ja, wis en begin opnieuw
      </button>
      <button type="button" className="btn btn-secondary btn-block" onClick={() => setConfirming(false)}>
        Annuleren
      </button>
    </div>
  );
}
