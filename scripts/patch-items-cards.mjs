import fs from "fs";

["public/index.html", "demo/index.html"].forEach(rel => {
  let s = fs.readFileSync(rel, "utf8");

  // Replace items loop
  const oldItems = s.match(/scr\.items\.forEach\(function\(it, itIdx\)[\s\S]*?out \+= '<\/div>';/);
  if (oldItems) {
    const newItems = `scr.items.forEach(function(it, itIdx){
        var itTitle = it.title || it.name || it.label || it.vehicle || "Opción";
        var itSubtitle = it.subtitle || it.desc || it.description || it.detail || "";
        var itPrice = it.price || it.cost || it.amount || "";
        var iconOrImg = it.image ?
          '<img src="'+h(it.image)+'" alt="" style="width:48px;height:36px;object-fit:contain;border-radius:4px" onerror="this.outerHTML=\\'<span style=\\\'font-size:22px\\\'>🚗</span>\\'">' :
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
      });
      out += '</div>';`;
    s = s.replace(oldItems[0], newItems);
    console.log(`[${rel}] Updated items in renderDynamicScreen`);
  }

  // Replace cards loop
  const oldCards = s.match(/scr\.cards\.forEach\(function\(c\)[\s\S]*?out \+= '<\/div>';/);
  if (oldCards) {
    const newCards = `scr.cards.forEach(function(c){
        var cdLabel = c.label || c.title || c.key || "Detalle";
        var cdVal = c.value || c.subtitle || c.val || c.meta || "";
        out += '<div style="background:#F6F6F6;padding:10px;border-radius:8px;text-align:center">'+
          '<div style="font-size:11px;color:#545454">'+h(cdLabel)+'</div>'+
          '<b style="font-size:15px;color:'+(stateType === "error" && /fallo|error|rechazad/i.test(cdVal) ? "#DE1135" : "#000000")+'">'+h(cdVal)+'</b>'+
        '</div>';
      });
      out += '</div>';`;
    s = s.replace(oldCards[0], newCards);
    console.log(`[${rel}] Updated cards in renderDynamicScreen`);
  }

  fs.writeFileSync(rel, s, "utf8");
});
