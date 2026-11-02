// ==============================================================================
// Generado automáticamente por el Pipeline de Agentes de Uber Base Design System
// Componentes oficiales de base.uber.com (@uber/baseui) para React / Next.js
// ==============================================================================

import React, { useState } from "react";
import { Button, KIND, SHAPE, SIZE } from "baseui/button";
import { Banner, HIERARCHY } from "baseui/banner";

export const SCREENS = [
  {
    "step": 1,
    "shortName": "1 · Mapa con puntos de recarga",
    "stateType": "happy_path",
    "mainTitle": "Puntos de recarga cercanos",
    "mainSubtitle": "Selecciona una estación en el mapa para ver conectores y tarifas.",
    "cta": "Ver estación seleccionada",
    "ctaVariant": "primary",
    "ctaTargetStep": 2,
    "secondaryCta": null,
    "banner": null
  },
  {
    "step": 2,
    "shortName": "2 · Ficha plegada de estación",
    "stateType": "happy_path",
    "mainTitle": "EcoStation Central",
    "mainSubtitle": "Av. Principal 452 • 4 conectores libres de 6 totales",
    "cta": "Ver detalles y conectores",
    "ctaVariant": "primary",
    "ctaTargetStep": 3,
    "secondaryCta": null,
    "banner": null
  },
  {
    "step": 3,
    "shortName": "3 · Ficha desplegada y selección de conector",
    "stateType": "happy_path",
    "mainTitle": "Selecciona un conector",
    "mainSubtitle": "Todos los conectores disponibles en EcoStation Central.",
    "cta": "Iniciar recarga",
    "ctaVariant": "primary",
    "ctaTargetStep": 5,
    "secondaryCta": {
      "text": "Simular conector ocupado",
      "variant": "secondary",
      "targetStep": 4
    },
    "banner": null
  },
  {
    "step": 4,
    "shortName": "4 · Caso de error: Conector no disponible",
    "stateType": "error",
    "mainTitle": "Conector no disponible",
    "mainSubtitle": "El conector seleccionado acaba de ser ocupado por otro vehículo.",
    "cta": "Elegir conector alternativo",
    "ctaVariant": "negative",
    "ctaTargetStep": 3,
    "secondaryCta": null,
    "banner": {
      "text": "El conector ya no está libre. Te sugerimos una alternativa cercana sin coste adicional.",
      "tone": "negative"
    }
  },
  {
    "step": 5,
    "shortName": "5 · Recarga iniciada con éxito",
    "stateType": "happy_path",
    "mainTitle": "¡Recarga iniciada!",
    "mainSubtitle": "La estación está suministrando energía correctamente a tu vehículo.",
    "cta": "Ver detalles de la sesión",
    "ctaVariant": "primary",
    "ctaTargetStep": 1,
    "secondaryCta": {
      "text": "Finalizar recarga",
      "variant": "secondary",
      "targetStep": 1
    },
    "banner": {
      "text": "Recarga conectada correctamente. Puedes detenerla en cualquier momento.",
      "tone": "positive"
    }
  }
];

export default function UberBaseFlow() {
  const [stepIndex, setStepIndex] = useState(0);
  const current = SCREENS[stepIndex] || SCREENS[0];

  const handlePrimaryClick = () => {
    if (typeof current.ctaTargetStep === "number" && current.ctaTargetStep >= 1) {
      setStepIndex(current.ctaTargetStep - 1);
    } else if (stepIndex < SCREENS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setStepIndex(0);
    }
  };

  const handleSecondaryClick = () => {
    if (current.secondaryCta && typeof current.secondaryCta.targetStep === "number") {
      setStepIndex(current.secondaryCta.targetStep - 1);
    } else {
      setStepIndex(0);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: 20, fontFamily: "Uber Move Text, system-ui" }}>
      {current.banner && (
        <div style={{ marginBottom: 14 }}>
          <Banner title={current.banner.text} hierarchy={HIERARCHY.high} />
        </div>
      )}
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px 0" }}>{current.mainTitle}</h2>
      <p style={{ fontSize: 13, color: "#545454", margin: "0 0 16px 0" }}>{current.mainSubtitle}</p>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
        <Button
          kind={current.ctaVariant === "negative" ? KIND.negative : KIND.primary}
          shape={SHAPE.rounded}
          size={SIZE.large}
          overrides={{ BaseButton: { style: { width: "100%", borderRadius: "8px" } } }}
          onClick={handlePrimaryClick}
        >
          {current.cta}
        </Button>

        {current.secondaryCta && (
          <Button
            kind={current.secondaryCta.variant === "tertiary" ? KIND.tertiary : KIND.secondary}
            shape={SHAPE.rounded}
            size={SIZE.default}
            overrides={{ BaseButton: { style: { width: "100%", borderRadius: "8px" } } }}
            onClick={handleSecondaryClick}
          >
            {current.secondaryCta.text || current.secondaryCta}
          </Button>
        )}
      </div>
    </div>
  );
}
