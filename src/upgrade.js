//#region [> Clicking Orbs <]

const get_weight = (list)=>{
    let total = 0;
    for (let i = 0; i < list.length; i++) total += list[i].weight;
    return total;
}
const calc_weight = (weight)=>{
    let total = 0;
    for (let i = 0; i < D.orbs.length; i++) total += D.orbs[i].weight;
    return Math.round(weight/total*1000)/10;
}
let total_weight = get_weight(D.orbs);

const orb_btns = $all("#upgr-orbs .btn");
//Math.round(orb.weight/total_weight*1000)/10
const orb_html = (e, orb=new Orb())=> e.innerHTML = `<h3>Value +${format_num(orb.value)}: $${format_num(orb.up_cost)}</h3><h3>${calc_weight(orb.weight)}% | (${format_num(orb.value*orb.weight)}) </h3>`;

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
    D.idle_orb_cost = Math.round(D.idle_orb_cost * 1.5);
    D.idle_orb_sec += 1;
    if (D.idle_orb_sec == 1) idle_run();
}
idle_btns[1].onclick = ()=>{
    if (D.cash < D.burst_fire_perc_cost) return;
    D.cash -= D.burst_fire_perc_cost;
    D.burst_fire_perc_cost = Math.round(D.burst_fire_perc_cost * 1.5);
    D.burst_fire_perc += 1;
}
idle_btns[2].onclick = ()=>{
    if (D.cash < D.burst_fire_amount_cost) return;
    D.cash -= D.burst_fire_amount_cost;
    D.burst_fire_amount_cost = Math.round(D.burst_fire_amount_cost * 1.5);
    D.burst_fire_amount += 1;
}

//#endregion

//#region [> Prestige <]
const prest_btn_txts = $all("#prestige .btn-txt");

const prest_btns = $all("#prestige .btn");
prest_btns[0].onclick = ()=>{
    if (D.cash < D.prest_cost) return;

    D.mana += calc_mana();
    D.prest_cost = Math.round(D.prest_cost * 1.25);

    for (const k in D.$init) {
        if (Object.hasOwnProperty.call(D.$init, k)) {
            // if (k == "prest_cost" || k == "mana" || k == "calc_mana") continue;
            const v = D.$init[k];
            D[k] = v;
        }
    }

    // entities.splice(0, entities.length);
    for (let i = 0; i < orb_ents.destroy.length; i++) orb_ents.destroy[i] = true;
    orb_ents.clear();
    cash_cache = 0;
    total_weight = 1;
    update_orb_btns();
}

const upgr_prest_thing = (i=0, incr=1, mult=1.2)=>{
    if (D.mana < D.prest_upgr_costs[i] || check_prest_max(i)) return;
    D.mana -= D.prest_upgr_costs[i];
    D.prest_upgr_costs[i] = Math.ceil(D.prest_upgr_costs[i] * mult);
    D.prest_upgr_values[i] += incr;
    D.prest_upgr_values[i] = Math.round(D.prest_upgr_values[i]*10)/10;

    D.prest_upgr_costs = D.prest_upgr_costs;
    D.prest_upgr_values = D.prest_upgr_values;

    check_prest_max(i);
}

const check_prest_max = (i=-1)=>{
    if (D.prest_upgr_values[0] >= 50) prest_btn_txts[0].innerText = "Recycle: Max of 50%";
    if (D.prest_upgr_values[1] >= 75) prest_btn_txts[1].innerText = "Recycle: Max of 75%";
    if (D.prest_upgr_values[3] >= 2) prest_btn_txts[3].innerText = "Recycle: Max of 2%";
    if (D.prest_upgr_values[4] >= 25) prest_btn_txts[4].innerText = "Recycle: Max of 25%";

    if (i == 0) { // Recycle
        if (D.prest_upgr_values[0] >= 50) return true;
        else return false;
    }
    if (i == 1) { // Shotgun %
        if (D.prest_upgr_values[1] >= 75) return true; 
        else return false;
    }
    if (i == 3) { // Velocity
        if (D.prest_upgr_values[3] >= 2) return true; 
        else return false;
    }
    if (i == 4) { // Magic Orb
        if (D.prest_upgr_values[4] >= 50) return true; 
        else return false;
    }
}; check_prest_max();

prest_btns[1].onclick = ()=>{ // recycle
    upgr_prest_thing(0, 1, 1.25);
}
prest_btns[2].onclick = ()=>{ // shotgun %
    upgr_prest_thing(1, 1, 1.1);
}
prest_btns[3].onclick = ()=>{ // shotgun #
    upgr_prest_thing(2, 1, 1.2);
}
prest_btns[4].onclick = ()=>{ // velocity
    upgr_prest_thing(3, 0.2, 1.5);
}
//#endregion


D.$do_init = false; 

// console.log(D.$init);