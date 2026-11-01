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
    "shortName": "1 · Configuración de exportación",
    "stateType": "happy_path",
    "mainTitle": "Preparar exportación",
    "mainSubtitle": "Elige el formato de archivo en el que deseas recibir la información de tu cuenta.",
    "cta": "Iniciar exportación",
    "ctaVariant": "primary",
    "ctaTargetStep": 2,
    "secondaryCta": null,
    "banner": null
  },
  {
    "step": 2,
    "shortName": "2 · Procesamiento y éxito",
    "stateType": "happy_path",
    "mainTitle": "Exportación completada",
    "mainSubtitle": "Tu archivo se ha generado con éxito y está listo para descargarse.",
    "cta": "Descargar archivo",
    "ctaVariant": "primary",
    "ctaTargetStep": 4,
    "secondaryCta": null,
    "banner": {
      "text": "La exportación se ha completado sin errores.",
      "tone": "positive"
    }
  },
  {
    "step": 3,
    "shortName": "3 · Caso de error de red o timeout",
    "stateType": "error",
    "mainTitle": "No pudimos completar la exportación",
    "mainSubtitle": "Ocurrió un problema de conexión al procesar los datos solicitados.",
    "cta": "Reintentar exportación",
    "ctaVariant": "negative",
    "ctaTargetStep": 2,
    "secondaryCta": null,
    "banner": {
      "text": "Comprueba tu conexión a internet e inténtalo de nuevo.",
      "tone": "negative"
    }
  },
  {
    "step": 4,
    "shortName": "4 · Confirmación de cierre",
    "stateType": "happy_path",
    "mainTitle": "¡Todo listo!",
    "mainSubtitle": "El archivo se ha descargado en tu dispositivo. Puedes cerrar esta ventana.",
    "cta": "Volver al inicio",
    "ctaVariant": "primary",
    "ctaTargetStep": 1,
    "secondaryCta": null,
    "banner": {
      "text": "Operación finalizada satisfactoriamente.",
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
