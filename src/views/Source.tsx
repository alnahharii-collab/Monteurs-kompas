import { useEffect } from 'react';
import { useApp } from '../AppContext';
import { Page, Status } from '../components/ui';
import { SOURCES, SOURCE_KIND_LABEL } from '../data/demo';
import { currentView } from '../logic/session';

export function SourceView() {
  const { session, dispatch } = useApp();
  const view = currentView(session);
  const src = view.sourceId ? SOURCES[view.sourceId] : undefined;
  const opened = !!src?.available;

  useEffect(() => {
    // Alleen als de bron werkelijk opent, registreren we hem als geopend.
    if (src && opened) dispatch({ type: 'sourceOpened', sourceId: src.id });
  }, [src, opened, dispatch]);

  if (!src || !src.available) {
    return (
      <Page title="Bron">
        <Status tone="danger" title="Bron kan niet worden geopend">
          <p>Dit document is niet beschikbaar in deze demo. Gebruik de informatie niet zonder bron.</p>
        </Status>
        <button type="button" className="btn btn-secondary btn-block" onClick={() => dispatch({ type: 'back' })}>
          Ga terug
        </button>
      </Page>
    );
  }

  const fields: [string, string | undefined][] = [
    ['Soort', SOURCE_KIND_LABEL[src.kind]],
    ['Fabrikant', src.manufacturer],
    ['Toestel', src.device],
    ['Documenttitel', src.title],
    ['Documentnummer', src.docNumber],
    ['Versie / datum', src.version],
    ['Pagina', src.page],
  ];
  const passage = (view.anchor && src.passages[view.anchor]) ?? src.passages.handleiding;

  return (
    <Page title="Bron">
      {src.fictional && (
        <Status tone="warn" title="Fictieve oefenbron">
          <p>Dit is geen echt fabrikantdocument. Niet gebruiken in de praktijk.</p>
        </Status>
      )}
      <section className="card">
        <dl className="dl">
          {fields
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          <div>
            <dt>Inhoud gecontroleerd</dt>
            <dd>{src.contentReviewed ? 'Ja' : 'Nee — gekoppeld, niet inhoudelijk gecontroleerd'}</dd>
          </div>
        </dl>
      </section>
      {passage && (
        <section className="card">
          <p className="section-label">Relevante passage</p>
          <blockquote className="quote">{passage}</blockquote>
        </section>
      )}
      <button type="button" className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'back' })}>
        Klaar met lezen
      </button>
    </Page>
  );
}
