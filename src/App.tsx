import { useEffect, useReducer, useRef } from 'react';
import { AppContext } from './AppContext';
import { currentView, initialSession, reducer, type Session, type ViewName } from './logic/session';
import { StartView } from './views/Start';
import { DeviceView } from './views/Device';
import { FaultView } from './views/Fault';
import { DiagnosisView } from './views/Diagnosis';
import { OutcomeView } from './views/Outcome';
import { SourceView } from './views/Source';
import { ReportView } from './views/Report';
import { LookupView } from './views/Lookup';
import { MoreView } from './views/More';
import { DocsView } from './views/Docs';

const VIEWS: Record<ViewName, () => JSX.Element> = {
  start: StartView,
  device: DeviceView,
  fault: FaultView,
  diagnosis: DiagnosisView,
  outcome: OutcomeView,
  source: SourceView,
  report: ReportView,
  lookup: LookupView,
  more: MoreView,
  docs: DocsView,
};

export function App({ initial = initialSession }: { initial?: Session }) {
  const [session, dispatch] = useReducer(reducer, initial);
  const view = currentView(session);
  const View = VIEWS[view.name];
  const mainRef = useRef<HTMLElement>(null);

  // Bij elk nieuw scherm bovenaan beginnen en focus naar de inhoud.
  useEffect(() => {
    window.scrollTo?.(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [session.stack.length, view.name]);

  return (
    <AppContext.Provider value={{ session, dispatch }}>
      <div className="shell">
        <header className="header">
          <div className="container header-inner">
            <button type="button" className="brand" onClick={() => dispatch({ type: 'home' })} aria-label="Monteur Kompas, naar start">
              <img src="./logo.svg" alt="" />
              <span>
                <span className="brand-name">Monteur Kompas</span>
                <span className="brand-tag">Oefendemo · niet voor praktijkgebruik</span>
              </span>
            </button>
          </div>
        </header>
        {session.safetyStop && (
          <div className="stopbar" role="status">
            <div className="container">
              <span aria-hidden="true">■</span> VEILIGHEIDSSTOP ACTIEF
            </div>
          </div>
        )}
        <main className="main" ref={mainRef} tabIndex={-1} data-view={view.name}>
          <div className="container">
            <View />
          </div>
        </main>
      </div>
    </AppContext.Provider>
  );
}
