//#region [> Tab and Section <]
const tabs = $all(".tab");
const sections = $all(".section");

const toggle_tabs = (keep=0)=>{
    for (let i = 0; i < tabs.length; i++) {
        const e = tabs[i];
        if (i != keep) e.classList.remove("in-sect");
        else e.classList.add("in-sect");
    }
}
const hide_sections = (keep=0)=>{
    for (let i = 0; i < sections.length; i++) {
        const e = sections[i];
        if (i == keep) continue;
        e.style.display = "none";
    }
}

(()=>{
    for (let i = 0; i < tabs.length; i++) {
        const t = tabs[i];
        t.onclick = function (){
            sections[i].style.display = "grid";
            toggle_tabs(i);
            hide_sections(i);
        }
    }
})(); tabs[2].onclick();
//#endregion

//#region [> Clicking Orbs <]

const get_weight = (list)=>{
    let total = 0;
    for (let i = 0; i < list.length; i++) total += list[i].weight;
    return total;
}
let total_weight = get_weight(D.orbs);

const orb_btns = $all("#upgr-orbs .btn");

const orb_html = (e, orb)=> e.innerHTML = `<h3>Value +${orb.per_upgr}: $${format_num(orb.up_cost)}</h3><h3>${Math.round(orb.weight/total_weight*1000)/10}% | (${format_num(orb.value*orb.total)}) </h3>`;

const update_orb_btns = ()=>{
    for (let i = 0; i < orb_btns.length; i++) {
        const e = orb_btns[i];
        const orb = D.orbs[i];
        if (D.orbs[i-1]?.weight <= 0) {
            e.style.display = "none";
            continue;
        }
        orb_html(e, orb);
        e.style.display = "grid";
    }
}; update_orb_btns();

(()=>{
    for (let i = 0; i < orb_btns.length; i++) orb_btns[i].style.backgroundColor = orb_colors[i];

    for (let i = 0; i < orb_btns.length; i++) {
        const e = orb_btns[i];
        const orb = D.orbs[i];
        orb_html(e, orb);
        e.onclick = function(){
            if (D.cash < orb.up_cost) return;
            D.cash -= orb.up_cost;
            orb.up_cost = Math.round(orb.up_cost * 1.25);
            total_weight++;
            orb.weight++;
            orb.total++;
            update_orb_btns();
        }
    }
})();
//#endregion

//#region [> Idle Orbs <]
const idle_btns = $all("#upgr-idle .btn");

idle_btns[0].onclick = ()=>{
    if (D.cash < D.idle_orb_cost) return;
    D.cash -= D.idle_orb_cost;
    D.idle_orb_cost = Math.round(D.idle_orb_cost * 0.25);
    D.idle_orb_sec += 1;
}

//#endregion

//#region [> Prestige <]
const prest_btns = $all("#prestige .btn");
prest_btns[0].onclick = ()=>{
    // if (D.cash < D.prest_cost) return;

    D.mana += calc_mana();
    D.prest_cost = Math.round(D.prest_cost * 1.25);

    for (const k in D.$init) {
        if (Object.hasOwnProperty.call(D.$init, k)) {
            if (k == "prest_cost" || k == "mana" || k == "calc_mana") continue;
            const v = D.$init[k];
            D[k] = v;
            console.log(k);
        }
    }
    total_weight = get_weight(D.orbs);
    update_orb_btns();
}
//#endregion


D.$do_init = false; D.$load = false;

// console.log(D.$init);