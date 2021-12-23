class Orb_Ent {
    constructor(index, drag=0.98, vect={x:1,y:1}, orb=new Orb(), cull=false) {
        this.cull = cull;
        // if (!cull) total_drawn++;
        this.index = index;
        this.pos = {x:45,y:45};
        this.vect = vect;
        this.vect.add_force = function(x,y){
            this.x += x;
            this.y += y;
        };
        this.vect.step = ()=>{
            for (let i = 0; i < steps; i++) {
                this.vect.x *= drag;
                this.vect.y *= drag;
                
                this.pos.x += this.vect.x;
                this.pos.y += this.vect.y;
            }
        }
        this.orb = orb;
    }
    update() {
        // if (!this.cull) draw_circ2(this.pos, 10, this.orb.color, true);
        if (!this.cull && D.draw_setting == 0) draw_polygon(this.pos.x, this.pos.y, 7, 10, this.orb.color);
        else if (!this.cull && D.draw_setting == 1) draw.rect(this.pos.x-10, this.pos.y-10, 20, 20, { fill: true, fillStyle: this.orb.color });
        else if (!this.cull && D.draw_setting == 2) draw.rect(Math.floor((this.pos.x-10)/20)*20, Math.floor((this.pos.y-10)/20)*20, 20, 20, { fill: true, fillStyle: this.orb.color });
        else if (!this.cull && D.draw_setting == 3) draw.rect(this.pos.x-10, this.pos.y-10, 3, 3, { fill: true, fillStyle: this.orb.color });
        

        //#region [> Collecter & Repulser <]
        const dist_rep = distance2(this.pos, repulse1);
        if (dist_rep <= repulse1.size+5) { // Hit repulser
            const velocity = distance(this.pos.x, this.pos.y, this.pos.x + this.vect.x, this.pos.y + this.vect.y);
            const normal = get_angle(repulse1, this.pos, dist_rep) + Math.PI*2;
            //line_from_angle(this.pos, normal, 100, "aqua");
            const vector = get_angle(this.pos, {x: this.pos.x + this.vect.x, y: this.pos.y + this.vect.y})+Math.PI;
            // const tangent = normal+Math.PI/2;

            let bounce = 0;
            const diff = Math.max(normal, vector) - Math.min(normal, vector);
            if (normal > vector) bounce = normal + diff;
            else bounce = normal - diff;
            
            this.pos.x = repulse1.x + Math.cos(normal)*(repulse1.size+5);
            this.pos.y = repulse1.y + Math.sin(normal)*(repulse1.size+5);

            if (velocity <= 10) {
                this.vect.add_force( Math.cos(normal)*15, Math.sin(normal)*15 )
                this.vect.step(true, false); return;
            } 
            this.vect.x = 0; this.vect.y = 0;

            this.vect.add_force(
                Math.cos(bounce) * ((velocity > 10)? velocity : 10),
                Math.sin(bounce) * ((velocity > 10)? velocity : 10),
            );
            this.vect.step(true, false); return;
        }

        const dist1 = (!this._destroy)? distance2(this.pos, collect1) : Infinity;
        if (dist1 <= 70) {
            add_cache(this.orb.value*this.orb.weight);
            this._destroy = true;
        }
        const dist2 = (!this._destroy)? distance2(this.pos, collect2) : Infinity;
        if (dist2 <= 70) {
            add_cache(this.orb.value*this.orb.weight*2);
            this._destroy = true;
        }
        const dist3 = (!this._destroy)? distance2(this.pos, collect3) : Infinity;
        if (dist3 <= 70) {
            add_cache(this.orb.value*this.orb.weight*5);
            this._destroy = true;
        }

        if (this._destroy) {
            const res = perc_chance(D.prest_upgr_values[0]);
            if (!this.cull) total_drawn--;
            for (let i = 0; i < res.over; i++) emit_orb();
            if (res.rand) emit_orb();
            return;
        } else {
            const pull1 = collecter_pull(this, collect1);
            const pull2 = collecter_pull(this, collect2);
            const pull3 = collecter_pull(this, collect3);

            this.vect.x += pull1.x + pull2.x + pull3.x; 
            this.vect.y += pull1.y + pull2.y + pull3.y;
        }
        //#endregion

        //#region [> Hit Wall <]
        const sx = this.pos.x;
        const sy = this.pos.y;
        if (sx <= 5) {
            this.vect.x *= (this.vect.x > 50)? -0.3 : -0.9;
            this.pos.x = 8;
        }
        if (sy <= 5) {
            this.vect.y *= (this.vect.y > 50)? -0.3 : -0.9;
            this.pos.y = 8;
        }
        if (sx >= canvas.width-8) {
            this.vect.x *= (this.vect.x > 50)? -0.3 : -0.9;
            this.pos.x = canvas.width-8;
        }
        if (sy >= canvas.height-5) {
            this.vect.y *= (this.vect.y > 50)? -0.3 : -0.9;
            this.pos.y = canvas.height-8;
        }
        //#endregion

        this.vect.step(true, false);
    }
}

