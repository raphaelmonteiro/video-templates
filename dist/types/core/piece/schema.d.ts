import { z } from 'zod';
import { type PropsValidationIssue } from '../schema';
import { type OfferPieceStillProps, type PieceDocument } from './types';
export declare const pieceDocumentSchema: z.ZodObject<{
    schemaVersion: z.ZodNumber;
    aspectRatio: z.ZodEnum<{
        "9:16": "9:16";
        "4:5": "4:5";
    }>;
    background: z.ZodDiscriminatedUnion<[z.ZodObject<{
        mode: z.ZodLiteral<"solid">;
        color: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        mode: z.ZodLiteral<"gradient">;
        colors: z.ZodTuple<[z.ZodString, z.ZodString], null>;
        angle: z.ZodNumber;
    }, z.core.$strip>, z.ZodObject<{
        mode: z.ZodLiteral<"image">;
        imageUrl: z.ZodString;
        fit: z.ZodOptional<z.ZodEnum<{
            cover: "cover";
            contain: "contain";
        }>>;
        blur: z.ZodOptional<z.ZodNumber>;
        darken: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>], "mode">;
    blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"logo">;
        imageUrl: z.ZodNullable<z.ZodString>;
        id: z.ZodString;
        rect: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            w: z.ZodNumber;
            h: z.ZodNumber;
        }, z.core.$strip>;
        zIndex: z.ZodNumber;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"text">;
        text: z.ZodString;
        fontFamily: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        fontSize: z.ZodNumber;
        color: z.ZodString;
        align: z.ZodEnum<{
            left: "left";
            right: "right";
            center: "center";
        }>;
        weight: z.ZodEnum<{
            regular: "regular";
            bold: "bold";
        }>;
        id: z.ZodString;
        rect: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            w: z.ZodNumber;
            h: z.ZodNumber;
        }, z.core.$strip>;
        zIndex: z.ZodNumber;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"footer">;
        style: z.ZodEnum<{
            bar: "bar";
            pill: "pill";
        }>;
        address: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        validity: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            from: z.ZodString;
            to: z.ZodString;
        }, z.core.$strip>>>;
        legal: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        backgroundColor: z.ZodString;
        textColor: z.ZodString;
        id: z.ZodString;
        rect: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            w: z.ZodNumber;
            h: z.ZodNumber;
        }, z.core.$strip>;
        zIndex: z.ZodNumber;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"products">;
        mode: z.ZodEnum<{
            grid: "grid";
            single: "single";
        }>;
        layout: z.ZodEnum<{
            auto: "auto";
            manual: "manual";
        }>;
        areaStyle: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            background: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            radius: z.ZodOptional<z.ZodNumber>;
            shadow: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>>;
        tagStyle: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            kind: z.ZodEnum<{
                badge: "badge";
                plain: "plain";
            }>;
            color: z.ZodString;
            textColor: z.ZodString;
        }, z.core.$strip>>>;
        items: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            catalogId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            name: z.ZodString;
            grams: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            unit: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            price: z.ZodString;
            originalPrice: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            imageUrl: z.ZodString;
            rect: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                w: z.ZodNumber;
                h: z.ZodNumber;
            }, z.core.$strip>>>;
            featured: z.ZodOptional<z.ZodBoolean>;
            spoken: z.ZodBoolean;
        }, z.core.$strip>>;
        singleImageUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        id: z.ZodString;
        rect: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            w: z.ZodNumber;
            h: z.ZodNumber;
        }, z.core.$strip>;
        zIndex: z.ZodNumber;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"character">;
        kitId: z.ZodString;
        mode: z.ZodEnum<{
            in_piece: "in_piece";
            logo_face: "logo_face";
        }>;
        panel: z.ZodObject<{
            shape: z.ZodEnum<{
                card: "card";
                none: "none";
                circle: "circle";
            }>;
            color: z.ZodString;
        }, z.core.$strip>;
        id: z.ZodString;
        rect: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            w: z.ZodNumber;
            h: z.ZodNumber;
        }, z.core.$strip>;
        zIndex: z.ZodNumber;
    }, z.core.$strip>], "type">>;
    fonts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        family: z.ZodString;
        url: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>;
/**
 * Props do quadro parado: descritor válido, dimensões do formato e mídias/fontes
 * em URL que o navegador do render resolve (absoluta http/https/data ou caminho
 * relativo a `public/` — nunca `/uploads/...` cru nem caminho de disco).
 */
