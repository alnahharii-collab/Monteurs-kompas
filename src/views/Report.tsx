import { useId, useState } from 'react';
import { useApp } from '../AppContext';
import { Page, Status } from '../components/ui';
import { buildReport, reportToText } from '../logic/report';
import { NewCaseButton } from './NewCase';

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Terugvaloptie voor browsers zonder Clipboard API.
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand?.('copy') ?? false;
    ta.remove();
    return ok;
  }
}

export function ReportView() {
  const { session, dispatch } = useApp();
  const report = buildReport(session);
  const [copied, setCopied] = useState<'ok' | 'fail'>();
  const id = useId();

  return (
    <Page title="Servicerapport">
      {report.fictional && (
        <Status tone="warn" title="Fictieve oefengegevens">
          <p>Dit rapport is gemaakt met oefendata. Niet gebruiken als echte werkbon.</p>
        </Status>
      )}
      <section className="card" aria-label="Servicerapport">
        {report.sections.map((sec) => (
          <div className="report-section" key={sec.title}>
            <h3>{sec.title}</h3>
            {sec.lines.length === 1 ? (
              <p>{sec.lines[0]}</p>
            ) : (
              <ul>
                {sec.lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      <div className="card field">
        <label htmlFor={id}>Uitgevoerde handelingen</label>
        <textarea
          id={id}
          className="input"
          value={session.actionsDone}
          placeholder="Bijvoorbeeld: kabel K1 vervangen"
          onChange={(e) => dispatch({ type: 'setActions', text: e.target.value })}
        />
        <p className="field-hint">Vul alleen in wat je echt hebt gedaan. Een voorgestelde stap telt niet als uitgevoerd.</p>
      </div>

      <button
        type="button"
        className="btn btn-primary btn-block"
        onClick={async () => setCopied((await copyText(reportToText(report))) ? 'ok' : 'fail')}
      >
        Kopieer rapport
      </button>
      {copied === 'ok' && <Status tone="ok" title="Rapport gekopieerd" />}
      {copied === 'fail' && (
        <Status tone="warn" title="Kopiëren lukte niet">
          <p>Selecteer de tekst van het rapport en kopieer handmatig.</p>
        </Status>
      )}
      <p className="meta">
        Dit rapport staat alleen in dit tabblad. Verversen of sluiten wist alle gegevens van deze case. Kopieer het rapport
        voordat je afsluit.
      </p>
      <NewCaseButton />
    </Page>
  );
}
