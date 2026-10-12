/**
 * Tamanhos de saída e áreas seguras (design D12/D13; espelho de
 * `safeAreaFor` em backend/src/modules/commercials/domain/mc-talking-art-window.ts).
 */
export interface SupportedSize {
    aspect: '9:16' | '4:5' | '1:1' | '16:9';
    width: number;
    height: number;
}
export declare const SUPPORTED_SIZES: readonly SupportedSize[];
export declare function supportedSizeOf(width: number, height: number): SupportedSize | null;
export declare function isSupportedSize(width: number, height: number): boolean;
/** Bordas da área segura em pixels do quadro. */
export interface SafeAreaPx {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
/** Inset uniforme dos tamanhos sem reserva de topo/rodapé (D13). */
export declare const SAFE_INSET_PX = 65;
/**
 * Área segura por tamanho (D13): 1080×1920 (Reels e Status) x 65–1015 e
 * y 269–1248; os demais, 65 px em todos os lados. Depende só do tamanho.
 */
export declare function safeAreaFor(width: number, height: number): SafeAreaPx;
//# sourceMappingURL=safe-area.d.ts.map