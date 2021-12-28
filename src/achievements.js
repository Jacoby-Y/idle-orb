D.stats = {
    total_manual: 0,
    total_idle: 0,
    total_made: 0,
    most_had: 0,
    most_entities: 0,
    most_made_per_second: 0,
    prest_time: 0,
    best_prest_time: 0,
}

function set_stat(target, key, value, receiver) { 
    D.stats[key] = value;
    if (key == "total_manual") achievements[0].update_mask();
    else if (key == "total_idle") achievements[1].update_mask();
    else if (key == "most_made_per_second") achievements[2].update_mask();

    // return ref;
}
const stats = new Proxy(D.stats, { set: set_stat });

D.$load = false;


const new_update_mask = (i=0, stat="", max=1000)=>{
    return function() {
        if (this.done == true) return;
        let res = Math.floor(D.stats[stat]/max*100);
        if (res >= 100) { this.done = true; res = 100; percents[i].innerText = `${max}/${max}`; }
        else percents[i].innerText = `${D.stats[stat]}/${max}`;
        masks[i].style.width = (res < 100)? `${res}%` : `calc(${res}% + 1px)`;
    } 
}
const achievements = [
    { // D.achievements[0]
        title: "Manually spawn 1k orbs", done: false,
        update_mask: new_update_mask(0, "total_manual", 1000),
    },
    { // D.achievements[1]
        title: "Idley spawn 10k orbs", done: false,
        update_mask: new_update_mask(1, "total_idle", 10000),
    },
    { // D.achievements[1]
        title: "Make 1k cash in a second", done: false,
        update_mask: new_update_mask(2, "most_made_per_second", 1000),
    },
];

const achieve_sect = $("#achievements");
(()=>{
    for (let i = 0; i < achievements.length; i++) {
        achieve_sect.insertAdjacentHTML("beforeend", `<div class="achieve"> <div class="mask"></div> <h3 class="txt"></h3><h3 class="perc">0%</h3> </div>`);
    }
})();

const masks = $all(".achieve .mask");
const percents = $all(".achieve .perc");
const txts = $all(".achieve .txt");

(()=>{
    for (let i = 0; i < achievements.length; i++) {
        const a = achievements[i];
        if (a.update_mask != undefined) a.update_mask();
        txts[i].innerText = a.title;
    }
})(); //* Setup achievement masks and such