const entity_cap = 5000;
const steps = 2;

let cash_cache = 0;
const add_cache = (num, flush=false)=>{
    if (flush) {
        D.cash += cash_cache;
        cash_cache = 0;
        return;
    }
    if (entities.length < 200) {
        D.cash += num; 
        return;
    }
    cash_cache += num;
    if (cash_cache > D.cash /10) {
        D.cash += cash_cache;
        cash_cache = 0;
    }
}

const collect1 = { x: 75, y: canvas.height-75, G: 50000, color: "grey" };
const collect2 = { x: canvas.width-75, y: 75, G: 40000, color: "green" };
const collect3 = { x: canvas.width-75, y: canvas.height-75, G: 30000, color: "gold" };

const repulse1 = { x: canvas.width/2, y: canvas.height/2, size: Math.round(canvas.height/6)-5 };

const collecter_pull = (self, col)=>{
    const dist = distance2(self.pos, col); // hyp
    //const angle = get_angle(self.pos, col);
    const dx = col.x - self.pos.x;
    const dy = col.y - self.pos.y;
    const check = F_acos(dx / dist);
    const angle = (dy < 0)? check*-1 : check;
    //line_from_angle(self.pos, angle, 100, col.color);
    
    const vx = col.G*(Math.cos(angle)/(dist * dist));
    const vy = col.G*(Math.sin(angle)/(dist * dist));

    return {x: vx, y: vy};
}

const rand_orb = (list=[new Orb()])=>{
        let max = 0;
        for (let i = 0; i < list.length; i++) max += list[i].weight;

        let rand = Math.ceil(Math.random()*max);

        let total = 0;
        for (let i = 0; i < list.length; i++) {
            const w = list[i].weight;
            total += w;
            if (rand <= total) return list[i];
        }
}

const perc_chance = (perc=0)=>{
    const over = Math.floor(perc/100);
    const mod = perc%100;
    const rand = Math.ceil(Math.random()*100);
    return {over: over, rand: (rand <= mod)};
}

const emit_orb = function(pass_cap=false) {
    const orb = rand_orb(D.orbs);
    if (entities.length >= entity_cap && !pass_cap) {
        add_cache(orb.value*orb.weight);
        return;
    }

    const angle = Math.floor(Math.random()*140)/100;
    // const angle = get_angle({x: 0, y: 0}, mouse.pos);
    const vel = ((Math.random()*5 + 5)*(1+D.prest_upgr_values[3]));
    const ox = Math.cos(angle)*vel;
    const oy = Math.sin(angle)*vel;

    const cull_draw = (total_drawn < max_drawn)? false : true;

    if (!cull_draw) total_drawn++;

    entities.push(new Orb_Ent(entities.length, 0.98, {x: ox, y: oy}, orb, cull_draw));
    // entities.push(new Orb_Ent(entities.length, 0.98, {x: ox, y: oy}, orb, do_cull()));
}; 
$("#canvas").onclick = (e)=> {
    if (!clicked) clicked = true;
    const now = Date.now();
    if (now-last_click < 150) return;
    last_click = now;

    const res = perc_chance(D.prest_upgr_values[1]);
    if (res.over > 0) {
        for (let i = 0; i < res.over; i++) 
            for (let i = 0; i < D.prest_upgr_values[2]; i++) emit_orb(e);
    }
    if (res.rand) {
        for (let i = 0; i < D.prest_upgr_values[2]; i++) emit_orb(e);
    } else {
        emit_orb(e);
    }
}

const loop_emit = (amount)=>{
    for (let i = 0; i < amount; i++) emit_orb(true);
}

const count_drawn = ()=>{ 
    let totalc = 0;
     for (let i = 0; i < entities.length; i++) {
         const cull = entities[i].cull;
         if (cull == false) totalc++;
    }
    return totalc;
}

