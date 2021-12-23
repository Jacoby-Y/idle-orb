//#region [> Main 1 <]
const tabs1 = $all("#main1 .tab");
const sections1 = $all("#main1 .section");
// let in_prest = false;

const toggle_tabs1 = (keep=0)=>{
    if (keep == 2) { in_prest = true; D.cash = D.cash; }
    else in_prest = false;
    for (let i = 0; i < tabs1.length; i++) {
        const e = tabs1[i];
        if (i != keep) e.classList.remove("in-sect");
        else e.classList.add("in-sect");
    }
}
const hide_sections1 = (keep=0)=>{
    for (let i = 0; i < sections1.length; i++) {
        const e = sections1[i];
        if (i == keep) continue;
        e.style.display = "none";
    }
}

(()=>{
    for (let i = 0; i < tabs1.length; i++) {
        const t = tabs1[i];
        t.onclick = function (){
            if (sections1[i] == undefined) return;
            sections1[i].style.display = "grid";
            toggle_tabs1(i);
            hide_sections1(i);
        }
    }
})(); tabs1[0].onclick();
//#endregion

//#region [> Main 2 <]
const tabs2 = $all("#main2 .tab");
const sections2 = $all("#main2 .section");
// let in_prest = false;

const toggle_tabs2 = (keep=0)=>{
    if (keep == 2) { in_prest = true; D.cash = D.cash; }
    else in_prest = false;
    for (let i = 0; i < tabs2.length; i++) {
        const e = tabs2[i];
        if (i != keep) e.classList.remove("in-sect");
        else e.classList.add("in-sect");
    }
}
const hide_sections2 = (keep=0)=>{
    for (let i = 0; i < sections2.length; i++) {
        const e = sections2[i];
        if (i == keep) continue;
        e.style.display = "none";
    }
}

(()=>{
    for (let i = 0; i < tabs2.length; i++) {
        const t = tabs2[i];
        t.onclick = function (){
            if (sections2[i] == undefined) return;
            sections2[i].style.display = "grid";
            toggle_tabs2(i);
            hide_sections2(i);
        }
    }
})(); tabs2[0].onclick();
//#endregion

const draw_setting_btns = $all("#settings .split-5 h3");
for (let i = 0; i < draw_setting_btns.length; i++) {
    const e = draw_setting_btns[i];
    e.onclick = function() {
        D.draw_setting = i;
        for (let j = 0; j < draw_setting_btns.length; j++) {
            const e2 = draw_setting_btns[j];
            e2.style.backgroundColor = "#aaa";
        }
        this.style.backgroundColor = "#ccc";
    }
}; draw_setting_btns[D.draw_setting].onclick();