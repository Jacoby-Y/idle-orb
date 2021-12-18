//#region [> Functions <]
const graphics = {
    circ(obj, pos={ x: 0, y: 0 }, scale={ w: 10, h: 10 }, angles={ start: 0, end: Math.PI*2, clockwise: true }, style={ fill: true, fillStyle: "red", stroke: true, strokeStyle: "black", strokeWidth: 1}) { // { x: 100, y: 100 }, { w: 20, h: 20 }, { fill: true, }
        if (obj.vector == undefined || obj.transform == undefined) {
            console.warn("Object must have a vector and transform to draw!");
            return;
        }

        
        if (angles.clockwise == undefined) angles.clockwise = true;
        if (angles.start == undefined) angles.start = 0;
        if (angles.end == undefined) angles.end = Math.PI*2;
        

        ctx.beginPath();
        ctx.ellipse(
            (pos.x), (pos.y), 
            (obj.transform.scale_w + scale.w), (obj.transform.scale_h + scale.h), 
            obj.transform.rotation, angles.start, angles.end, !angles.clockwise);
        if (style.fill == true) {
            if (style.fillStyle == undefined) style.fillStyle = "red";
            ctx.fillStyle = style.fillStyle;
            ctx.fill();
        }
        if (style.stroke == true) {
            if (style.strokeStyle == undefined) style.strokeStyle = "black";
            if (style.strokeWidth == undefined) style.strokeWidth = 1;
            ctx.strokeStyle = style.strokeStyle;
            ctx.lineWidth = style.strokeWidth;
            ctx.stroke();
        }
    },
    rect(obj, pos={ x: 0, y: 0 }, scale={ w: 10, h: 10 }, style={ fill: true, fillStyle: "red", stroke: true, strokeStyle: "black", strokeWidth: 1}) {
        if (obj.vector == undefined || obj.transform == undefined) {
            console.warn("Object must have a vector and transform to draw!");
            return;
        }

        ctx.beginPath();
        ctx.strokeRect(
            (pos.x), (pos.y), 
            (obj.transform.scale_w + scale.w), (obj.transform.scale_h + scale.h));
        if (style.fill == true) {
            if (style.fillStyle == undefined) style.fillStyle = "red";
            ctx.fillStyle = style.fillStyle;
            ctx.fill();
        }
        if (style.stroke == true) {
            if (style.strokeStyle == undefined) style.strokeStyle = "black";
            if (style.strokeWidth == undefined) style.strokeWidth = 1;
            ctx.strokeStyle = style.strokeStyle;
            ctx.lineWidth = style.strokeWidth;
            ctx.stroke();
        }
    }
}
const draw = {
    ellipse(x=0,y=0, w=10,h=10, rotation=0, angles={ start: 0, end: Math.PI*2, clockwise: true }, style={ fill: true, fillStyle: "red", stroke: true, strokeStyle: "black", strokeWidth: 1}) {
        if (angles.clockwise == undefined) angles.clockwise = true;
        if (angles.start == undefined) angles.start = 0;
        if (angles.end == undefined) angles.end = Math.PI*2;
        

        ctx.beginPath();
        ctx.ellipse(
            (x), (y), 
            (w), (h), 
            rotation, angles.start, angles.end, !angles.clockwise);
        if (style.fill == true) {
            if (style.fillStyle == undefined) style.fillStyle = "red";
            ctx.fillStyle = style.fillStyle;
            ctx.fill();
        }
        if (style.stroke == true) {
            if (style.strokeStyle == undefined) style.strokeStyle = "black";
            if (style.strokeWidth == undefined) style.strokeWidth = 1;
            ctx.strokeStyle = style.strokeStyle;
            ctx.lineWidth = style.strokeWidth;
            ctx.stroke();
        }
    },
    rect(x=0,y=0, w=10,h=10, style={ fill: true, fillStyle: "red", stroke: true, strokeStyle: "black", strokeWidth: 1}) {
        if (style.fill == true) {
            if (style.fillStyle == undefined) style.fillStyle = "red";
            ctx.fillStyle = style.fillStyle;
            ctx.fillRect(x,y, w,h);
        }
        if (style.stroke == true) {
            if (style.strokeStyle == undefined) style.strokeStyle = "black";
            if (style.strokeWidth == undefined) style.strokeWidth = 1;
            ctx.strokeStyle = style.strokeStyle;
            ctx.lineWidth = style.strokeWidth;
            ctx.strokeRect(x,y, w,h);
        }
    }
}

