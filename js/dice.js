export function createDice({ S }) {
  function roll(n){return Array.from({length:n},()=>1+Math.floor(Math.random()*6));}
function dieHtml(n,pass,kind){return '<span class="die '+(pass?'success':'fail')+(kind==='save'?' save':'')+'" title="'+(pass?'success':'failure')+'">'+n+'</span>';}
function lane(label,values,threshold,mode){return '<div class="dice-lane"><span class="lane-label">'+label+'</span>'+values.map(v=>dieHtml(v,mode==='save'?v>=threshold:v>=threshold,mode)).join("")+'</div>';}
function diceStack(u,r){
 let out='<div class="dice-stack"><b>'+u.name+'</b>';
 out+=lane('To hit — need '+(r.hitNeed>6?'7+ (impossible)':r.hitNeed+'+'),r.hitRolls,r.hitNeed,'hit');
 out+=lane('To wound — '+r.hits+' hits; need '+r.woundNeed+'+',r.woundRolls,r.woundNeed,'wound');
 if(r.saveNeed!==null)out+=lane('Armour saves — '+r.woundsBeforeSave+' wounds; need '+(r.saveNeed>6?'7+ (impossible)':r.saveNeed+'+'),r.saveRolls,r.saveNeed,'save');
 out+='<div class="unitmeta">Result: '+r.hits+' hits, '+r.woundsBeforeSave+' wounds, '+r.saved+' saved, <b>'+r.wounds+' unsaved</b>.</div></div>';return out;
}
function diceDuel(title,r1,r2){return '<div><b>'+title+'</b><div class="dice-duel">'+(r1?'<div class="dice-side"><h3>Player</h3>'+diceStack(S.units.pSword.side==='player'?S.units.pSword:S.units.pArch,r1)+'</div>':'')+(r2?'<div class="dice-side"><h3>Opponent</h3>'+diceStack(S.units.aSword.side==='ai'?S.units.aSword:S.units.aArch,r2)+'</div>':'')+'</div></div>';}
  return { roll, diceStack, diceDuel };
}
