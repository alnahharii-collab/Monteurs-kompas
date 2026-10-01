import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { App } from '../src/App';

afterEach(cleanup);

const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));
const pick = (name: string | RegExp) => fireEvent.click(screen.getByRole('radio', { name }));

function toDiagnosis(fault: string) {
  render(<App />);
  click(/Storing oplossen/);
  pick(/Oefenmerk CV-24/);
  pick('Uitvoering A');
  fireEvent.click(screen.getByRole('checkbox'));
  click('Ga verder');
  click(new RegExp(fault));
}

describe('UI-flow', () => {
  it('Start toont alleen de hoofdkeuzes', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Waar wil je hulp bij?' })).toBeInTheDocument();
    expect(screen.queryByText(/Verder met je laatste storing/)).toBeNull();
    expect(screen.getByRole('button', { name: /Snel opzoeken/ })).toBeInTheDocument();
  });

  it('Ga verder op toestel is geblokkeerd tot de uitvoering bevestigd is', () => {
    render(<App />);
    click(/Storing oplossen/);
    expect(screen.getByRole('button', { name: 'Ga verder' })).toBeDisabled();
    pick(/Oefenmerk CV-24/);
    pick('Uitvoering B');
    expect(screen.getByText(/valt buiten de gekoppelde bron/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ga verder' })).toBeDisabled();
    pick('Uitvoering A');
    expect(screen.getByRole('button', { name: 'Ga verder' })).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('button', { name: 'Ga verder' })).toBeEnabled();
  });

  it('leeg meetveld en ongeldige invoer worden niet verwerkt', () => {
    toDiagnosis('Storing 5');
    pick('Nee');
    click('Ga verder');
    expect(screen.getByRole('heading', { name: 'Controle 2' })).toBeInTheDocument();
    click('Ga verder');
    expect(screen.getByRole('alert')).toHaveTextContent('Een leeg veld telt niet als 0');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '12,,5' } });
    click('Ga verder');
    expect(screen.getByRole('alert')).toHaveTextContent(/cijfers en één komma/);
    expect(screen.getByRole('heading', { name: 'Controle 2' })).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '4,2' } });
    click('Ga verder');
    expect(screen.getByRole('heading', { name: 'Uitkomst' })).toBeInTheDocument();
    expect(screen.getByText('Oorzaak bevestigd')).toBeInTheDocument();
  });

  it('terug vanaf uitkomst herstelt de ingevoerde meting', () => {
    toDiagnosis('Storing 5');
    pick('Nee');
    click('Ga verder');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '0,4' } });
    click('Ga verder');
    click(/Terug/);
    expect(screen.getByRole('textbox')).toHaveValue('0,4');
  });

  it('ingevulde meting blijft staan na bron openen', () => {
    toDiagnosis('Storing 5');
    pick('Nee');
    click('Ga verder');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '4,2' } });
    click('Bekijk bron');
    click('Klaar met lezen');
    expect(screen.getByRole('textbox')).toHaveValue('4,2');
  });

  it('veiligheidsstop blijft zichtbaar en blokkeert', () => {
    toDiagnosis('Storing 4');
    pick('Ja');
    click('Ga verder');
    expect(screen.getAllByText('VEILIGHEIDSSTOP').length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: 'Wijzig laatste antwoord' })).toBeNull();
    // Naar Start en Snel opzoeken: stop blijft actief.
    click(/naar start/);
    expect(screen.getByText('VEILIGHEIDSSTOP ACTIEF')).toBeInTheDocument();
    click(/Snel opzoeken/);
    expect(screen.getByText(/Opzoeken heft die niet op/)).toBeInTheDocument();
    click(/naar start/);
    click(/Storing oplossen/);
    expect(screen.getByRole('radio', { name: /Oefenmerk CV-30/ })).toBeDisabled();
  });

  it('bron zonder beschikbaar document toont een foutmelding', () => {
    render(<App />);
    click(/Snel opzoeken/);
    pick(/Oefenmerk CV-30/);
    pick('Handleiding');
    click('Bekijk bron');
    expect(screen.getByText('Bron kan niet worden geopend')).toBeInTheDocument();
  });

  it('bron toont geen placeholders of niet-vastgelegde velden', () => {
    toDiagnosis('Storing 5');
    click('Bekijk bron');
    expect(screen.getByText('OEF-0001')).toBeInTheDocument();
    expect(screen.queryByText('Pagina')).toBeNull();
    expect(screen.queryByText('Versie / datum')).toBeNull();
    expect(document.body.textContent).not.toMatch(/p\. ?XX/);
    click('Klaar met lezen');
    expect(screen.getByRole('heading', { name: 'Controle 1' })).toBeInTheDocument();
  });

  it('documentenbeheer: toevoegen is niet actief', () => {
    render(<App />);
    click('Meer');
    click(/Documentenbeheer/);
    expect(screen.getByRole('button', { name: 'Document toevoegen' })).toBeDisabled();
    expect(screen.getByText('Nog niet beschikbaar in deze demo.')).toBeInTheDocument();
  });
});
