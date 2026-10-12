import { z } from 'zod';
import type { OfferCarouselProps } from './types';
/** Limites do formato (spec video-offer-carousel "Ofertas do projeto"). */
export declare const OFFER_CAROUSEL_MIN_OFFERS = 3;
export declare const OFFER_CAROUSEL_MAX_OFFERS = 6;
/** Tolerância (s) das palavras em relação à janela da fala e da ordem entre falas. */
export declare const TIMING_TOLERANCE_S = 0.05;
export declare const OFFER_CAROUSEL_LAYOUT_PRESETS: readonly ["character_left", "character_right", "character_bottom"];
/**
 * Mídia: URL absoluta (http/https/data) ou caminho relativo a `public/`
 * (fixtures). Caminho absoluto de disco ou "/uploads/..." é recusado: o
 * navegador do render não o resolveria.
 */
export declare const ASSET_SRC_PATTERN: RegExp;
/**
 * Schema das props da composição (zod 4, o mesmo major do Remotion 4.0.529).
 * Além da forma, valida o contrato do roteiro F2: 3 a 6 ofertas; falas em
 * ordem e sem sobreposição; abertura primeiro, fechamento por último e uma
 * fala por oferta NA ORDEM das ofertas; palavras dentro da janela da fala;
 * clipes em ordem; tamanho de saída entre os quatro suportados.
 */
export declare const offerCarouselPropsSchema: z.ZodObject<{
    width: z.ZodNumber;
    height: z.ZodNumber;
    fps: z.ZodLiteral<30>;
    character: z.ZodObject<{
        clips: z.ZodArray<z.ZodObject<{
            src: z.ZodString;
            startS: z.ZodNumber;
            endS: z.ZodNumber;
            lineId: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        window: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            w: z.ZodNumber;
            h: z.ZodNumber;
        }, z.core.$strip>;
        tileRatio: z.ZodNumber;
        posterUrl: z.ZodOptional<z.ZodString>;
        backgroundColor: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    offers: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        price: z.ZodString;
        originalPrice: z.ZodOptional<z.ZodString>;
        unit: z.ZodOptional<z.ZodString>;
        badge: z.ZodOptional<z.ZodString>;
        imageUrl: z.ZodString;
        catalogId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>;
    lines: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        kind: z.ZodEnum<{
            opening: "opening";
            offer: "offer";
            closing: "closing";
        }>;
        offerId: z.ZodOptional<z.ZodString>;
        startS: z.ZodNumber;
        endS: z.ZodNumber;
        words: z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            startS: z.ZodNumber;
            endS: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    brand: z.ZodObject<{
        logoUrl: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        primaryColor: z.ZodString;
        secondaryColor: z.ZodString;
        fontFamily: z.ZodString;
        fontUrl: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    layoutPreset: z.ZodEnum<{
        character_left: "character_left";
        character_right: "character_right";
        character_bottom: "character_bottom";
    }>;
    captions: z.ZodBoolean;
    music: z.ZodOptional<z.ZodObject<{
        src: z.ZodString;
        volume: z.ZodNumber;
        duck: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
    cardBox: z.ZodOptional<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        w: z.ZodNumber;
        h: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export interface PropsValidationIssue {
    path: string;
    message: string;
}
/** Valida props desconhecidas; devolve as props tipadas ou a lista de problemas (para 400/422). */
export declare function parseOfferCarouselProps(input: unknown): {
    success: true;
    data: OfferCarouselProps;
} | {
    success: false;
    issues: PropsValidationIssue[];
};
//# sourceMappingURL=schema.d.ts.map