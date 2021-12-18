// #region [> Helper Functions <]
const is_int = (num)=>{
    return num == Math.floor(num);
}

const floor_round = (num, place)=>{
  const pow = (Math.pow(10, place));
  return Math.floor(num * pow) / pow;
}

const num_shorts = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'O', 'N', 'D', 'UD', 'DD', 'TD', 'QuD', 'QiD', 'SxD', 'SpD', 'OD', 'ND', 'V', 'UV', 'DV', 'TV', 'QaV', 'QiV', 'SxV', 'SpV', 'OV', 'NV', 'T', 'UT', 'DT', 'TT', 'QaT', 'QiT', 'SxT', 'SpT', 'OT', 'NT',];
const format_num = (num, round_to=1, i=0, past_thresh=false)=>{
    const div = num / 1000;
    const thresh = (i >= num_shorts.length);
    if (div < 1 || thresh) { 
      if (thresh) return (floor_round(num, round_to) + num_shorts[num_shorts.length-1]);
      else return (i == 0) ? (floor_round(num, round_to)) : (floor_round(num, round_to) + num_shorts[i]);
    }
    return format_num(div, round_to, i+1, thresh);
}

const f_str = (format, ...args)=>{
    args = [].concat.apply([], args);
    let new_f = format;
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (!format.includes(`[${i}]`)) continue;

        while (new_f.includes(`[${i}]`)) {
            new_f = new_f.replace(`[${i}]`, arg);
        }
    }
    return new_f;
};
//#endregion

//#region [> Watcher <]
function set(target, key, value, receiver) { 
    if (key == "settings" || key == "$load" || key == "$init" || key == "$do_init") return Reflect.set(target, key, value, receiver);
    if (D.settings == undefined) {
        console.warn("Settings must be defined first!");
        return;
    }

    if (D.$do_init == true && D.$init !== undefined) D.$init[key] = value;

    const s_value = local.get_storage()[key];
    if (D.$load == true && s_value !== undefined) value = s_value;

    
    const keys = Object.keys(D.settings); 
    const values = Object.values(D.settings);
    const index = keys.indexOf(key);
    const obj = values[index];
    if (index == undefined || obj == undefined) {
        // not in the settings!
        let ref_bool = Reflect.set(target, key, value, receiver);
        update_vars(key, value);
        return ref_bool;
    }

    if (obj.skip == true) return Reflect.set(target, key, value, receiver);
    if (typeof obj.round == "number") {
        const pow = Math.pow(10, obj.round);
        value = Math.round(value * pow) / pow;
    }
    if (typeof obj.display == "function") {
        let ref_bool = Reflect.set(target, key, value, receiver);
        update_vars(key, obj.display(value));
        return ref_bool;
    }
    let ref_bool = Reflect.set(target, key, value, receiver);
    update_vars(key, value);
    return ref_bool;
}

let D = new Proxy({}, { set: set });

const update_vars = (k, v)=>{
    for (const elem of document.body.getElementsByTagName("*")) {
        if (!elem.hasAttribute(":w")) continue;
        
        let txt = elem.innerText;
        if (elem.hasAttribute("content")) {
            txt = elem.getAttribute("content");
        } else {
            elem.setAttribute("content", elem.innerText);
        }

        if (!txt.includes("{") || !txt.includes("}")) continue;
        let subStr = String(txt.substring( txt.lastIndexOf("{") + 1, txt.lastIndexOf("}") ).trim());
        // console.log(subStr);
        const set_str = elem.getAttribute("content").replace(`{${subStr}}`, v);

        if (subStr.includes("=>")) {
            const args = subStr.split("=>")[0].split(",");
            args.forEach((key, i, list)=>{ list[i] = get_var_display(key.trim())});
            const format = subStr.split("=>")[1];

            // console.log(`Key: ${k}, Value: ${v}`);

            if (elem.innerText != set_str) elem.innerText = f_str(format, args);
        }
        else if (subStr.includes(":")) {
            const arg = subStr.split(":")[0];
            const index = parseInt(subStr.split(":")[1]);
            if (isNaN(index) || arg !== k || !Array.isArray(v)) continue;
            const i_val = v[index];
            if (i_val === undefined) continue;
            elem.innerText = elem.getAttribute("content").replace(`{${subStr}}`, i_val);
        }
        else if (subStr == k) {
            if (elem.innerText != set_str) elem.innerText = set_str;
        }
    }
    for (const elem of document.body.getElementsByTagName("w")) {
        const attrs = elem.attributes;
        for (let i = 0; i < attrs.length; i++) {
            const name = attrs[i].name;
            const value = attrs[i].value;
            if (k != name.slice(1)) break;
            
            const format = elem.getAttribute("f");
            if (format !== null && format.includes("$."))
                elem.innerText = format.replace("$.", v);
            else
                elem.innerText = v;
        }
    }
}

