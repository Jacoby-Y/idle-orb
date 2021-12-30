let run_main = true;
const main_func = ()=>{
    if (run_main == false && entities.length <= 0) return;
    if (run_main == false && entities.length > 0) run_main = true;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // ctx.clearRect(0,0, canvas.width, canvas.height);
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    update_entities();
    run_update_functions();
    // event_manager.step_jobs();
    // run_mouse_listeners();

    if (run_main == true && entities.length <= 0) run_main = false;
}

const draw_simples = ()=>{
    ctx.beginPath();
    ctx.fillStyle = "grey"; // Green fill
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


    draw_circ2(collect1, 30, "grey", true);
    draw_circ2(collect2, 30, "#008800", true);
    draw_circ2(collect3, 30, "#bbbb00", true);

    draw_circ2(repulse1, repulse1.size, "lime", true);
    draw_circ2(repulse1, repulse1.size-5, "black", true);
    
    draw_text(collect1.x, collect1.y+8, `x1`, "30px arial", "black", "center");
    draw_text(collect2.x, collect2.y+8, `x2`, "30px arial", "white", "center");
    draw_text(collect3.x, collect3.y+8, `x5`, "30px arial", "black", "center");

    // const ang = F_acos(100/-151)+ Math.PI;
    // line_from_angle(repulse1, ang, 300, "aqua");


    // line_from_angle({x: 100, y: 100}, Math.acos(4/5), 100, "aqua");


    if (clicked) return;
    draw_text(canvas.width/5, canvas.height/2+10, `Click Here!`, "30px arial", "white", "center");
}; update.push(draw_simples);

let clicked = false;
let last_click = 0;
const idle_run = ()=>{
    setTimeout(() => {
        if (D.idle_orb_sec <= 0) return;
        if (pause) { idle_run(); return; }
        if (Math.random()*100 <= D.burst_fire_perc) for (let i = 0; i < D.burst_fire_amount; i++) { emit_orb(); stats.total_idle++; }
        else { emit_orb(); stats.total_idle++; }
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
            showing_out = false;
        } else if (k == "ArrowDown") {
            cons_input.innerText = "> ";
        }
        if (k == "Enter") {
            last_log = cons_input.innerText.slice(1);
            const ev = eval(last_log);
            // if (typeof ev == "object") cons_output.innerText = `: ${JSON.Stringify(ev)}`;
            if (
                typeof ev === 'object' &&
                !Array.isArray(ev) &&
                ev !== null
            ) { cons_output.innerText = `: ${JSON.stringify(ev)}`; }
            else cons_output.innerText = `: ${ev}`;
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
    else if (k == "1") tabs1[0].onclick();
    else if (k == "2") tabs1[1].onclick();
    else if (k == "3") tabs1[2].onclick();
    else if (k == "R") local.clear_storage();
    else if (k == "l") loop_emit(max_drawn);
    else if (k == ";") loop_emit(1000);
    else if (k == "'") loop_emit(10000);
}

// D.frame = 0;
let worst_frame = 0;
let last_frame = 0;
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
    last_frame = Date.now()-now;
    worst_frame = Math.max(last_frame, worst_frame);

    if (m_secs >= 1000) {
        add_cache(0, true);
        m_secs = 0;
    } else m_secs += 1000/60;
}, 1000/50);

const average = (array) => array.reduce((a, b) => a + b) / array.length;

let cash_made = D.cash;
let cash_list = [0, 0, 0, 0];
let loop_t = 0;
setInterval(()=>{

    D.ent_len = entities.length.toString() + " | " + worst_frame + " | " + ((pause)? "T" : "F");
    D.debug[0] = pause.toString();
    D.debug[1] = entities.length.toString();
    total_drawn = count_drawn();
    D.debug[2] = (D.draw_setting == 4)? 0 : total_drawn;
    
    D.debug = D.debug;
    
    cash_list[loop_t] = Math.round((D.cash - cash_made)*10)/10;
    D.debug[3] = Math.round((average(cash_list))*10)/10;
    stats.most_made_per_second = Math.max(D.stats.most_made_per_second, D.debug[3]);

    D.stats = D.stats;
    cash_made = D.cash;
    if (loop_t >= 3) {
        
        loop_t = 0;
    }
    else loop_t++;
}, 250);