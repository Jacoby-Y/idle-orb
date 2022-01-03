in_prest = false;
D.settings = {
    cash: {display(v){ return format_num(v, 1)}, round: 1, do_w: false},
    mana: {display(v){ return format_num(v, 1)}, round: 1},
    prest_cost: {display(v){ return format_num(v, 1)}, round: 1},
    calc_mana: {display(v){ return format_num(v, 1)}, round: 1},
    idle_orb_sec: {display(v){ return format_num(v, 1)}, round: 1},
    idle_orb_cost: {display(v){ return format_num(v, 1)}, round: 1},
    burst_fire_amount_cost: {display(v){ return format_num(v, 1)}, round: 1},
    burst_fire_perc_cost: {display(v){ return format_num(v, 1)}, round: 1},
};


const calc_mana = ()=>{
    D.calc_mana = Math.round(D.cash / 5000);
    return D.calc_mana;
}

D.debug = [0, 0, 0, 0];

D.$load = true;
D.time_save = Math.round(Date.now()/1000);
D.mana = 0;
D.calc_mana = 0; 
D.prest_cost = 25000; // 25k
D.prest_upgr_costs = [5, 5, 25, 10, 10];
D.prest_upgr_values = [0, 0, 2, 0, 0];

D.draw_setting = 0;

D.$init = {};
D.$do_init = true;
D.cash = 0;

D.ent_len = 0;


//#region [> Orb Stuff <]
//* Clicking
class Orb {
    constructor(color, weight, value, up_cost) {
        this.color = color;
        this.weight = weight;
        this.value = value;
        this.up_cost = up_cost;
    }
}

