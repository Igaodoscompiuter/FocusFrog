import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useUI } from '../../context/UIContext';
import { themes, THEME_CATALOG } from '../../themes';
import { SOUND_CATALOG, EFFECT_CATALOG, SoundItem, playLoop, previewEffect, croakEffect } from '../../store/soundCatalog';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import { useBackHandler } from '../../hooks/useBackHandler';
import styles from './StoreScreen.module.css';

export const OPEN_STORE_EVENT = 'focusfrog:open-store';
export const openStore = () => window.dispatchEvent(new Event(OPEN_STORE_EVENT));

/** Média de pontos num dia de uso (4 focos + Sapo do Dia ≈ 90–100). */
const POINTS_PER_DAY = 100;
const PREVIEW_MS = 10000;

type Tab = 'temas' | 'sons';
interface Pending { id: string; name: string; price: number; kind: 'theme' | 'sound' | 'effect' }

const Leaf = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9h-9z" /></svg>
);
const PlayIcon = ({ playing }: { playing: boolean }) => playing
    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
    : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>;

/**
 * Loja do Sapo: gasta os pontos de foco em temas, sons de fundo e no som de
 * fim de foco. Tudo se ganha focando — não existe compra com dinheiro.
 */
export const StoreScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { pontosFoco, activeThemeId, setActiveThemeId, activeSoundId, setActiveSoundId,
        activeEffectId, setActiveEffectId, buyItem, isUnlocked } = useTheme();
    const { addNotification } = useUI();
    const [tab, setTab] = useState<Tab>('temas');
    const [selTheme, setSelTheme] = useState(activeThemeId);
    const [selSound, setSelSound] = useState(activeSoundId);
    const [playing, setPlaying] = useState<string | null>(null);
    const [pending, setPending] = useState<Pending | null>(null);
    const stopRef = useRef<() => void>(() => {});
    useBackHandler(onClose);

    // prévia de som: 10s e para sozinha; para ao sair da loja
    const stopPreview = () => { stopRef.current(); stopRef.current = () => {}; setPlaying(null); };
    useEffect(() => () => stopRef.current(), []);
    const togglePreview = (s: SoundItem) => {
        if (playing === s.id) { stopPreview(); return; }
        stopPreview();
        if (s.id === 'none' || !s.ready) return;
        const stop = playLoop(s, 0.5);
        const t = setTimeout(stopPreview, PREVIEW_MS);
        stopRef.current = () => { clearTimeout(t); stop(); };
        setPlaying(s.id);
    };

    const tag = (id: string, price: number, inUse: boolean, ready = true) => {
        if (!ready) return { text: 'Em breve', cls: styles.tagSoon };
        if (inUse) return { text: 'Em uso', cls: styles.tagOwned };
        if (isUnlocked(id, price)) return { text: price === 0 ? 'Grátis' : 'Seu', cls: styles.tagOwned };
        return { text: `${price} pontos`, cls: styles.tagPrice };
    };

    const confirmBuy = () => {
        if (!pending) return;
        const r = buyItem(pending.id, pending.price);
        if (r === 'ok' || r === 'owned') {
            if (pending.kind === 'theme') setActiveThemeId(pending.id);
            if (pending.kind === 'sound') setActiveSoundId(pending.id);
            if (pending.kind === 'effect') setActiveEffectId(pending.id);
            addNotification(`${pending.name} desbloqueado!`, '🐸', 'success');
        } else {
            addNotification('Pontos insuficientes.', 'ℹ️', 'info');
        }
        setPending(null);
    };

    // botão de baixo: o que dá pra fazer com o item selecionado
    const cta = (() => {
        if (tab === 'temas') {
            const it = THEME_CATALOG.find(t => t.id === selTheme) || THEME_CATALOG[0];
            if (it.id === activeThemeId) return { label: 'Em uso', disabled: true };
            if (isUnlocked(it.id, it.price)) return { label: 'Usar este tema', onClick: () => setActiveThemeId(it.id) };
            if (pontosFoco < it.price) return missing(it.price);
            return { label: `Desbloquear ${it.name} · ${it.price} pontos`, buy: true, onClick: () => setPending({ id: it.id, name: it.name, price: it.price, kind: 'theme' }) };
        }
        const it = SOUND_CATALOG.find(s => s.id === selSound) || SOUND_CATALOG[0];
        if (!it.ready) return { label: 'Esse som chega numa próxima versão', disabled: true };
        if (it.id === activeSoundId) return { label: 'Tocando nos seus focos', disabled: true };
        if (isUnlocked(it.id, it.price)) return { label: 'Usar nos meus focos', onClick: () => setActiveSoundId(it.id) };
        if (pontosFoco < it.price) return missing(it.price);
        return { label: `Desbloquear ${it.name} · ${it.price} pontos`, buy: true, onClick: () => setPending({ id: it.id, name: it.name, price: it.price, kind: 'sound' }) };
    })();
    function missing(price: number) {
        const falta = price - pontosFoco;
        const dias = Math.max(1, Math.ceil(falta / POINTS_PER_DAY));
        return { label: `Faltam ${falta} pontos · uns ${dias} ${dias === 1 ? 'dia' : 'dias'} de foco`, disabled: true };
    }

    const preview = themes[selTheme]?.colors || themes['dark-theme'].colors;
    const previewName = THEME_CATALOG.find(t => t.id === selTheme)?.name || '';

    return (
        <div className={styles.screen} role="dialog" aria-modal="true" aria-label="Loja do Sapo">
            <header className={styles.header}>
                <button className={styles.back} onClick={onClose} aria-label="Voltar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <h2>Loja do Sapo</h2>
                <span className={styles.points} aria-label={`${pontosFoco} pontos de foco`}><Leaf /> {pontosFoco}</span>
            </header>

            <div className={styles.tabs} role="tablist">
                <button role="tab" aria-selected={tab === 'temas'} className={tab === 'temas' ? styles.tabOn : ''} onClick={() => { stopPreview(); setTab('temas'); }}>Temas</button>
                <button role="tab" aria-selected={tab === 'sons'} className={tab === 'sons' ? styles.tabOn : ''} onClick={() => setTab('sons')}>Sons</button>
            </div>

            <div className={styles.body}>
                {tab === 'temas' ? (
                    <>
                        <div className={styles.preview} style={{ background: preview['--background-color'], borderColor: preview['--border-color'] }}>
                            <div className={styles.previewHead} style={{ background: preview['--primary-color'], color: preview['--text-on-primary'] }}>
                                <strong>Bom dia!</strong>
                                <span>Prévia do tema {previewName}</span>
                            </div>
                            <div className={styles.previewCard} style={{ background: preview['--surface-color'], borderColor: preview['--accent-color'] }}>
                                <span style={{ color: preview['--accent-color'] }} className={styles.previewLabel}>Sapo do Dia</span>
                                <span style={{ color: preview['--text-color'] }} className={styles.previewTitle}>Estudar capítulo 3</span>
                                <span className={styles.previewTrack} style={{ background: preview['--border-color'] }}>
                                    <i style={{ background: preview['--accent-color'] }} />
                                </span>
                                <span className={styles.previewBtn} style={{ background: preview['--primary-color'], color: preview['--text-on-primary'] }}>Começar foco</span>
                            </div>
                        </div>

                        <div className={styles.grid}>
                            {THEME_CATALOG.map(t => {
                                const c = themes[t.id].colors;
                                const tg = tag(t.id, t.price, t.id === activeThemeId);
                                return (
                                    <button key={t.id} className={`${styles.themeCard} ${selTheme === t.id ? styles.selected : ''}`} onClick={() => setSelTheme(t.id)} aria-pressed={selTheme === t.id}>
                                        <span className={styles.swatches} aria-hidden="true">
                                            <i style={{ background: c['--background-color'] }} />
                                            <i style={{ background: c['--primary-color'] }} />
                                            <i style={{ background: c['--accent-color'] }} />
                                        </span>
                                        <span className={styles.itemName}>{t.name}</span>
                                        <span className={`${styles.tag} ${t.epic && tg.cls === styles.tagPrice ? styles.tagEpic : tg.cls}`}>{t.epic && tg.cls === styles.tagPrice ? `Épico · ${tg.text}` : tg.text}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <>
                        <p className={styles.hint}>Tocam junto com o cronômetro, em loop, enquanto você foca.</p>
                        <ul className={styles.list}>
                            {SOUND_CATALOG.map(s => {
                                const tg = tag(s.id, s.price, s.id === activeSoundId, s.ready);
                                return (
                                    <li key={s.id} className={`${styles.row} ${selSound === s.id ? styles.selected : ''}`}>
                                        <button className={`${styles.play} ${playing === s.id ? styles.playOn : ''}`} onClick={() => togglePreview(s)} disabled={!s.ready || s.id === 'none'} aria-label={`${playing === s.id ? 'Parar' : 'Ouvir'} prévia: ${s.name}`}>
                                            <PlayIcon playing={playing === s.id} />
                                        </button>
                                        <button className={styles.rowMain} onClick={() => setSelSound(s.id)} aria-pressed={selSound === s.id}>
                                            <span className={styles.itemName}>{s.name}</span>
                                            <span className={styles.itemDesc}>{s.desc}</span>
                                        </button>
                                        <span className={`${styles.tag} ${tg.cls}`}>{tg.text}</span>
                                    </li>
                                );
                            })}
                        </ul>

                        <h3 className={styles.section}>Som do fim do foco</h3>
                        <ul className={styles.list}>
                            {EFFECT_CATALOG.map(e => {
                                const owned = isUnlocked(e.id, e.price);
                                const inUse = activeEffectId === e.id;
                                return (
                                    <li key={e.id} className={styles.row}>
                                        <button className={styles.play} onClick={() => previewEffect(croakEffect)} aria-label={`Ouvir prévia: ${e.name}`}>
                                            <PlayIcon playing={false} />
                                        </button>
                                        <div className={styles.rowMain}>
                                            <span className={styles.itemName}>{e.name}</span>
                                            <span className={styles.itemDesc}>{e.desc}</span>
                                        </div>
                                        {owned ? (
                                            <button className={styles.smallBtn} onClick={() => setActiveEffectId(inUse ? 'default' : e.id)}>{inUse ? 'Em uso' : 'Usar'}</button>
                                        ) : (
                                            <button className={styles.smallBtn} disabled={pontosFoco < e.price} onClick={() => setPending({ id: e.id, name: e.name, price: e.price, kind: 'effect' })}>{e.price} pontos</button>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}
            </div>

            <footer className={styles.footer}>
                <button className={`${styles.cta} ${cta.buy ? styles.ctaBuy : ''}`} disabled={!!cta.disabled} onClick={cta.onClick}>{cta.label}</button>
                <p>+10 pontos por foco · +50 pelo Sapo do Dia</p>
            </footer>

            {pending && (
                <ConfirmationModal
                    title={`Desbloquear ${pending.name}?`}
                    message={`Custa ${pending.price} pontos. Você tem ${pontosFoco} e vão sobrar ${pontosFoco - pending.price}.`}
                    confirmText="Desbloquear"
                    onConfirm={confirmBuy}
                    onCancel={() => setPending(null)}
                />
            )}
        </div>
    );
};
