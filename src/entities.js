let run_main = true;
const main_func = ()=>{
    if (run_main == false && entities.length <= 0) return;
    if (run_main == false && entities.length > 0) run_main = true;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0,0, canvas.width, canvas.height);

    update_entities();
    run_update_functions();
    // event_manager.step_jobs();
    // run_mouse_listeners();

    if (run_main == true && entities.length <= 0) run_main = false;
}

class Orb_Ent {
    constructor(index, drag=0.98, vect={x:1,y:1}, orb=new Orb(), cull=false) {
        this.cull = cull;
        if (!cull) total_drawn++;
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
        // if (!this.cull) draw.rect(this.pos.x-10, this.pos.y-10, 20, 20, { fill: true, fillStyle: this.orb.color });
        if (!this.cull) draw_polygon(this.pos.x, this.pos.y, 10, 10, this.orb.color);

        const dist_rep = distance2(this.pos, repulse1);
        if (dist_rep <= repulse1.size) { // Hit repulser
            const velocity = distance(this.pos.x, this.pos.y, this.pos.x + this.vect.x, this.pos.y + this.vect.y);
            const normal = get_angle(repulse1, this.pos) + Math.PI*2;
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
        if (dist1 <= 50) {
            add_cache(this.orb.value*this.orb.total);
            this._destroy = true;
        }
        const dist2 = (!this._destroy)? distance2(this.pos, collect2) : Infinity;
        if (dist2 <= 50) {
            add_cache(this.orb.value*this.orb.total*2);
            this._destroy = true;
        }
        const dist3 = (!this._destroy)? distance2(this.pos, collect3) : Infinity;
        if (dist3 <= 50) {
            add_cache(this.orb.value*this.orb.total*5);
            this._destroy = true;
        }

        if (this._destroy) {
            const res = perc_chance(D.prest_upgr_values[0]);
            for (let i = 0; i < res.over; i++) emit_orb();
            if (res.rand) emit_orb();
            if (!this.cull) total_drawn--;
            return;
        } else {
            const pull1 = collecter_pull(this, collect1);
            const pull2 = collecter_pull(this, collect2);
            const pull3 = collecter_pull(this, collect3);

            this.vect.x += pull1.x + pull2.x + pull3.x; 
            this.vect.y += pull1.y + pull2.y + pull3.y;
        }


        const sx = this.pos.x;
        const sy = this.pos.y;
        if (sx <= 0) {
            this.vect.x *= (this.vect.x > 50)? -0.3 : -0.9;
            this.pos.x = 1;
        }
        if (sy <= 0) {
            this.vect.y *= (this.vect.y > 50)? -0.3 : -0.9;
            this.pos.y = 1;
        }
        if (sx >= canvas.width) {
            this.vect.x *= (this.vect.x > 50)? -0.3 : -0.9;
            this.pos.x = canvas.width-1;
        }
        if (sy >= canvas.height) {
            this.vect.y *= (this.vect.y > 50)? -0.3 : -0.9;
            this.pos.y = canvas.height-1;
        }

        this.vect.step(true, false);
    }
}

// entities.push(new Orb_Ent(entities.length, 1, {x:10, y:5}, D.orbs[0]));

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

const collect1 = { x: 75, y: canvas.height-75, G: 50000 };
const collect2 = { x: canvas.width-75, y: 75, G: 40000 };
const collect3 = { x: canvas.width-75, y: canvas.height-75, G: 30000 };

const repulse1 = { x: canvas.width/2, y: canvas.height/2, size: 110 };

let clicked = false;
let last_click = 0;

const collecter_pull = (self, col)=>{
    const dist = distance2(self.pos, col); // hyp
    const angle = get_angle(self.pos, col);

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
const emit_orb = function(pass_cap=false) { // D.
    const orb = rand_orb(D.orbs);
    if (entities.length >= entity_cap && !pass_cap) {
        add_cache(orb.value*orb.total);
        return;
    }

    const angle = Math.floor(Math.random()*140)/100;
    // const angle = get_angle({x: 0, y: 0}, mouse.pos);
    const vel = (Math.random() * 5+10*(1+D.prest_upgr_values[3]));
    const ox = Math.cos(angle)*vel;
    const oy = Math.sin(angle)*vel;

    entities.push(new Orb_Ent(entities.length, 0.98, {x: ox, y: oy}, orb, do_cull()));
}; $("#canvas").onclick = (e)=> {
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

update.push(()=>{ // Draw spawner
    ctx.beginPath();
    ctx.fillStyle = "black"; // Green fill
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 30);
    ctx.lineTo(10, 30);
    ctx.lineTo(30, 50);

    ctx.lineTo(30, 60);
    ctx.lineTo(60, 30);

    ctx.lineTo(50, 30);
    ctx.lineTo(30, 10);
    ctx.lineTo(30, 0);
    ctx.closePath();
    ctx.fill();

    // ctx.moveTo(0, 0);
    // ctx.lineTo(0, 75);
    // ctx.lineTo(75, 0);
});

update.push(()=>{ // Draw collecters and repulsers
    draw_circ(collect1.x, collect1.y, 30, "grey", true);
    draw_circ(collect2.x, collect2.y, 30, "#008800", true);
    draw_circ(collect3.x, collect3.y, 30, "#bbbb00", true);

    draw_circ(repulse1.x, repulse1.y, 100, "lime", true);
    draw_circ(repulse1.x, repulse1.y, 95, "black", true);
    
    draw_text(collect1.x, collect1.y+8, `x1`, "30px arial", "black", "center");
    draw_text(collect2.x, collect2.y+8, `x2`, "30px arial", "white", "center");
    draw_text(collect3.x, collect3.y+8, `x5`, "30px arial", "black", "center");


    // line_from_angle({x: 100, y: 100}, Math.acos(4/5), 100, "aqua");
});
update.push(()=>{
    if (clicked) return;
    draw_text(canvas.width/2-10, canvas.height/4-10, `Click Here!`, "30px arial", "black", "center");
});
update.push(()=>{
    // for (let i = 0; i < entities.length; i++) {
    //     const pos = entities[i].pos;
    //     draw_circ2(pos, 10, "grey", true);
    // }
});

const idle_run = ()=>{
    setTimeout(() => {
        if (Math.random()*100 <= D.burst_fire_perc) for (let i = 0; i < D.burst_fire_amount; i++) emit_orb();
        else emit_orb();
        idle_run();
    }, 1000/D.idle_orb_sec);
}; if (D.idle_orb_sec > 0) idle_run();

const cons = $("#console");
const cons_input = $all("#console h3")[0];
const cons_output = $all("#console h3")[1];

let cons_open = false;
let showing_out = false;

let last_log = "";

document.onkeydown = (e)=>{
    const k = e.key;
    // console.log(e);
    if (k == "~") {
        cons_open = !cons_open;
        cons.style.display = (cons_open)? "block" : "none";
        return;
    }
    if (cons_open) {
        if (k == "ArrowUp") {
            cons_input.innerText = `> ${last_log}`;
        } else if (k == "ArrowDown") {
            cons_input.innerText = "> ";
        }
        if (k == "Enter") {
            last_log = cons_input.innerText.slice(1);
            cons_output.innerText = `: ${eval(last_log)}`;
            cons_input.innerText = "> ";
            showing_out = true;
            return;
        } if (k == "Backspace") {
            if (cons_input.innerText.length <= 1) return;
            cons_input.innerText = cons_input.innerText.slice(0, -1);
            return;
        }
        if (k.length > 1) return;
        if (showing_out) {
            cons_input.innerText = "> ";
            cons_output.innerText = ": ";
            showing_out = false;
        }
        cons_input.innerText += (k == " ")? "\xa0" : k;
        return;
    }

    if (k == " ") pause = !pause;
    else if (k == "s") step = true;
    else if (k == "1") tabs[0].onclick();
    else if (k == "2") tabs[1].onclick();
    else if (k == "3") tabs[2].onclick();
    else if (k == "R") local.clear_storage();
    else if (k == "l") loop_emit(max_drawn);
    else if (k == ";") loop_emit(1000);
    else if (k == "'") loop_emit(10000);
}

// D.frame = 0;
let worst_frame = 0;
let pause = false;
let step = false;
let m_secs = 1000;
const main_loop = setInterval(() => {
    const now = Date.now();
    if (pause && !step) return;
    if (step) step = false;
    try {
        main_func();
    } catch (error) {
        console.log(error);
        pause=true;
    }
    worst_frame = Math.max(Date.now()-now, worst_frame);

    if (m_secs >= 1000) {
        add_cache(0, true);
        m_secs = 0;
    } else m_secs += 1000/60;
}, 1000/50);

setInterval(()=>{
    D.ent_len = entities.length.toString() + " | " + worst_frame + " | " + ((pause)? "T" : "F");
}, 250);