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
 * Núcleo PURO do pacote (sem React): schema, tipos, tokens, versão e helpers
 * de layout, validação, timing, preço e legendas. É o que o backend importa
 * (`@chroma/video-templates/core`) para validar props antes do render.
 */
__exportStar(require("./version"), exports);
__exportStar(require("./tokens"), exports);
__exportStar(require("./types"), exports);
__exportStar(require("./safe-area"), exports);
__exportStar(require("./price"), exports);
__exportStar(require("./schema"), exports);
__exportStar(require("./layout"), exports);
__exportStar(require("./validate-layout"), exports);
__exportStar(require("./timing"), exports);
__exportStar(require("./captions"), exports);
__exportStar(require("./assets"), exports);
__exportStar(require("./piece/index"), exports);
//# sourceMappingURL=index.js.map