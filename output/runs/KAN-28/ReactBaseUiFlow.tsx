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
    "shortName": "1. Selección de viaje",
    "stateType": "happy_path",
    "mainTitle": "¿A dónde vamos?",
    "mainSubtitle": "",
    "cta": "Continuar",
    "ctaVariant": "primary",
    "ctaTargetStep": null,
    "secondaryCta": null,
    "banner": null
  },
  {
    "step": 2,
    "shortName": "2. Uber Reserve",
    "stateType": "happy_path",
    "mainTitle": "Reserva con antelación",
    "mainSubtitle": "",
    "cta": "Continuar",
    "ctaVariant": "primary",
    "ctaTargetStep": null,
    "secondaryCta": null,
    "banner": null
  },
  {
    "step": 3,
    "shortName": "3. Confirmación",
    "stateType": "happy_path",
    "mainTitle": "Reserva confirmada",
    "mainSubtitle": "",
    "cta": "Continuar",
    "ctaVariant": "primary",
    "ctaTargetStep": null,
    "secondaryCta": null,
    "banner": null
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