const get_var_display = (k)=>{
    if (D.settings == undefined) {
        console.warn("Settings must be defined first!");
        return;
    }
    
    const keys = Object.keys(D.settings); 
    const values = Object.values(D.settings);
    const index = keys.indexOf(k);
    const obj = values[index];
    if (index == undefined || obj == undefined) {
        return D[k];
    }

    if (obj.skip == true) return D[k];
    if (typeof obj.display == "function") return obj.display(D[k]);
}

const get_or = (key, val, from_local=true)=>{
    if (from_local && local.can_load()) {
        const ls = local.get_storage();
        if (ls[key] == undefined) return val;
        return ls[key];
    }
    if (D[key] == undefined) return val;
    return D[key];
}

const local = {
    store() {
        let store = {...D};
        store.settings = undefined;
        localStorage.setItem("D", JSON.stringify(store));
    },
    load(D_obj) {
        let stored = JSON.parse(localStorage.D);
        if (stored == null) {
            console.warn("localStorage has no 'D' key. Set it with 'local.store' function");
            return;
        } 
        this.update_gui(D_obj, stored);
    },
    get_storage() {
        if (localStorage.D === undefined) return {};
        return JSON.parse(localStorage.D);
    },
    can_load() {
        return localStorage.D != null || localStorage.D != undefined;
    },
    update_gui(D_obj, stored) {
        const keys = Object.keys(stored);
        const values = Object.values(stored);
        for (let i = 0; i < keys.length; i++) {
            D_obj[keys[i]] = values[i];
        }
    },
    clear_storage() {
        localStorage.clear();
        window.onbeforeunload = null;
        window.location.reload();
    }
}
//#endregion

//#region [> Identi <]
const $all = (selector="*", index=-1, arrayify=true)=>{
    const query = document.querySelectorAll(selector);
    if (index >= 0) return query[0];
    if (arrayify === true) return [].slice.call(query);
}
const $ = selector => document.querySelector(selector);
//#endregion

// #region [> Claide <]
// document.body.onload = 
(()=> {
    const elems = document.body.querySelectorAll("*");
    elems.forEach((e, num, p)=>{
        const attrs = [].slice.call(e.attributes);
        
        for (let i = 0; i < attrs.length; i++) {
            const name = attrs[i].name;
            const value = attrs[i].value;
            if (name[0] == "#") {
                e.id = name.slice(1);
                e.removeAttribute(name);
            }
            if (name[0] == ".") {
                const classes = name.slice(1).split('|');
                for (let i = 0; i < classes.length; i++)
                    e.classList.add(classes[i]);
                e.removeAttribute(name);
            }
            if (name == "onhover") {
                if (value[0] == "!") {
                    const split = value.slice(1).split('|');
                    e.onmouseenter = function() { eval(split[0]) };
                    e.onmouseleave = function() { eval(split[1]) };
                } else {
                    const split = value.split('|');
                    e.onmouseenter = eval(split[0]);
                    e.onmouseleave = eval(split[1]);
                }
                
                e.removeAttribute(name);
            }
        }
    });
})();
//#endregion
