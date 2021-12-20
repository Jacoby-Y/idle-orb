//#region [> Functions <]
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
const draw_text = (x,y, text, font="30px arial", style="black", align="center")=>{
    if (font == null)
        font = "30px arial";
    ctx.fillStyle = style;
    ctx.textAlign = align;
    ctx.font = font;
    ctx.fillText(text, x,y);
}
const line_from_angle = (start, angle, length, color)=>{
    const end_x = Math.cos(angle)*length + start.x;
    const end_y = Math.sin(angle)*length + start.y;
    draw_line(start.x, start.y, end_x, end_y, color, 2);
}

let total_drawn = 0;
const do_cull = () => { 
    if (total_drawn < 200) return false;
    const culls = Math.floor(entities.length/200);
    if (culls == 0) return false;
    return (Math.random()< 0.5+(culls*0.1));
}

//* ====================
let done = true;
const update_entities = ()=>{
    if (!done || entities.length <= 0) return;
    for (let i = 0; i < entities.length; i++) 
        if (entities[i]._destroy == true) entities.splice(i, 1);
    
    // for (let i = 0; i < entities.length; i++) {
    //     const e = entities[i];
    //     if (typeof e.update == "function") e.update(e);
    //     ctx.setTransform(1, 0, 0, 1, 0, 0);
    // }
    const len = Math.floor(entities.length / 4);
    const part1 = new Promise((ok, err)=>{
        if (done) done = false;
        for (let i = 0; i < len; i++) {
            const e = entities[i];
            e.update();
        }
        ok();
    });
    const part2 = new Promise((ok, err)=>{
        if (done) done = false;
        for (let i = len; i < len*2; i++) {
            const e = entities[i];
            e.update();
        }
        ok();
    });
    const part3 = new Promise((ok, err)=>{
        if (done) done = false;
        for (let i = len*2; i < len*3; i++) {
            const e = entities[i];
            e.update();
        }
        ok();
    });
    const part4 = new Promise((ok, err)=>{
        if (done) done = false;
        for (let i = len*3; i < entities.length; i++) {
            const e = entities[i];
            e.update();
        }
        ok();
    });
    Promise.all([part1, part2, part3, part4]).then((res)=>{
        done = true;
    });
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
    repulse1.x = canvas.width/2; repulse1.y = canvas.height/2;

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
