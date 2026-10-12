"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateOfferCarouselMetadata = void 0;
const timing_1 = require("../core/timing");
const validate_layout_1 = require("../core/validate-layout");
/**
 * `calculateMetadata` da composição: tamanho e fps das props e duração = fim
 * da última fala + cartela. Recusa o render quando o layout viola a área
 * segura (o backend valida antes; isto é a defesa em profundidade).
 */
const calculateOfferCarouselMetadata = ({ props, }) => {
    const issues = (0, validate_layout_1.validateLayout)(props);
    if (issues.length > 0) {
        throw new Error(`Layout inválido para ${props.width}×${props.height}: ` +
            issues.map((i) => `[${i.code}${i.elementId ? `:${i.elementId}` : ''}] ${i.message}`).join(' | '));
    }
    return {
        durationInFrames: (0, timing_1.computeDurationInFrames)(props),
        fps: props.fps,
        width: props.width,
        height: props.height,
    };
};
exports.calculateOfferCarouselMetadata = calculateOfferCarouselMetadata;
//# sourceMappingURL=metadata.js.map