/** @typedef {{ x: number; y: number }} Vector */
const orb_ents = {
    length: 0,
    /** @type Boolean[] */
    cull: [], 
    /** @type Vector[] */
    pos: [],
    /** @type Vector[] */
    vect: [],
    /** @type Orb[] */
    orb: [],
    /** @type Boolean[] */
    destroy: [],
    /** @type Boolean[] */
    magic: [],

    update(i) {
        // if (this.destroy[i]) { this.clear(); return; }

        if (!this.cull[i] && D.draw_setting == 0) draw_polygon(this.pos[i].x, this.pos[i].y, 7, 10, this.orb[i].color);
        else if (!this.cull[i] && D.draw_setting == 1) draw.rect(this.pos[i].x-10, this.pos[i].y-10, 20, 20, { fill: true, fillStyle: this.orb[i].color });
        else if (!this.cull[i] && D.draw_setting == 2) draw.rect(Math.floor((this.pos[i].x-10)/20)*20, Math.floor((this.pos[i].y-10)/20)*20, 20, 20, { fill: true, fillStyle: (this.orb[i].color+"aa") });
        else if (!this.cull[i] && D.draw_setting == 3) draw.rect(this.pos[i].x-10, this.pos[i].y-10, 3, 3, { fill: true, fillStyle: this.orb[i].color });
       
        //#region [> Collecter & Repulser <]
        const dist_rep = distance2(this.pos[i], repulse1);
        if (dist_rep <= repulse1.size+5) { // Hit repulser
            const velocity = distance(this.pos[i].x, this.pos[i].y, this.pos[i].x + this.vect[i].x, this.pos[i].y + this.vect[i].y);
            const normal = get_angle(repulse1, this.pos[i]);
            // const normal = get_angle(repulse1, this.pos[i], dist_rep) + Math.PI*2;
            //line_from_angle(this.pos[i], normal, 100, "aqua");
            const vector = get_angle(this.pos[i], {x: this.pos[i].x + this.vect[i].x, y: this.pos[i].y + this.vect[i].y})+Math.PI;
            // const tangent = normal+Math.PI/2;

            let bounce = 0;
            const diff = Math.max(normal, vector) - Math.min(normal, vector);
            if (normal > vector) bounce = normal + diff;
            else bounce = normal - diff;
            
            const set_x = repulse1.x + Math.cos(normal)*(repulse1.size+5);
            const set_y = repulse1.y + Math.sin(normal)*(repulse1.size+5);

            this.pos[i].x = set_x;
            this.pos[i].y = set_y;


            if (velocity <= 10) {
                this.add_force(i, Math.cos(normal)*15, Math.sin(normal)*15 )
                this.step_force(i); return;
            } 
            this.vect[i].x = 0; this.vect[i].y = 0;

            this.add_force(i, 
                Math.cos(bounce) * ((velocity > 10)? velocity : 10),
                Math.sin(bounce) * ((velocity > 10)? velocity : 10)
            );
            this.step_force(i); return;
        }
        
        const dist1 = (!this.destroy[i])? distance2(this.pos[i], collect1) : Infinity;
        if (dist1 <= 70) {
            add_cache((this.magic[i])? D.cash * 0.1 : this.orb[i].value*this.orb[i].weight);
            this.destroy[i] = true;
        }
        const dist2 = (!this.destroy[i])? distance2(this.pos[i], collect2) : Infinity;
        if (dist2 <= 70) {
            add_cache((this.magic[i])? D.cash * 0.1 : this.orb[i].value*this.orb[i].weight*2);
            this.destroy[i] = true;
        }
        const dist3 = (!this.destroy[i])? distance2(this.pos[i], collect3) : Infinity;
        if (dist3 <= 70) {
            add_cache((this.magic[i])? D.cash * 0.1 : this.orb[i].value*this.orb[i].weight*5);
            this.destroy[i] = true;
        }
        
        if (this.destroy[i]) {
            const res = perc_chance(D.prest_upgr_values[0]);
            if (!this.cull[i]) total_drawn--;
            for (let i = 0; i < res.over; i++) emit_orb();
            if (res.rand) emit_orb();
            return;
        } else {
            const pull1 = collecter_pull(this.pos[i], collect1);
            const pull2 = collecter_pull(this.pos[i], collect2);
            const pull3 = collecter_pull(this.pos[i], collect3);

            this.vect[i].x += pull1.x + pull2.x + pull3.x; 
            this.vect[i].y += pull1.y + pull2.y + pull3.y;
        }
        //#endregion
        
        //#region [> Hit Wall <]
        const sx = this.pos[i].x;
        const sy = this.pos[i].y;
        if (sx <= 5) {
            this.vect[i].x *= (this.vect[i].x > 50)? -0.3 : -0.9;
            this.pos[i].x = 8;
        }
        if (sy <= 5) {
            this.vect[i].y *= (this.vect[i].y > 50)? -0.3 : -0.9;
            this.pos[i].y = 8;
        }
        if (sx >= canvas.width-8) {
            this.vect[i].x *= (this.vect[i].x > 50)? -0.3 : -0.9;
            this.pos[i].x = canvas.width-8;
        }
        if (sy >= canvas.height-5) {
            this.vect[i].y *= (this.vect[i].y > 50)? -0.3 : -0.9;
            this.pos[i].y = canvas.height-8;
        }
        //#endregion

        this.step_force(i); return;
    },
    step_force(i) {
        this.vect[i].x *= 0.98;
        this.vect[i].y *= 0.98;
        this.pos[i].x += this.vect[i].x;
        this.pos[i].y += this.vect[i].y;
    },
    add_force(i, x, y) {
        this.vect[i].x += x;
        this.vect[i].y += y;
    },

    new(cull, vect, orb, magic) {
        this.cull.push(cull);
        this.pos.push({ x: 45, y: 45 });
        this.vect.push(vect);
        this.orb.push(orb);
        this.magic.push(magic);
        this.destroy.push(false);
        this.length++;
    },
    clear() {
        for (let i = this.length-1; i >= 0; i--) {
            const d = this.destroy[i];
            if (!d) continue;
            this.cull.splice(i, 1);
            this.pos.splice(i, 1);
            this.vect.splice(i, 1);
            this.orb.splice(i, 1);
            this.magic.splice(i, 1);
            this.destroy.splice(i, 1);
            this.length--;
        }
    },
    objectify(i) {
        return {
            cull: this.cull[i],
            pos: this.pos[i],
            vect: this.vect[i],
            orb: this.orb[i],
            magic: this.magic[i],
            destroy: this.destroy[i],
        };
    },
    update_all() {
        for (let i = 0; i < this.length; i++) {
            this.update(i);
        }
    },
}

const orb_colors = ["#aaaaaa", "#00ee33", "#9999ff", "#dd55dd", "#ff722b", "#ffc23d"];
D.orbs = [
    // (    color,         weight,   value,   upgrade cost,   per upgrade value)
    new Orb(orb_colors[0], 1,        0.1,     5),
    new Orb(orb_colors[1], 0,        1,       50),
    new Orb(orb_colors[2], 0,        5,       500),
    new Orb(orb_colors[3], 0,        50,      50000),
    new Orb(orb_colors[4], 0,        500,     500000),
    new Orb(orb_colors[5], 0,        5000,    5000000),
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


const F_acos = (x) => { return (-0.698 * x * x - 0.872) * x + 1.570; };