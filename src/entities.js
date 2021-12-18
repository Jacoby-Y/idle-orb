const main_func = ()=>{
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0,0, canvas.width, canvas.height);

    update_entities();
    run_update_functions();
    event_manager.step_jobs();
    run_mouse_listeners();
}

const entity_cap = 200;

const collect1 = { x: 75, y: canvas.height-75, G: 50000 };
const collect2 = { x: canvas.width-75, y: 75, G: 40000 };
const collect3 = { x: canvas.width-75, y: canvas.height-75, G: 30000 };

const repulse1_pos = { x: canvas.width/2, y: canvas.height/2 };

let clicked = false;
let last_click = 0;

const collecter_pull = (self, col)=>{
    const dist1 = distance2(self.vector, col);
    const angle1 = get_angle(self.vector, col);
    const vx = col.G*(Math.cos(angle1)/(dist1 * dist1));
    const vy = col.G*(Math.sin(angle1)/(dist1 * dist1));

    self.physics.add_force(vx, vy);

    return distance2(self.vector, col);
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
const emit_orb = function(e) {
    if (entities.length > entity_cap) return;

    const orb = rand_orb(D.orbs);

    const part = new Entity()
    .bind(new Vector2(40, 40))
    .bind(new Transform(0, 1,1))
    .bind(new Graphic((self)=>{ draw_circ(0, 0, 10, orb.color, true); }))
    .bind({ orb: orb, tag: "orb",
        update(self) {
            self.graphic.draw(self);

            const dist_rep = distance2(self.vector, repulse1_pos);
            const repulse_size = 115;
            if (dist_rep <= repulse_size) { // Hit repulser
                const angle_to = get_angle(self.vector, repulse1_pos); 
                const angle_vect = get_angle(self.vector, { x: self.vector.x + self.physics.vx, y: self.vector.y + self.physics.vy });
                const angle_away = angle_to + Math.PI;
                const angle_bounce = angle_away+(angle_to - angle_vect);
                const velocity = distance(self.vector.x, self.vector.y, self.vector.x + self.physics.vx, self.vector.y + self.physics.vy);
                self.vector.x = repulse1_pos.x + Math.cos(angle_away)*repulse_size;
                self.vector.y = repulse1_pos.y + Math.sin(angle_away)*repulse_size;

                self.physics.add_force(
                    Math.cos(angle_bounce) * (velocity*2),
                    Math.sin(angle_bounce) * (velocity*2),
                );
                self.physics.vx *= 0.9;
                self.physics.vy *= 0.9;
                self.physics.step(true, false);
                return;
            }

            const dist1 = collecter_pull(self, collect1);
            if (dist1 <= 50) {
                D.cash += self.orb.value*self.orb.total;
                self._destroy = true;
            }
            const dist2 = collecter_pull(self, collect2);
            if (dist2 <= 50) {
                D.cash += self.orb.value*self.orb.total*2;
                self._destroy = true;
            }
            const dist3 = collecter_pull(self, collect3);
            if (dist3 <= 50) {
                D.cash += self.orb.value*self.orb.total*5;
                self._destroy = true;
            }

            if (self._destroy) {
                const res = perc_chance(D.prest_upgr_values[0]);
                for (let i = 0; i < res.over; i++) emit_orb();
                if (res.rand) emit_orb();
                return;
            }

            const sx = self.vector.x;
            const sy = self.vector.y;
            if (sx <= 0) {
                self.physics.vy *= (self.physics.vx > 50)? -0.3 : -0.9;
                self.physics.vx *= -0.9;
                self.vector.x = 1;
            }
            if (sy <= 0) {
                self.physics.vy *= (self.physics.vy > 50)? -0.3 : -0.9;
                self.physics.vy *= -0.9;
                self.vector.y = 1;
            }
            if (sx >= canvas.width) {
                self.physics.vy *= (self.physics.vx > 50)? -0.3 : -0.9;
                self.physics.vx *= -0.9;
                self.vector.x = canvas.width-1;
            }
            if (sy >= canvas.height) {
                self.physics.vy *= (self.physics.vy > 50)? -0.3 : -0.9;
                self.vector.y = canvas.height-1;
            }

            self.physics.step(true, false);
        }
    });
    const vx = Math.ceil(Math.random() * 20);
    const vy = Math.ceil(Math.random() * 15);


    const angle = Math.floor(Math.random()*140)/100;
    const vel = (Math.ceil(Math.random() * 5)+10*(1+D.prest_upgr_values[3]));
    const ox = Math.cos(angle)*vel;
    const oy = Math.sin(angle)*vel;

    part.bind(new Physics(ox, oy, 0, 0.98, part.vector));

    // console.log(part);
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
    for (let i = 0; i < amount; i++) emit_orb();
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

    draw_circ(repulse1_pos.x, repulse1_pos.y, 100, "lime", true);
    draw_circ(repulse1_pos.x, repulse1_pos.y, 95, "black", true);

    draw_text(collect1.x, collect1.y+8, `x1`, "30px arial", "black", "center");
    draw_text(collect2.x, collect2.y+8, `x2`, "30px arial", "white", "center");
    draw_text(collect3.x, collect3.y+8, `x5`, "30px arial", "black", "center");

    // draw_circ(repulse1_pos.x, repulse1_pos.y, 5, "pink", true);
});
update.push(()=>{
    if (clicked) return;
    draw_text(canvas.width/2-10, canvas.height/4-10, `Click Here!`, "30px arial", "black", "center");
});

let idle_ticks = 0;
update.push(()=>{
    if (D.idle_orb_sec <= 0) return;
    const floored = Math.floor(D.idle_orb_sec/33);
    const extra = D.idle_orb_sec % 33;

    for (let i = 0; i < floored; i++) emit_orb();

    const t = 33 / extra;
    idle_ticks++;
    if (idle_ticks >= t) {
        idle_ticks = 0;
        emit_orb();
    }
});

document.onkeyup = (e)=>{
    const k = e.key;
    if (k == " ") pause = !pause;
    else if (k == "s") step = true;
}

// D.frame = 0;
let pause = false;
let step = false;
const main_loop = setInterval(() => {
    // const now = Date.now();
    if (pause && !step) return;
    if (step) {
        step = false;
    }
    try {
        main_func();
    } catch (error) {
        console.log(error);
        pause=true;
    }
    // D.frame = Date.now()-now;
}, 1000/30);
