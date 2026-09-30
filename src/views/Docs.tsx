import { useApp } from '../AppContext';
import { Page, Status } from '../components/ui';
import { SOURCES, SOURCE_KIND_LABEL } from '../data/demo';

export function DocsView() {
  const { dispatch } = useApp();
  const docs = Object.values(SOURCES);
  return (
    <Page title="Documentenbeheer">
      {docs.map((d) => (
        <section className="card" key={d.id}>
          <h2>{d.title ?? d.docNumber ?? 'Titel niet vastgelegd'}</h2>
          <p className="meta">
            {[SOURCE_KIND_LABEL[d.kind], d.manufacturer, d.docNumber, d.version].filter(Boolean).join(' · ')}
          </p>
          <p style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {d.fictional && <span className="badge badge-warn">Fictief</span>}
            <span className="badge">{d.contentReviewed ? 'Inhoud gecontroleerd' : 'Inhoud niet gecontroleerd'}</span>
            {!d.available && <span className="badge badge-warn">Kan niet worden geopend</span>}
          </p>
          {d.available && (
            <button
              type="button"
              className="link"
              onClick={() => dispatch({ type: 'navigate', view: { name: 'source', sourceId: d.id, anchor: 'handleiding' } })}
            >
              Bekijk bron
            </button>
          )}
        </section>
      ))}
      <div>
        <button type="button" className="btn btn-secondary btn-block" disabled aria-describedby="upload-na">
          Document toevoegen
        </button>
        <p className="field-hint" id="upload-na">
          Nog niet beschikbaar in deze demo.
        </p>
      </div>
      <Status tone="info" title="Gekoppeld is niet gecontroleerd">
        <p>Een gekoppeld document is pas een betrouwbare bron als de inhoud door een vakman is gecontroleerd.</p>
      </Status>
    </Page>
  );
}
