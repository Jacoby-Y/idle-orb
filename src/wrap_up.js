const calc_offline = (test=0)=>{
    const offline = (test > 0)? test : Math.round(Date.now()/1000) - D.time_save;
    console.log(`Offline time: ${offline}`);
    const per_sec = D.idle_orb_sec;
    let total = 0;
    let total_w = 0;
    for (let i = 0; i < D.orbs.length; i++) total_w += D.orbs[i].weight;

    for (let i = 0; i < D.orbs.length; i++) {
        const orb = D.orbs[i];
        total += (orb.value * (per_sec*offline))*(orb.weight/total_w);
    }; total = Math.round(total*10)/10;

    if (total <= 0) return;

    D.cash += total;

    $(".modal-wrapper").style.display = "grid";
    if ($(".modal #total") != null) $(".modal #total").innerText = format_num(total);
    $(".modal-wrapper").onclick = ()=> $(".modal-wrapper").style.display = "none";

}; calc_offline();

// Online test: 31k, 
// Offline test: 27k

const test_earnings = ()=>{
    const start_cash = D.cash;
    setTimeout(() => {
        console.log(`Earnings: ${D.cash-start_cash}`);
    }, 60000);
}

document.body.onresize();