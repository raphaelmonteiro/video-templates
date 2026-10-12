/**
 * Tamanhos de saída e áreas seguras (design D12/D13; espelho de
 * `safeAreaFor` em backend/src/modules/commercials/domain/mc-talking-art-window.ts).
 */
export const SUPPORTED_SIZES = [
    { aspect: '9:16', width: 1080, height: 1920 },
    { aspect: '4:5', width: 1080, height: 1350 },
    { aspect: '1:1', width: 1080, height: 1080 },
    { aspect: '16:9', width: 1920, height: 1080 },
];
export function supportedSizeOf(width, height) {
    return SUPPORTED_SIZES.find((s) => s.width === width && s.height === height) ?? null;
}
export function isSupportedSize(width, height) {
    return supportedSizeOf(width, height) !== null;
}
/** Inset uniforme dos tamanhos sem reserva de topo/rodapé (D13). */
export const SAFE_INSET_PX = 65;
/**
 * Área segura por tamanho (D13): 1080×1920 (Reels e Status) x 65–1015 e
 * y 269–1248; os demais, 65 px em todos os lados. Depende só do tamanho.
 */
export function safeAreaFor(width, height) {
    if (width === 1080 && height === 1920)
        return { left: 65, top: 269, right: 1015, bottom: 1248 };
    return {
        left: SAFE_INSET_PX,
        top: SAFE_INSET_PX,
        right: width - SAFE_INSET_PX,
        bottom: height - SAFE_INSET_PX,
    };
}
//# sourceMappingURL=safe-area.js.map