export declare const offerPieceStillPropsSchema: z.ZodObject<{
    document: z.ZodObject<{
        schemaVersion: z.ZodNumber;
        aspectRatio: z.ZodEnum<{
            "9:16": "9:16";
            "4:5": "4:5";
        }>;
        background: z.ZodDiscriminatedUnion<[z.ZodObject<{
            mode: z.ZodLiteral<"solid">;
            color: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            mode: z.ZodLiteral<"gradient">;
            colors: z.ZodTuple<[z.ZodString, z.ZodString], null>;
            angle: z.ZodNumber;
        }, z.core.$strip>, z.ZodObject<{
            mode: z.ZodLiteral<"image">;
            imageUrl: z.ZodString;
            fit: z.ZodOptional<z.ZodEnum<{
                cover: "cover";
                contain: "contain";
            }>>;
            blur: z.ZodOptional<z.ZodNumber>;
            darken: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>], "mode">;
        blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            type: z.ZodLiteral<"logo">;
            imageUrl: z.ZodNullable<z.ZodString>;
            id: z.ZodString;
            rect: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                w: z.ZodNumber;
                h: z.ZodNumber;
            }, z.core.$strip>;
            zIndex: z.ZodNumber;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"text">;
            text: z.ZodString;
            fontFamily: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            fontSize: z.ZodNumber;
            color: z.ZodString;
            align: z.ZodEnum<{
                left: "left";
                right: "right";
                center: "center";
            }>;
            weight: z.ZodEnum<{
                regular: "regular";
                bold: "bold";
            }>;
            id: z.ZodString;
            rect: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                w: z.ZodNumber;
                h: z.ZodNumber;
            }, z.core.$strip>;
            zIndex: z.ZodNumber;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"footer">;
            style: z.ZodEnum<{
                bar: "bar";
                pill: "pill";
            }>;
            address: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            validity: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                from: z.ZodString;
                to: z.ZodString;
            }, z.core.$strip>>>;
            legal: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            backgroundColor: z.ZodString;
            textColor: z.ZodString;
            id: z.ZodString;
            rect: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                w: z.ZodNumber;
                h: z.ZodNumber;
            }, z.core.$strip>;
            zIndex: z.ZodNumber;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"products">;
            mode: z.ZodEnum<{
                grid: "grid";
                single: "single";
            }>;
            layout: z.ZodEnum<{
                auto: "auto";
                manual: "manual";
            }>;
            areaStyle: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                background: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                radius: z.ZodOptional<z.ZodNumber>;
                shadow: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strip>>>;
            tagStyle: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                kind: z.ZodEnum<{
                    badge: "badge";
                    plain: "plain";
                }>;
                color: z.ZodString;
                textColor: z.ZodString;
            }, z.core.$strip>>>;
            items: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                catalogId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                name: z.ZodString;
                grams: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                unit: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                price: z.ZodString;
                originalPrice: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                imageUrl: z.ZodString;
                rect: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    w: z.ZodNumber;
                    h: z.ZodNumber;
                }, z.core.$strip>>>;
                featured: z.ZodOptional<z.ZodBoolean>;
                spoken: z.ZodBoolean;
            }, z.core.$strip>>;
            singleImageUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            id: z.ZodString;
            rect: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                w: z.ZodNumber;
                h: z.ZodNumber;
            }, z.core.$strip>;
            zIndex: z.ZodNumber;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"character">;
            kitId: z.ZodString;
            mode: z.ZodEnum<{
                in_piece: "in_piece";
                logo_face: "logo_face";
            }>;
            panel: z.ZodObject<{
                shape: z.ZodEnum<{
                    card: "card";
                    none: "none";
                    circle: "circle";
                }>;
                color: z.ZodString;
            }, z.core.$strip>;
            id: z.ZodString;
            rect: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                w: z.ZodNumber;
                h: z.ZodNumber;
            }, z.core.$strip>;
            zIndex: z.ZodNumber;
        }, z.core.$strip>], "type">>;
        fonts: z.ZodOptional<z.ZodArray<z.ZodObject<{
            family: z.ZodString;
            url: z.ZodString;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    width: z.ZodNumber;
    height: z.ZodNumber;
    fonts: z.ZodArray<z.ZodObject<{
        family: z.ZodString;
        url: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
/** Valida um descritor desconhecido; devolve o documento tipado ou a lista de problemas. */
export declare function parsePieceDocument(input: unknown): {
    success: true;
    data: PieceDocument;
} | {
    success: false;
    issues: PropsValidationIssue[];
};
/** Valida as props do quadro parado (o worker chama antes do `renderStill`). */
export declare function parseOfferPieceStillProps(input: unknown): {
    success: true;
    data: OfferPieceStillProps;
} | {
    success: false;
    issues: PropsValidationIssue[];
};
//# sourceMappingURL=schema.d.ts.map