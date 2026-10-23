"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Entrada `@chroma/video-templates/piece` — a peça de ofertas para o FRONTEND:
 * tipos do descritor, `layoutProducts`, schema e o `PieceCanvas` (React puro,
 * sem Remotion). O worker usa a mesma `PieceCanvas` dentro da composição
 * `OfferPieceStill` (entrada principal `lib.ts` / bundle `index.ts`).
 */
__exportStar(require("./core/piece/index"), exports);
__exportStar(require("./components/piece/PieceCanvas"), exports);
//# sourceMappingURL=piece.js.map