import { parseMeasurement } from '../src/logic/measure';
import { evaluate } from '../src/logic/diagnosis';
import { initialSession, reducer, type Action, type Session } from '../src/logic/session';
import { buildReport } from '../src/logic/report';

const run = (actions: Action[], from: Session = initialSession) => actions.reduce(reducer, from);

const confirmedCase: Action[] = [
  { type: 'selectDevice', deviceId: 'cv24' },
  { type: 'selectVariant', variantId: 'A' },
  { type: 'confirmVariant', confirmed: true },
];

describe('parseMeasurement', () => {
  it('leeg veld is geen nul', () => {
    expect(parseMeasurement('')).toEqual({ status: 'empty' });
    expect(parseMeasurement('   ')).toEqual({ status: 'empty' });
  });
  it('accepteert Nederlandse komma en punt', () => {
    expect(parseMeasurement('12,5')).toEqual({ status: 'ok', value: 12.5 });
    expect(parseMeasurement('0,8')).toEqual({ status: 'ok', value: 0.8 });
    expect(parseMeasurement('3.25')).toEqual({ status: 'ok', value: 3.25 });
    expect(parseMeasurement('0')).toEqual({ status: 'ok', value: 0 });
  });
  it('weigert ongeldige invoer', () => {
    for (const bad of ['abc', '1,2,3', '12,', ',5', '1.000,5', '12V', '-3']) {
      expect(parseMeasurement(bad).status).toBe('invalid');
    }
  });
});

describe('diagnose', () => {
  it('vertakt op waarneming en meting', () => {
    const s = run([
      ...confirmedCase,
      { type: 'selectFault', faultCode: '5' },
      { type: 'answer', answer: { checkId: 'f5-kabel', kind: 'observation', value: 'nee' } },
      { type: 'answer', answer: { checkId: 'f5-weerstand', kind: 'measurement', value: 4.2 } },
    ]);
    const st = evaluate(s.faultCode, s.answers);
    expect(st.status).toBe('end');
    if (st.status === 'end') expect(st.terminal.outcome).toBe('bevestigd');
  });

  it('meting binnen grens concludeert niet te sterk', () => {
    const s = run([
      ...confirmedCase,
      { type: 'selectFault', faultCode: '5' },
      { type: 'answer', answer: { checkId: 'f5-kabel', kind: 'observation', value: 'nee' } },
      { type: 'answer', answer: { checkId: 'f5-weerstand', kind: 'measurement', value: 0.5 } },
    ]);
    const st = evaluate(s.faultCode, s.answers);
    if (st.status !== 'end') throw new Error('verwacht einde');
    expect(st.terminal.outcome).toBe('meer-onderzoek');
  });

  it('wijzigen van een eerder antwoord wist afhankelijke antwoorden', () => {
    let s = run([
      ...confirmedCase,
      { type: 'selectFault', faultCode: '4' },
      { type: 'answer', answer: { checkId: 'f4-gas', kind: 'observation', value: 'nee' } },
      { type: 'answer', answer: { checkId: 'f4-lampje', kind: 'observation', value: 'ja' } },
      { type: 'answer', answer: { checkId: 'f4-spanning', kind: 'measurement', value: 25 } },
    ]);
    expect(s.answers).toHaveLength(3);
    s = reducer(s, { type: 'answer', answer: { checkId: 'f4-lampje', kind: 'observation', value: 'nee' } });
    expect(s.answers.map((a) => a.checkId)).toEqual(['f4-gas', 'f4-lampje']);
  });
});

