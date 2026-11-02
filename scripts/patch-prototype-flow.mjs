import fs from "fs";
import path from "path";

const files = ["public/index.html", "demo/index.html"];

for (const rel of files) {
  const filePath = path.resolve(rel);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, "utf8");

  // 1. Replace banner and sanitize
  const oldSanitizeRegex = /function banner\(v,fb\)\{[\s\S]*?function sanitize\(c,p\)\{[\s\S]*?return o;\s*\}/;
  
  const newSanitize = `function banner(v,fb){
    if(v===null) return null;
    if(typeof v === "string" && v.trim()) return { text: v.trim().slice(0, 140), tone: "sun" };
    if(v && typeof v === "object") {
      var txt = v.text || v.title || v.message || v.desc || "";
      if (v.subtitle) txt = txt ? (txt + ": " + v.subtitle) : v.subtitle;
      if (txt && typeof txt === "string" && txt.trim()) {
        return { text: txt.trim().slice(0, 140), tone: pick(v.tone, ["sun","pine","negative","warning","positive"],"sun") };
      }
    }
    return fb===undefined?null:fb;
  }

  function sanitizeSingleScreen(s, idx){
    s = s || {};
    var secObj = null;
    if(typeof s.secondaryCta === "string" && s.secondaryCta.trim()){
      secObj = {
        text: s.secondaryCta.trim().slice(0, 50),
        variant: "secondary",
        targetStep: 1
      };
    } else if(s.secondaryCta && typeof s.secondaryCta === "object" && (s.secondaryCta.text || s.secondaryCta.label || s.secondaryCta.title)){
      secObj = {
        text: str(s.secondaryCta.text || s.secondaryCta.label || s.secondaryCta.title, "Volver", 50),
        variant: pick(s.secondaryCta.variant, ["primary", "secondary", "negative", "tertiary"], "secondary"),
        targetStep: (typeof s.secondaryCta.targetStep === "number" && s.secondaryCta.targetStep >= 1) ? s.secondaryCta.targetStep : 1
      };
    }
    var ctaTarget = (typeof s.ctaTargetStep === "number" && s.ctaTargetStep >= 1) ? s.ctaTargetStep :
                    (typeof s.ctaTargetStep === "string" && parseInt(s.ctaTargetStep, 10) >= 1) ? parseInt(s.ctaTargetStep, 10) : null;

    return {
      step: Number(s.step) || (idx + 1),
      shortName: str(s.shortName || s.title || s.name, "Paso " + (idx + 1), 60),
      stateType: pick(s.stateType, ["happy_path", "error", "corner_case"], "happy_path"),
      stateBadge: str(s.stateBadge, (s.stateType === "error" ? "CASO DE ERROR" : s.stateType === "corner_case" ? "CORNER CASE" : "HAPPY PATH"), 30),
      stateDesc: str(s.stateDesc, "", 160),
      hint: str(s.hint, "", 140),
      navTitle: str(s.navTitle, "Paso " + (idx + 1), 50),
      mainTitle: str(s.mainTitle, "Título del paso", 80),
      mainSubtitle: str(s.mainSubtitle, "", 160),
      showMap: !!s.showMap,
      mapMeta: s.mapMeta && typeof s.mapMeta === "object" ? s.mapMeta : null,
      heroImage: s.heroImage && typeof s.heroImage === "object" ? s.heroImage : null,
      items: Array.isArray(s.items) ? s.items.map(function(it){
        if(typeof it === "string") return { title: it, subtitle: "" };
        it = it || {};
        return {
          title: str(it.title || it.name || it.label || it.vehicle || "", "Opción", 60),
          subtitle: str(it.subtitle || it.desc || it.description || it.detail || "", "", 120),
          price: str(it.price || it.cost || it.amount || "", "", 24),
          icon: str(it.icon || "", "", 10),
          image: str(it.image || "", "", 200),
          highlight: !!it.highlight
        };
      }) : [],
      cards: Array.isArray(s.cards) ? s.cards.map(function(cd){
        if(typeof cd === "string") return { label: "Detalle", value: cd };
        cd = cd || {};
        return {
          label: str(cd.label || cd.title || cd.key || "Detalle", "Detalle", 40),
          value: str(cd.value || cd.subtitle || cd.val || cd.meta || "", "", 80)
        };
      }) : [],
      banner: banner(s.banner, null),
      cta: str(s.cta, "Continuar", 60),
      ctaVariant: pick(s.ctaVariant, ["primary", "secondary", "negative", "tertiary"], "primary"),
      ctaTargetStep: ctaTarget,
      secondaryCta: secObj,
      recoveryAction: str(s.recoveryAction, "", 120)
    };
  }

  function sanitize(c,p){
    c=c||{}; var o=clone(p);
    var t=c.theme||{};
    o.theme={cta:pick(t.cta,["pine","sun","ink"],p.theme.cta),radius:pick(t.radius,["sm","md","rounded","lg","pill"],p.theme.radius),density:pick(t.density,["comfortable","compact"],p.theme.density)};
    var r=c.results||{};
    o.results.title=str(r.title,p.results.title,60);
    o.results.subtitle=str(r.subtitle,p.results.subtitle,90);
    o.results.priceMode=pick(r.priceMode,["total","night"],p.results.priceMode);
    o.results.showRating=typeof r.showRating==="boolean"?r.showRating:p.results.showRating;
    if(Array.isArray(r.filters)&&r.filters.length){o.results.filters=r.filters.slice(0,5).map(function(f){return {label:str(f&&f.label,"Filtro",24),on:!!(f&&f.on)}})}
    if("banner" in r) o.results.banner=banner(r.banner,p.results.banner);
    if(Array.isArray(c.rooms)&&c.rooms.length){
      o.rooms=c.rooms.slice(0,4).map(function(x,i){
        var b=p.rooms[i]||p.rooms[0]; x=x||{};
        return {id:str(x.id,b.id+"-"+i,12),name:str(x.name,b.name,40),img:pick(x.img,["uberx","comfort","black","green","sea","room","suite"],b.img),badge:typeof x.badge==="string"?x.badge.slice(0,22):b.badge,
          perk:str(x.perk,b.perk,48),night:Math.round(num(x.night,b.night,1,500)*10)/10,rating:num(x.rating,b.rating,1,5),reviews:Math.round(num(x.reviews,b.reviews,0,99999)),
          specs:str(x.specs,b.specs,80),amenities:Array.isArray(x.amenities)&&x.amenities.length?x.amenities.slice(0,6).map(function(a){return str(a,"",28)}).filter(Boolean):b.amenities};
      });
    }
    var m=c.room||{};
    o.room.rateTitle=str(m.rateTitle,p.room.rateTitle,40);
    if(Array.isArray(m.rateOrder)&&m.rateOrder.length===2&&m.rateOrder.indexOf("flexible")>-1&&m.rateOrder.indexOf("nonref")>-1) o.room.rateOrder=m.rateOrder.slice();
    o.room.defaultRate=pick(m.defaultRate,["flexible","nonref"],p.room.defaultRate);
    ["flexible","nonref"].forEach(function(k){
      var src=(m.rates||{})[k]||{}, b=p.room.rates[k];
      o.room.rates[k]={name:str(src.name,b.name,28),detail:str(src.detail,b.detail,80),extra:Math.round(num(src.extra,b.extra,0,500))};
    });
    o.room.recommendation=typeof m.recommendation==="string"?m.recommendation.slice(0,120):p.room.recommendation;
    o.room.cta=str(m.cta,p.room.cta,24);
    if("banner" in m) o.room.banner=banner(m.banner,p.room.banner);
    var k=c.checkout||{};
    o.checkout.title=str(k.title,p.checkout.title,40);
    if(Array.isArray(k.fields)&&k.fields.length) o.checkout.fields=k.fields.slice(0,6).map(function(f){return {label:str(f&&f.label,"Campo",32),value:typeof(f&&f.value)==="string"?f.value.slice(0,40):""}});
    o.checkout.showPoints=typeof k.showPoints==="boolean"?k.showPoints:p.checkout.showPoints;
    o.checkout.pointsLabel=str(k.pointsLabel,p.checkout.pointsLabel,48);
    o.checkout.pointsValue=Math.round(num(k.pointsValue,p.checkout.pointsValue,0,500));
    o.checkout.cta=str(k.cta,p.checkout.cta,28);
    if("banner" in k) o.checkout.banner=banner(k.banner,p.checkout.banner);
    var f=c.confirm||{};
    o.confirm.title=str(f.title,p.confirm.title,40);
    o.confirm.message=str(f.message,p.confirm.message,140);
    if(Array.isArray(c.screens) && c.screens.length > 0){
      var baseScreens = Array.isArray(p.screens) ? clone(p.screens) : [];
      if(c.screens.length === 1 && baseScreens.length > 1){
        var single = c.screens[0];
        var targetStepIdx = -1;
        if(typeof single.step === "number" && single.step >= 1 && single.step <= baseScreens.length){
          targetStepIdx = single.step - 1;
        } else {
          var sTxt = (String(single.shortName || "") + " " + String(single.mainTitle || "") + " " + String(single.stateDesc || "")).toLowerCase();
          if(/seguim|camino|lleg|conductor|cancel/i.test(sTxt)) targetStepIdx = baseScreens.length - 1;
          else if(/pago|recogida|checkout/i.test(sTxt)) targetStepIdx = 2;
          else if(/opcion|preferenc|reserve/i.test(sTxt)) targetStepIdx = 1;
          else if(/error|fallo|tarjeta|rechaz/i.test(sTxt)) targetStepIdx = 3;
          else targetStepIdx = 0;
        }
        if(targetStepIdx >= 0 && targetStepIdx < baseScreens.length){
          baseScreens[targetStepIdx] = Object.assign({}, baseScreens[targetStepIdx], single, { step: targetStepIdx + 1 });
          o.screens = baseScreens.map(sanitizeSingleScreen);
        } else {
          o.screens = c.screens.map(sanitizeSingleScreen);
        }
      } else {
        o.screens = c.screens.map(sanitizeSingleScreen);
      }
    } else if(Array.isArray(p.screens)){
      o.screens = clone(p.screens);
    }
    return o;
  }`;

  if (oldSanitizeRegex.test(content)) {
    content = content.replace(oldSanitizeRegex, newSanitize);
    console.log(`[${rel}] Updated banner & sanitize`);
  } else {
    console.warn(`[${rel}] Could not find oldSanitizeRegex`);
  }

  // 2. In renderDynamicScreen: update items, cards, and secondaryCta fallbacks
  const oldItemsRegex = /scr\.items\.forEach\(function\(it, itIdx\)\{[\s\S]*?<b style="font-size:14px">'\+h\(it\.title\)\+'<\/b>'[\s\S]*?out \+= '<\/div>';\s*\}\);/;
  const newItems = `scr.items.forEach(function(it, itIdx){
        var itTitle = it.title || it.name || it.label || it.vehicle || "Opción";
        var itSubtitle = it.subtitle || it.desc || it.description || it.detail || "";
        var itPrice = it.price || it.cost || it.amount || "";
        var iconOrImg = it.image ?
          '<img src="'+h(it.image)+'" alt="" style="width:48px;height:36px;object-fit:contain;border-radius:4px" onerror="this.outerHTML=\\'<span style=\\\\\\'font-size:22px\\\\\\'>🚗</span>\\'">' :
          '<div style="width:36px;height:36px;border-radius:8px;background:'+(stateType === "error" ? "#FDF0F2" : "#F6F6F6")+';display:grid;place-items:center;font-size:18px">'+(it.icon||(stateType === "error" ? "💳" : "📍"))+'</div>';

        out += '<div class="al-card" data-act="dyn-select:'+itIdx+'" role="button" tabindex="0" style="padding:12px;margin-bottom:8px;cursor:pointer;border:'+(it.highlight?(stateType === "error" ? "2px solid #DE1135" : "2px solid #000000"):'1px solid #E2E2E2')+'">'+
          '<div style="display:flex;align-items:center;gap:12px">'+
            iconOrImg +
            '<div style="flex:1">'+
              '<div style="display:flex;justify-content:space-between;align-items:baseline">'+
                '<b style="font-size:14px">'+h(itTitle)+'</b>'+
                (itPrice ? '<span style="font-weight:700;font-size:14px;color:#000000">'+h(itPrice)+'</span>' : '')+
              '</div>'+
              (itSubtitle ? '<div style="font-size:12px;color:#545454">'+h(itSubtitle)+'</div>' : '')+
            '</div>'+
          '</div>'+
        '</div>';
      });`;

  if (oldItemsRegex.test(content)) {
    content = content.replace(oldItemsRegex, newItems);
    console.log(`[${rel}] Updated renderDynamicScreen items`);
  }

  const oldCardsRegex = /scr\.cards\.forEach\(function\(c\)\{[\s\S]*?<div style="font-size:11px;color:#545454">'\+h\(c\.label\)\+'<\/div>'[\s\S]*?out \+= '<\/div>';\s*\}\);/;
  const newCards = `scr.cards.forEach(function(c){
        var cLabel = c.label || c.title || c.key || "Detalle";
        var cVal = c.value || c.subtitle || c.val || c.meta || "";
        out += '<div style="background:#F6F6F6;padding:10px;border-radius:8px;text-align:center">'+
          '<div style="font-size:11px;color:#545454">'+h(cLabel)+'</div>'+
          '<b style="font-size:15px;color:'+(stateType === "error" && /fallo|error|rechazad/i.test(cVal) ? "#DE1135" : "#000000")+'">'+h(cVal)+'</b>'+
        '</div>';
      });`;

  if (oldCardsRegex.test(content)) {
    content = content.replace(oldCardsRegex, newCards);
    console.log(`[${rel}] Updated renderDynamicScreen cards`);
  }

  const oldSecCtaRegex = /if\(scr\.secondaryCta && scr\.secondaryCta\.text && !\/simul\/i\.test\(scr\.secondaryCta\.text\)\)\{[\s\S]*?out \+= '<\/div>';\s*return out;/;
  const newSecCta = `if(scr.secondaryCta && (scr.secondaryCta.text || typeof scr.secondaryCta === "string") && !/simul/i.test(scr.secondaryCta.text || scr.secondaryCta)){
      var secText = typeof scr.secondaryCta === "string" ? scr.secondaryCta : scr.secondaryCta.text;
      var secTarget = (typeof scr.secondaryCta.targetStep === "number" && scr.secondaryCta.targetStep >= 1) ? (scr.secondaryCta.targetStep - 1) : 0;
      var secVariant = (scr.secondaryCta && scr.secondaryCta.variant === "tertiary") ? "base-btn base-btn-tertiary size-default" : "base-btn base-btn-secondary size-default";
      out += '<button class="'+secVariant+'" data-act="dyn-goto" data-target-step="'+secTarget+'" style="margin-top:2px">'+
        '<span>'+h(secText)+'</span>'+
        '</button>';
    }
    out += '</div>';

    return out;`;

  if (oldSecCtaRegex.test(content)) {
    content = content.replace(oldSecCtaRegex, newSecCta);
    console.log(`[${rel}] Updated renderDynamicScreen secondaryCta`);
  }

  // 3. Replace localAgent
  const oldLocalAgentRegex = /function localAgent\(req,d\)\{[\s\S]*?return \{summary:ch\.length===1\?ch\[0\]:"Se aplican "\+ch\.length\+" cambios",changes:ch,agents:Object\.keys\(ag\),question:null,state:n\};\s*\}/;
  const newLocalAgent = `function localAgent(req, d){
    var q = req.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g,""), n = clone(d), ch = [], ag = {};
    function A(){ for(var i=0; i<arguments.length; i++) ag[arguments[i]] = 1; }
    var neg = /quita|elimina|oculta|sin |borra|no muestres/.test(q);

    if(!Array.isArray(n.screens) || n.screens.length === 0){
      n.screens = (DEFAULT_DESIGN && Array.isArray(DEFAULT_DESIGN.screens)) ? clone(DEFAULT_DESIGN.screens) : [];
    }

    // 1. Cancelar viaje / botón secundario
    if(/cancel|anul|interrump/.test(q)){
      var lastIdx = n.screens.length - 1;
      n.screens[lastIdx].secondaryCta = {
        text: "Cancelar viaje",
        variant: "secondary",
        targetStep: 1
      };
      n.screens[lastIdx].stateDesc = "Seguimiento en vivo con opción accesible para cancelar el viaje en cualquier momento.";
      ch.push("Añadido botón secundario «Cancelar viaje» en la pantalla de seguimiento en vivo");
      A("ux", "copy", "ui", "qa");
    }

    // 2. Valoración del conductor
    if(/valorac|rating|estrella|opinion|resena|conductor/.test(q)){
      n.results.showRating = !neg;
      if(n.screens[0] && Array.isArray(n.screens[0].items)){
        n.screens[0].items.forEach(function(it){
          if(/uberx/i.test(it.title)) it.subtitle = "4.92 ★ (1.420 viajes) · Llegada en 4 min";
          if(/comfort/i.test(it.title)) it.subtitle = "4.96 ★ (840 viajes) · Coches nuevos";
          if(/black/i.test(it.title)) it.subtitle = "4.98 ★ (512 viajes) · Chófer premium";
        });
      }
      if(n.screens[4] && n.screens[4].mapMeta){
        n.screens[4].mapMeta.rating = "4.98 ★ (Top Driver)";
      }
      ch.push(neg ? "Se oculta la valoración de los conductores" : "Valoración de conductores y número de opiniones visibles en las tarjetas");
      A("ux", "ui", "qa");
    }

    // 3. Uber Reserve prioritario
    if(/reserve|reserva/.test(q)){
      if(n.screens[0] && Array.isArray(n.screens[0].items)){
        var reserveItem = n.screens[0].items.find(function(it){ return /reserve/i.test(it.title || it.subtitle); });
        if(reserveItem){
          n.screens[0].items = [reserveItem].concat(n.screens[0].items.filter(function(it){ return it !== reserveItem; }));
        } else {
          n.screens[0].items.unshift({
            title: "Uber Reserve",
            subtitle: "Reserva programada · 15 min de espera cortesía",
            price: "18,20 €",
            icon: "📅",
            highlight: true
          });
        }
      }
      ch.push("Opción Uber Reserve colocada en primera posición y destacada");
      A("ux", "ui");
    }

    // 4. Aviso de alta demanda
    if(/alta demanda|demanda|aviso|tarifa dinamica|lluvia/.test(q)){
      var bannerTxt = /lluvia/.test(q) ?
        "🌧️ Advertencia de lluvia: tiempo de recogida estimado +3 min" :
        "⚡ Alta demanda en tu zona: los precios se ajustan para garantizar vehículos disponibles.";
      if(n.screens[0]){
        n.screens[0].banner = { text: bannerTxt, tone: "warning" };
      }
      ch.push("Aviso de alta demanda añadido en la cabecera de selección de vehículo");
      A("ux", "copy", "ui");
    }

    // 5. Suplemento del desglose
    if(/suplemento|desglose|tarifa base/.test(q)){
      if(n.screens[2] && Array.isArray(n.screens[2].cards)){
        n.screens[2].cards = n.screens[2].cards.filter(function(c){ return !/suplemento/i.test(c.label || c.title || ""); });
      }
      ch.push("Suplemento eliminado del desglose de precio de la pantalla de pago");
      A("ux", "ui");
    }

    // 6. Viaje silencioso
    if(/silencio|silencioso|charla|conversacion/.test(q)){
      if(n.screens[1] && Array.isArray(n.screens[1].items)){
        n.screens[1].items.push({
          title: "Preferencia de conversación: Silencio",
          subtitle: "El conductor sabrá que prefieres no conversar durante el trayecto",
          icon: "🤫",
          highlight: true
        });
      }
      ch.push("Preferencia de viaje silencioso agregada en opciones de confort");
      A("ux", "copy", "ui");
    }

    // 7. Punto de encuentro / Parking exprés
    if(/parking|expr|encuentro|recogida/.test(q)){
      if(n.screens[2] && Array.isArray(n.screens[2].items)){
        n.screens[2].items[0] = {
          title: "Punto de encuentro: Parking Exprés P1",
          subtitle: "Planta 0, dársena 4 · Acceso señalizado para VTC",
          icon: "📍",
          highlight: true
        };
      }
      ch.push("Punto de encuentro actualizado a Parking Exprés P1");
      A("ux", "ui");
    }

    // 8. Botones / Colores tokens
    if(/boton|cta|accion|color/.test(q)){
      if(/sol|amarill|dorad|ocre/.test(q)){ n.theme.cta="sun"; ch.push("Botón principal con el token Sol (#276EF1)"); A("ui","qa"); }
      else if(/oscur|negro|tinta/.test(q)){ n.theme.cta="ink"; ch.push("Botón principal con el token Tinta (#000000)"); A("ui","qa"); }
      else if(/verde|pino/.test(q)){ n.theme.cta="pine"; ch.push("Botón principal con el token Pino (#0E8345)"); A("ui"); }
    }

    if(!ch.length) return null;
    A("qa");
    return {
      summary: ch.length === 1 ? ch[0] : ("Se aplican " + ch.length + " cambios solicitados"),
      changes: ch,
      agents: Object.keys(ag),
      question: null,
      state: n
    };
  }`;

  if (oldLocalAgentRegex.test(content)) {
    content = content.replace(oldLocalAgentRegex, newLocalAgent);
    console.log(`[${rel}] Updated localAgent`);
  }

  // 4. Update changeForm submit handler: changedStepIdx, scrollIntoView, showWork buttons
  const oldSubmitRegex = /var n=versions\.length;\s*versions\.push\(\{n:n,design:next[\s\S]*?showWork\('<b>v'\+n\+' lista\.<\/b> '[\s\S]*?\$\("#changeInput"\)\.value="";/;
  const newSubmit = `var changedStepIdx = -1;
    if(Array.isArray(next.screens)){
      for(var si = 0; si < next.screens.length; si++){
        if(!base.screens || !base.screens[si] || JSON.stringify(next.screens[si]) !== JSON.stringify(base.screens[si])){
          changedStepIdx = si;
          break;
        }
      }
    }
    if(changedStepIdx >= 0){
      proto.step = changedStepIdx;
    }

    var n=versions.length;
    versions.push({n:n,design:next,summary:str(res.summary,"Cambios aplicados",140),request:req,changes:changes});
    viewIdx=n; renderVersions(); renderViewer(true);
    
    var ags = [];
    if(Array.isArray(res.agents)){
      ags = res.agents.filter(function(a){ return AG_NAMES[a]; });
    } else if(res.agents && typeof res.agents === "object"){
      ags = Object.keys(res.agents).map(function(k){
        if(/ux|arch/i.test(k)) return "ux";
        if(/copy|redact/i.test(k)) return "copy";
        if(/ui|design/i.test(k)) return "ui";
        if(/qa|audit/i.test(k)) return "qa";
        return k;
      }).filter(function(a){ return AG_NAMES[a]; });
    }
    if(ags.length === 0) ags = ["ux", "copy", "ui", "qa"];
    if(ags.indexOf("qa") < 0) ags.push("qa");

    var targetScrName = (changedStepIdx >= 0 && next.screens && next.screens[changedStepIdx]) ?
      (next.screens[changedStepIdx].shortName || ("Paso " + (changedStepIdx + 1))) : "Pantalla modificada";

    showWork(
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap">' +
        '<div>' +
          '<b style="font-size:14.5px;color:var(--fg)">v' + n + ' lista.</b> ' +
          '<p style="margin:4px 0 8px;font-size:13px;line-height:1.45;color:var(--fg)">' + h(versions[n].summary) + '</p>' +
          '<div class="work-agents">' + ags.map(function(a){ return '<span class="chip ok">' + AG_NAMES[a] + ' ✓</span>'; }).join("") + '</div>' +
        '</div>' +
        '<div style="display:inline-flex;gap:8px;flex-wrap:wrap;align-items:center">' +
          '<button type="button" class="btn primary sm" onclick="window.scrollToViewerAndStep && window.scrollToViewerAndStep(' + (changedStepIdx >= 0 ? changedStepIdx : 0) + ')" style="font-weight:700">' +
            '👀 Ver pantalla con cambios (' + h(targetScrName) + ') ➔' +
          '</button>' +
        '</div>' +
      '</div>' +
      (res.question ? '<div class="q" style="margin-top:8px">' + h(String(res.question).slice(0, 240)) + '</div>' : '') +
      (note ? '<div class="time" style="margin-top:6px">' + h(note) + '</div>' : '')
    );

    setTimeout(function(){
      var vEl = document.getElementById("viewer") || document.getElementById("deliverables");
      if(vEl){
        vEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 180);

    if(typeof toast === "function"){
      toast("✨ ¡Versión v" + n + " lista! Prototipo actualizado con los cambios.");
    }
    $("#changeInput").value="";`;

  if (oldSubmitRegex.test(content)) {
    content = content.replace(oldSubmitRegex, newSubmit);
    console.log(`[${rel}] Updated submit handler`);
  }

  // 5. Expose window.scrollToViewerAndStep
  if (!content.includes("window.scrollToViewerAndStep =")) {
    const attachTarget = `window.switchPhase = switchPhase;`;
    const attachCode = `window.switchPhase = switchPhase;

  window.scrollToViewerAndStep = function(stepIdx){
    if(typeof stepIdx === "number"){
      proto.step = stepIdx;
      if(typeof renderViewer === "function") renderViewer(true);
    }
    var vEl = document.getElementById("viewer") || document.getElementById("deliverables");
    if(vEl){
      vEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };`;
    content = content.replace(attachTarget, attachCode);
    console.log(`[${rel}] Added window.scrollToViewerAndStep`);
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`[${rel}] Successfully saved!`);
}
