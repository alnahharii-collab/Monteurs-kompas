import type { ReactNode } from 'react';
import { SOURCES, SOURCE_KIND_LABEL, deviceName, getDevice, FAULTS } from '../data/demo';
import { useApp } from '../AppContext';

export function Page({
  title,
  lead,
  back = true,
  onBack,
  children,
}: {
  title: string;
  lead?: string;
  back?: boolean;
  onBack?: () => void;
  children: ReactNode;
}) {
  const { dispatch } = useApp();
  return (
    <>
      {back && (
        <button type="button" className="back" onClick={onBack ?? (() => dispatch({ type: 'back' }))}>
          <span aria-hidden="true">←</span> Terug
        </button>
      )}
      <h1 className="page-title">{title}</h1>
      {lead && <p className="page-lead">{lead}</p>}
      <div className="stack">{children}</div>
    </>
  );
}

type Tone = 'info' | 'ok' | 'warn' | 'danger' | 'stop';
const ICON: Record<Tone, string> = { info: 'ℹ', ok: '✓', warn: '!', danger: '⚠', stop: '■' };

export function Status({ tone, title, children }: { tone: Tone; title: string; children?: ReactNode }) {
  return (
    <div className={`status status-${tone}`} role={tone === 'stop' ? 'alert' : undefined}>
      <p className="status-title">
        <span aria-hidden="true">{ICON[tone]}</span>
        {title}
      </p>
      {children}
    </div>
  );
}

export function Choice({
  title,
  sub,
  primary,
  onClick,
  disabled,
}: {
  title: string;
  sub?: string;
  primary?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button type="button" className={`choice${primary ? ' primary' : ''}`} onClick={onClick} disabled={disabled}>
      <span className="choice-body">
        <span className="choice-title">{title}</span>
        {sub && <span className="choice-sub">{sub}</span>}
      </span>
      <span className="chev" aria-hidden="true">
        ›
      </span>
    </button>
  );
}

export function Radio({
  label,
  checked,
  onSelect,
  disabled,
}: {
  label: string;
  checked: boolean;
  onSelect: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      className="option"
      onClick={onSelect}
      disabled={disabled}
    >
      <span className="radio-dot" aria-hidden="true" />
      {label}
    </button>
  );
}

/** Compacte regel met actief toestel en eventueel storing. */
export function Context() {
  const { session } = useApp();
  const device = getDevice(session.deviceId);
  if (!device) return null;
  const variant = device.variants.find((v) => v.id === session.variantId);
  const fault = session.faultCode ? FAULTS[session.faultCode] : undefined;
  return (
    <div className="context" aria-label="Actief toestel">
      <span>
        <span className="meta">Toestel </span>
        <strong>{deviceName(device)}</strong>
        {variant ? ` · ${variant.label}` : ''}
      </span>
      {fault && (
        <span>
          <span className="meta">Storing </span>
          <strong>{fault.code}</strong>
        </span>
      )}
      {device.fictional && <span className="badge">Fictief</span>}
    </div>
  );
}

/** Compacte bronverwijzing met alleen werkelijk vastgelegde metadata. */
export function SourceLine({ sourceId, anchor }: { sourceId?: string; anchor?: string }) {
  const { dispatch } = useApp();
  const src = sourceId ? SOURCES[sourceId] : undefined;
  if (!src) {
    return (
      <div className="source-line">
        <span className="meta">Bron: niet vastgelegd</span>
      </div>
    );
  }
  const parts = [src.manufacturer ?? SOURCE_KIND_LABEL[src.kind], src.docNumber].filter(Boolean);
  return (
    <div className="source-line">
      <span className="meta">Bron: {parts.join(' · ')}</span>
      <button
        type="button"
        className="link"
        onClick={() => dispatch({ type: 'navigate', view: { name: 'source', sourceId: src.id, anchor } })}
      >
        Bekijk bron
      </button>
    </div>
  );
}