describe('sessie-invalidatie', () => {
  const withAnswers = () =>
    run([
      ...confirmedCase,
      { type: 'selectFault', faultCode: '4' },
      { type: 'answer', answer: { checkId: 'f4-gas', kind: 'observation', value: 'nee' } },
    ]);

  it('ander toestel wist uitvoering, storing en controles', () => {
    const s = reducer(withAnswers(), { type: 'selectDevice', deviceId: 'cv30' });
    expect(s).toMatchObject({ variantId: undefined, variantConfirmed: false, faultCode: undefined, answers: [] });
    expect(s.notice).toMatch(/gewist/);
  });
  it('andere uitvoering wist bevestiging en storing', () => {
    const s = reducer(withAnswers(), { type: 'selectVariant', variantId: 'B' });
    expect(s).toMatchObject({ variantConfirmed: false, faultCode: undefined, answers: [] });
  });
  it('andere storing wist controles', () => {
    const s = reducer(withAnswers(), { type: 'selectFault', faultCode: '5' });
    expect(s.answers).toEqual([]);
  });
  it('dezelfde storing opnieuw kiezen behoudt voortgang', () => {
    const s = reducer(withAnswers(), { type: 'selectFault', faultCode: '4' });
    expect(s.answers).toHaveLength(1);
  });
  it('bron openen en terug wist de sessie niet', () => {
    const before = withAnswers();
    const s = run(
      [
        { type: 'navigate', view: { name: 'source', sourceId: 'oef-0001' } },
        { type: 'sourceOpened', sourceId: 'oef-0001' },
        { type: 'back' },
      ],
      before,
    );
    expect(s.answers).toEqual(before.answers);
    expect(s.faultCode).toBe('4');
  });
});

describe('veiligheidsstop', () => {
  const stopped = () =>
    run([
      ...confirmedCase,
      { type: 'selectFault', faultCode: '4' },
      { type: 'navigate', view: { name: 'diagnosis' } },
      { type: 'answer', answer: { checkId: 'f4-gas', kind: 'observation', value: 'ja' } },
    ]);

  it('wordt actief bij gaslucht', () => {
    expect(stopped().safetyStop?.summary).toMatch(/Gaslucht/);
  });

  it('blijft actief bij terug, bron, rapport, opzoeken en wijzigen', () => {
    const s = run(
      [
        { type: 'undoAnswer' },
        { type: 'back' },
        { type: 'navigate', view: { name: 'source', sourceId: 'oef-0001' } },
        { type: 'back' },
        { type: 'navigate', view: { name: 'report' } },
        { type: 'navigate', view: { name: 'lookup' } },
        { type: 'lookupDevice', deviceId: 'cv24' },
        { type: 'home' },
        { type: 'answer', answer: { checkId: 'f4-gas', kind: 'observation', value: 'nee' } },
        { type: 'selectFault', faultCode: '5' },
        { type: 'selectVariant', variantId: 'B' },
        { type: 'selectDevice', deviceId: 'cv30' },
        { type: 'confirmVariant', confirmed: false },
      ],
      stopped(),
    );
    expect(s.safetyStop).toBeDefined();
    expect(s.answers).toEqual([{ checkId: 'f4-gas', kind: 'observation', value: 'ja' }]);
    expect(s.deviceId).toBe('cv24');
    expect(s.faultCode).toBe('4');
  });

  it('alleen een expliciete nieuwe case heft hem op', () => {
    const s = reducer(stopped(), { type: 'newCase' });
    expect(s.safetyStop).toBeUndefined();
    expect(s.deviceId).toBeUndefined();
  });
});

describe('rapport', () => {
  it('toont alleen geregistreerde gegevens', () => {
    const s = run([
      ...confirmedCase,
      { type: 'selectFault', faultCode: '5' },
      { type: 'answer', answer: { checkId: 'f5-kabel', kind: 'observation', value: 'nee' } },
      { type: 'answer', answer: { checkId: 'f5-weerstand', kind: 'measurement', value: 4.2 } },
    ]);
    const r = buildReport(s);
    const get = (t: string) => r.sections.find((x) => x.title === t)!.lines;
    expect(r.fictional).toBe(true);
    expect(get('Meetwaarden')).toEqual(['Gemeten weerstand: 4,2 Ω']);
    // Voorgestelde vervanging is niet automatisch uitgevoerd.
    expect(get('Uitgevoerde handelingen')).toEqual(['Geen handelingen geregistreerd']);
    expect(get('Uitkomst')).toEqual(['Oorzaak bevestigd']);
    expect(get('Openstaande punten').join(' ')).toMatch(/Vervang kabel K1/);
  });

  it('ontbrekende meting blijft ontbrekend', () => {
    const s = run([...confirmedCase, { type: 'selectFault', faultCode: '4' }]);
    const r = buildReport(s);
    expect(r.sections.find((x) => x.title === 'Meetwaarden')!.lines).toEqual(['Geen meetwaarden ingevoerd']);
    expect(r.sections.find((x) => x.title === 'Uitkomst')!.lines).toEqual(['Diagnose niet afgerond']);
  });
});
