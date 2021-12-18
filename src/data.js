D.settings = {
    cash: {display(v){ calc_mana(); return format_num(v, 1)}, round: 1},
    prest_cost: {display(v){ return format_num(v, 1)}, round: 1},
};


const calc_mana = ()=>{
    D.calc_mana = Math.round(D.cash / 10000);
    return D.calc_mana;
}

D.mana = 0;
D.calc_mana = 0; 
D.prest_cost = 100000; // 100k
D.prest_upgr_costs = [5, 5, 25];

D.$init = {};
D.$do_init = true; // D.$load = true;
D.cash = 0;

//#region [> Orb Stuff <]
//* Clicking
const Orb = function (color, weight, value, up_cost, per_upgr, total=0) {
    this.color = color;
    this.weight = weight;
    this.value = value;
    this.up_cost = up_cost;
    this.per_upgr = per_upgr;
    this.total = total;
}

const orb_colors = ["#aaa", "#00ee33", "#9999ff", "#dd55dd", "#ff722b", "#ffc23d"];
D.orbs = [
    // (    color,         weight,   value,   upgrade cost,   per upgrade value)
    new Orb(orb_colors[0], 10,       0.1,     25,             0.1, 1),
    new Orb(orb_colors[1], 0,        0.5,     100,            0.5),
    new Orb(orb_colors[2], 0,        2,       500,            1),
    new Orb(orb_colors[3], 0,        10,      2500,           5),
    new Orb(orb_colors[4], 0,        50,      7500,           25),
    new Orb(orb_colors[5], 0,        250,     15000,          75),
];

//* Idle
D.idle_orb_sec = 0;
D.idle_orb_cost = 50;
//#endregion

window.onbeforeunload = ()=> local.store();