const draw_circ = (x, y, radius, color, fill=true)=>{
    if (fill) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
    } else {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.stroke(); 
    }
}
const draw_circ2 = (pos, radius, color, fill=true)=>{
    if (fill) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
    } else {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.arc(pos.x, pos.x, radius, 0, 2 * Math.PI);
        ctx.stroke(); 
    }
}
const draw_line = (x1, y1, x2, y2, color="black", width=1)=>{
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
const draw_line2 = (pos1, pos2, color="black", width=1)=>{
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.moveTo(pos1.x, pos1.y);
    ctx.lineTo(pos2.x, pos2.y);
    ctx.stroke();
}
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
const get_angle = (p1, p2, relative=false)=>{
    const d = difference(p1, p2, relative);
    return Math.atan2(d.y, d.x);
}
const run_shader = (func, divisor)=>{
    const data = {};
    for (let py = 0; py < canvas.height/divisor; py++) {
        for (let px = 0; px < canvas.width/divisor; px++) {
            const x = px * divisor;
            const y = py * divisor;
            const res = func(x,y, divisor, data);
            if (res == "kill") return;
        }
    }
}
const pixelate = (area)=>{
    for (let py = 0; py < canvas.height/area; py++) {
        for (let px = 0; px < canvas.width/area; px++) {
            const x = px * area;
            const y = py * area;

            const p = ctx.getImageData(x, y, 1, 1).data; 
            const color = {
                r: p[0],
                g: p[1],
                b: p[2],
                to_string(){
                    return `rgb(${this.r}, ${this.g}, ${this.b})`;
                }
            }

            ctx.fillStyle = color.to_string();
            ctx.fillRect(x,y,area,area);
        }
    }
    
}
const random_range = (min, max, round=false)=>{
    const res = Math.random() * (max - min) + min;
    if (round) return Math.round(res);
    return res;
}
const draw_text = (x,y, text, font="30px arial", style="black", align="center")=>{
    if (font == null)
        font = "30px arial";
    ctx.fillStyle = style;
    ctx.textAlign = align;
    ctx.font = font;
    ctx.fillText(text, x,y);
}
const closest_in_list = (point, list)=>{
    let closest = Infinity;
    let closest_obj = {};
    for (let i = 0; i < list.length; i++) {
        let l = list[i];
        if (l.transform != undefined) {
            l = l.transform;
        } else if (l.pos != undefined) {
            l = l.pos;
        }
        const dist = distance2(point, l);
        if (dist < closest) {
            closest = dist;
            closest_obj = list[i];
        }
    }
    return { dist: closest, obj: closest_obj};
}
const controller_keydown = (key)=>{
    switch (key) {
        case "w":
            controller.w = true;
            break;
        case "a":
            controller.a = true;
            break;
        case "s":
            controller.s = true;
            break;
        case "d":
            controller.d = true;
            break;
        default:
            controller[key] = true;
            break;
    }
}
const controller_keyup = (key)=>{
    switch (key) {
        case "w":
            controller.w = false;
            break;
        case "a":
            controller.a = false;
            break;
        case "s":
            controller.s = false;
            break;
        case "d":
            controller.d = false;
            break;
        default:
            controller[key] = false;
            break;
    }
}
const get_entity_with_id = (id)=>{
    for (let i = 0; i < entities.length; i++) {
        const e = entities[i];
        if (e.id == id) {
            return e;
        }
    }
    return null;
}
const get_entities_with_tag = (tag)=>{
    const select = [];
    for (let i = 0; i < entities.length; i++) {
        const e = entities[i];
        if (e.tag == tag) {
            select.push(e);
        }
    }
    return select;
}
const update_entities = ()=>{
    const new_entites = [];
    for (let i = 0; i < entities.length; i++) {
        const e = entities[i];

        if (e._destroy == true) continue;

        if (typeof e.update == "function")
            e.update(e);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        new_entites.push(e);
    }
    entities = new_entites;
}
const run_mouse_listeners = ()=>{
    for (let i = 0; i < entities.length; i++) {
        const en = entities[i];
        if (en.listener_mouse == undefined) continue;
        if (en.vector == undefined) continue;

        const mx = mouse.pos.x;
        const my = mouse.pos.y;
        const list = en.listener_mouse;

        if (list.shape == "square") {
            if (mouse.on_canvas == true && (mx > en.vector.x && mx < en.vector.x + list.area.w) && (my > en.vector.y && my < en.vector.y + list.area.h)) {
                // console.log("over");
                if (list.mouse_over == false) {
                    list.mouse_over = true;
                    list.on_enter(mx, my, en);
                } else {
                    if (list.mouse_down == false && mouse.down == true) {
                        list.mouse_down = true;
                        list.on_down(mx, my, en);
                    } 
                    else if (list.mouse_down == true && mouse.down == false) {
                        list.mouse_down = false;
                        list.on_up(mx, my, en);
                    }
                }
            } else {
                // console.log(`mouse: (${mx}, ${my}), vector: (${en.vector.x}, ${en.vector.y}), area: (${list.area.w}, ${list.area.h})`);
                if (list.mouse_over == true) {
                    list.mouse_over = false;
                    list.on_leave(mx, my, en);
                }
            }
        }
    }
}
const draw_image = (src, x=0,y=0, width=undefined, height=undefined)=>{
    const image = new Image();
    image.src = src;
    if (width == undefined || height == undefined) {
        width = image.width;
        height = image.height;
    }
    image.onload = ()=>{ctx.drawImage(image, x, y, width, height)}
}
const run_update_functions = ()=>{
    for (let i = 0; i < update.length; i++) {
        const f = update[i];
        if (typeof f != "function") continue;
        f();
    }
}

//#endregion

//#region [> Classes <]
class Emitter {
    constructor(tpe=30, direction=1, arc_range=[0,1], origin=new Vector2(100,100), vect_range=[new Vector2(-1,-1), new Vector2(1,1)], speed_range=[1,2], life_span=60, drag=1, on_destroy=()=>{}) {
        /** Array of particles in this emitter ~~
         * Particle[]
        */
        this.parts = [];

        /** Emitter lifespan in ticks ~~
         * int
        */
        this.ticks = 0;

        /** Ticks Per Second ~~
         * int
        */
         this.tpe = tpe;

        /** General direction of particle's movement ~~ 
         * Radian
        */
        this.direction = direction;

        /** Range of directions for particles ~~ 
         * (Radian, Radian)
        */
        this.arc_range = arc_range;

        /** origin of emitter ~~ 
         * Vector2
        */
        this.origin = origin;

        /** Range area from origin ~~ 
         * (Vector2, Vector2)
        */
        this.vect_range = vect_range;

        /** Range of speed for particles ~~ 
         * (int, int)
        */
        this.speed_range = speed_range;

        /** How long the particle with live in ticks ~~ 
         * int
        */
        this.life_span = life_span;

        /** How much the particle speed will drag ~~
         * float
        */
        this.drag = drag;

        this.on_destroy = on_destroy;
    }
    step() {
        this.ticks++;

        if (this.ticks % this.tpe == 0) {
            this.emit();
        }
        const new_parts = [];
        for (let i = 0; i < this.parts.length; i++) {
            const part = this.parts[i];
            part.step();
            if (part.ticks < this.life_span && !part._destroy)
                new_parts.push(part);
            else {
                part.on_destroy();
            }
                
        }
        this.parts = new_parts;
    }
    emit() {
        const pos = {
            x: this.origin.x + random_range(this.vect_range[0].x, this.vect_range[1].x), 
            y: this.origin.y + random_range(this.vect_range[0].y, this.vect_range[1].y)
        };
        const vect = {
            x: Math.cos(this.direction+random_range(this.arc_range[0], this.arc_range[1])) * random_range(this.speed_range[0], this.speed_range[1]),
            y: Math.sin(this.direction+random_range(this.arc_range[0], this.arc_range[1])) * random_range(this.speed_range[0], this.speed_range[1])
        }
        const part = new Particle(pos, vect, this.drag);
        part.on_destroy = this.on_destroy;
        this.parts.push(part);
    }
}
class Particle {
    constructor(pos, vect, drag) {
        this.pos = pos;
        this.vect = vect;
        this.drag = drag;
        this.ticks = 0;
        this._destroy = false;
        this.on_destroy = ()=>{};
    }
    step() {
        this.move();
        this.draw();
        this.ticks++;
    }
    move() {
        this.pos.x += this.vect.x;
        this.pos.y += this.vect.y;
        this.vect.x *= this.drag;
        this.vect.y *= this.drag;
    }
    draw() {
        draw_circ2(this.pos, 10, ctx.fillStyle);
    }
}
class Job {
    constructor(ticks, funcs=[], data={}) {
        this.ticks = ticks;
        this.funcs = funcs;
        this.data = data;
        event_manager.jobs.push(this);
    }
    run_job() {
        for (let i = 0; i < this.funcs.length; i++) {
            const func = this.funcs[i];
            if (typeof func != "function") continue;
            const res = func(this.data);
            if (res == "kill")
                break;
        }
    }
}

class Entity {
    constructor() {
        this._destroy = false;
        entities.push(this);
    }
    bind(obj) {
        if (obj.$ != undefined && typeof obj.$ == "function") {
            const prop = obj.$();
            if (prop == "graphic") {
                obj.bind = this;
            }
            this[prop] = obj;
        } else if (typeof obj == "object") {
            Object.assign(this, obj);
        }
        
        return this;
    }
    destroy(time=0) {
        if (time <= 0) {
            this._destroy = true;
        } else {
            new Job(time, [(data)=>{ data.entity._destroy = true }], {entity: this})
        }
    }
}

class Vector2 {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
    get_dir() {
        return Math.atan2(x,y);
    }
    move_to(pos={x:0, y:0}, step=5) {
        const angle = get_angle(this, pos);
        const dist = distance2(this, pos);
        if (dist <= step) {
            this.x = pos.x;
            this.y = pos.y;
        } else {
            this.x += Math.cos(angle)*step;
            this.y += Math.sin(angle)*step;
        }
        return this;
    }
    move_with_angle(len, angle) {
        if (angle == null) return;
        this.x += Math.cos(angle)*len;
        this.y += Math.sin(angle)*len;
        return this;
    }
    translate(x,y) {
        this.x += x;
        this.y += y;
        return this;
    }
    $(){ return "vector" }
}
class Transform {
    constructor(rotation, scale_w, scale_h) {
        this.rotation = rotation;
        this.scale_w = scale_w;
        this.scale_h = scale_h;
    }
    rotate(angle) {
        this.rotation += angle;
    }
    scale(x,y) {
        this.scale_w += x;
        this.scale_h += y;
    }
    $(){ return "transform" }
}
class Physics {
    constructor(vx=0, vy=0, gravity=1, drag=0.95, vector=null) {
        this.vx = vx;
        this.vy = vy;
        this.gravity = gravity;
        this.drag = drag;
        this.vector = vector;
    }
    add_force(x,y) {
        this.vx += x;
        this.vy += y;
        return this;
    }
    step(do_drag=false, do_gravity=true) {
        if (this.vector == null) return;
        this.vector.x += this.vx;
        this.vector.y += this.vy;
        if (do_gravity) this.vy += this.gravity;
        if (do_drag) {
            this.vx *= this.drag;
            this.vy *= this.drag;
        }
        return this;
    }
    $(){ return "physics" }
}
class Graphic {
    constructor(on_draw=(self)=>{}) {
        this.bind = {};
        this.on_draw = on_draw;
    }
    draw(){
        if (this.bind.vector == null || this.bind.transform == null) return;
        ctx.setTransform(1, 0, 0, 1, this.bind.vector.x + camera.pos.x, this.bind.vector.y + camera.pos.y);
        ctx.rotate(this.bind.transform.rotation);
        this.on_draw(this.bind);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    $(){ return "graphic" }
}
class BoxCollider {
    constructor(w, h) {
        this.w = w;
        this.h = h;
        this.vector = null;
    }
    $() { return "box_collider"; }
}
class Skeleton {
    constructor(origin, ) {
        
    }
}
const Listener = {
    Mouse: class Mouse {
        constructor(shape="square", area={w:20, h:20}, on_enter=(x,y, self)=>{}, on_leave=(x,y, self)=>{}, on_down=(x,y, self)=>{}, on_up=(x,y, self)=>{}) {
            this.shape = shape;
            this.mouse_over = false;
            this.mouse_down = false;
            this.area = area;
            this.on_enter = on_enter;
            this.on_leave = on_leave;
            this.on_down = on_down;
            this.on_up = on_up;
        }
        $() { return "listener_mouse" }
    }
}
//#endregion

//#region [> Init <]
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

ctx.save();
// ctx.restore();

const scale_canvas = ()=>{
    const ratio = (window.innerHeight)/3;

    canvas.style.width = ratio*4 + "px";
    canvas.style.height = ratio*3 + "px";
    canvas.width = Math.floor(ratio*4);
    canvas.height = Math.floor(ratio*3);
    ctx.scale(1+(1/3), 1);
}; scale_canvas();

document.body.onresize = (e)=>{
    scale_canvas();

    collect1.x = 75; collect1.y = canvas.height-75;
    collect2.x = canvas.width-75; collect2.y = 75;
    collect3.x = canvas.width-75; collect3.y = canvas.height-75;
    repulse1_pos.x = canvas.width/2; repulse1_pos.y = canvas.height/2;

    for (let i = 0; i < entities.length; i++) {
        const e = entities[i];
        if (e.tag == "orb") e._destroy = true;
    }
}

const mouse = {
    down: false,
    on_canvas: false,
    pos: {
        x: 0,
        y: 0,
    }
}
const camera = {
    pos: {x: 0, y: 0},
    translate(x,y) {
        this.pos.x += x;
        this.pos.y += y;
    }
}
const controller = {
    w: false,
    a: false,
    s: false,
    d: false,
    angle() {
        let x = 0;
        let y = 0;
        x += (this.a)? -1 : 0;
        x += (this.d)? 1 : 0;
        y += (this.w)? -1 : 0;
        y += (this.s)? 1 : 0;

        if (x != 0 || y != 0) {
            return Math.atan2(y, x);
        } else {
            return null;
        }
    }
}
const assets = {
    example: "https://via.placeholder.com/350x150"
}
document.onmousemove = (e)=>{
    if (e.target == canvas) {
        mouse.pos.x = e.offsetX;
        mouse.pos.y = e.offsetY;
        mouse.on_canvas = true;
    } else {
        mouse.on_canvas = false;
    }
}
let entities = [];

const event_manager = {
    jobs: [],
    step_jobs() {
        const new_jobs = [];
        for (let i = 0; i < this.jobs.length; i++) {
            const job = this.jobs[i];
            if (job.ticks <= 0) {
                job.run_job();
            } else {
                job.ticks -= 1;
                new_jobs.push(job);
            }
        }
        this.jobs = new_jobs;
    }
}

const update = [];
//#endregion
