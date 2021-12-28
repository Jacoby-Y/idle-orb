in_prest = false;
D.settings = {
    cash: {display(v){ if (in_prest) { calc_mana(); } return format_num(v, 1)}, round: 1, do_w: false},
    mana: {display(v){ if (in_prest) { calc_mana(); } return format_num(v, 1)}, round: 1},
    prest_cost: {display(v){ return format_num(v, 1)}, round: 1},
    calc_mana: {display(v){ return format_num(v, 1)}, round: 1},
    idle_orb_sec: {display(v){ return format_num(v, 1)}, round: 1},
    idle_orb_cost: {display(v){ return format_num(v, 1)}, round: 1},
    burst_fire_amount_cost: {display(v){ return format_num(v, 1)}, round: 1},
    burst_fire_perc_cost: {display(v){ return format_num(v, 1)}, round: 1},
};


const calc_mana = ()=>{
    D.calc_mana = Math.round(D.cash / 10000);
    return D.calc_mana;
}

D.debug = [0, 0, 0, 0];

D.$load = true;
D.time_save = Math.round(Date.now()/1000);
D.mana = 0;
D.calc_mana = 0; 
D.prest_cost = 100000; // 100k
D.prest_upgr_costs = [5, 5, 25, 10, 10];
D.prest_upgr_values = [0, 0, 2, 0, 0];

D.draw_setting = 0;

D.$init = {};
D.$do_init = true;
D.cash = 0;

D.ent_len = entities.length;


//#region [> Orb Stuff <]
//* Clicking
class Orb {
    constructor(color, weight, value, up_cost, per_upgr) {
        this.color = color;
        this.weight = weight;
        this.value = value;
        this.up_cost = up_cost;
        this.per_upgr = per_upgr;
    }
}

const orb_colors = ["#aaaaaa", "#00ee33", "#9999ff", "#dd55dd", "#ff722b", "#ffc23d"];
D.orbs = [
    // (    color,         weight,   value,   upgrade cost,   per upgrade value)
    new Orb(orb_colors[0], 1,        0.1,     5,              0.1),
    new Orb(orb_colors[1], 0,        1,       50,             1),
    new Orb(orb_colors[2], 0,        5,       500,            5),
    new Orb(orb_colors[3], 0,        50,      40000,          50),
    new Orb(orb_colors[4], 0,        500,     100000,         500),
    new Orb(orb_colors[5], 0,        5000,    1000000,        5000),
];


//* Idle
D.idle_orb_sec = 0;
D.idle_orb_cost = 50;
D.burst_fire_amount = 3;
D.burst_fire_amount_cost = 50;
D.burst_fire_perc = 0;
D.burst_fire_perc_cost = 50;
//#endregion

window.onbeforeunload = ()=> {
    D.time_save = Math.round(Date.now()/1000);
    local.store();
}


// (function() {
    
// })();


const F_acos = (x) => { return (-0.698 * x * x - 0.872) * x + 1.570; }