// importScripts("/src/game_mono_lib.js", "/src/entities.js");

// let window = self;

const distance = (x1, y1, x2, y2)=>{
    const dx = x2-x1;
    const dy = y2-y1;
    return Math.sqrt(dx*dx + dy*dy);
}
const distance2 = (p1, p2)=>{
    const dx = p2.x-p1.x;
    const dy = p2.y-p1.y;
    return Math.sqrt(dx*dx + dy*dy);
}
const get_angle = (p1, p2, relative=false)=>{
    const d = difference(p1, p2, relative);
    return Math.atan2(d.y, d.x);
}
const difference = (p1, p2, relative=false)=>{
    let offset_x = 0;
    let offset_y = 0;
    if (relative) {
        offset_x = camera.pos.x;
        offset_y = camera.pos.y;
    }
    
    const dx = (p2.x+offset_x)-(p1.x+offset_x);
    const dy = (p2.y+offset_y)-(p1.y+offset_y);
    return {
        x: dx,
        y: dy
    }
}
const collecter_pull = (pos, vect, col)=>{
    const dist1 = distance2(pos, col);
    const angle1 = get_angle(pos, col);
    const vx = col.G*(Math.cos(angle1)/(dist1 * dist1));
    const vy = col.G*(Math.sin(angle1)/(dist1 * dist1));

    vect.x += vx;
    vect.y += vy;

    return distance2(pos, col);
}



self.onmessage = function(e) {
    const pos = e.data.pos;
    const vect = e.data.vect;
    let _destroy = false;
    let cash = 0;

    const collect1 = { x: 75, y: e.data.canvas.height-75, G: 50000 };
    const collect2 = { x: e.data.canvas.width-75, y: 75, G: 40000 };
    const collect3 = { x: e.data.canvas.width-75, y: e.data.canvas.height-75, G: 30000 };

    const repulse1 = { x: e.data.canvas.width/2, y: e.data.canvas.height/2, size: 110 };

    const dist_rep = distance2(pos, repulse1);
    if (dist_rep <= repulse1.size) { // Hit repulser
        const velocity = distance(pos.x, pos.y, pos.x + vect.x, pos.y + vect.y);
        const normal = get_angle(repulse1, pos) + Math.PI*2;
        const vector = get_angle(pos, {x: pos.x + vect.x, y: pos.y + vect.y})+Math.PI;
        // const tangent = normal+Math.PI/2;

        let bounce = 0;
        const diff = Math.max(normal, vector) - Math.min(normal, vector);
        if (normal > vector) bounce = normal + diff;
        else bounce = normal - diff;
        
        pos.x = repulse1.x + Math.cos(normal)*repulse1.size;
        pos.y = repulse1.y + Math.sin(normal)*repulse1.size;

        vect.x += Math.cos(bounce) * ((velocity > 10)? velocity*1.2 : 10);
        vect.y += Math.sin(bounce) * ((velocity > 10)? velocity*1.2 : 10);
        
        pos.x += vect.x; pos.y += vect.y;

        self.postMessage({pos: pos, vect: vect, _destroy: _destroy, cash: cash})
        self.close();
    }

    const dist1 = (!_destroy)? collecter_pull(pos, vect, collect1) : Infinity;
    if (dist1 <= 50) {
        D.cash += orb.value*orb.total;
        _destroy = true;
    }
    const dist2 = (!_destroy)? collecter_pull(pos, vect, collect2) : Infinity;
    if (dist2 <= 50) {
        D.cash += orb.value*orb.total*2;
        _destroy = true;
    }
    const dist3 = (!_destroy)? collecter_pull(pos, vect, collect3) : Infinity;
    if (dist3 <= 50) {
        D.cash += orb.value*orb.total*5;
        _destroy = true;
    }

    if (_destroy) {
        // const res = perc_chance(D.prest_upgr_values[0]);
        // for (let i = 0; i < res.over; i++) emit_orb();
        // if (res.rand) emit_orb();
        
        self.postMessage({pos: pos, vect: vect, _destroy: _destroy, cash: cash})
        self.close();
    }

    const sx = pos.x;
    const sy = pos.y;
    if (sx <= 0) {
        vect.x *= (vect.x > 50)? -0.3 : -0.9;
        pos.x = 1;
    }
    if (sy <= 0) {
        vect.y *= (vect.y > 50)? -0.3 : -0.9;
        pos.y = 1;
    }
    if (sx >= e.data.canvas.width) {
        vect.x *= (vect.x > 50)? -0.3 : -0.9;
        pos.x = e.data.canvas.width-1;
    }
    if (sy >= e.data.canvas.height) {
        vect.y *= (vect.y > 50)? -0.3 : -0.9;
        pos.y = e.data.canvas.height-1;
    }

    pos.x += vect.x; pos.y += vect.y;

    self.postMessage({i: e.data.i, pos: pos, vect: vect, _destroy: _destroy, cash: cash})
    self.close();
};