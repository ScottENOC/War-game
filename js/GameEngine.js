import { createStartingUnits } from "./units.js";
import { createAI } from "./ai.js";
import { createRules } from "./rules.js";
import { createShooting } from "./shooting.js";
import { createCombat } from "./combat.js";
import { createRendering } from "./rendering.js";
import { createInput } from "./input.js";

export function startGame() {
(() => {
"use strict";
const $ = id => document.getElementById(id);
const canvas = $("field"), ctx = canvas.getContext("2d");
const BATTLEFIELD_WIDTH_IN=48, MODEL_BASE_IN=.9, BOW_RANGE=24;
const S={
 turn:1,phase:"charges",selected:"pSword",finished:false,combatRound:0,loser:null,crDiff:0,log:[],mode:null,chargeSide:"player",chargePasses:0,declaredCharges:[],activationSide:"player",
 units:createStartingUnits()
};
const units=()=>Object.values(S.units), alive=u=>u.models>0;
const W=()=>canvas.clientWidth,H=()=>canvas.clientHeight,PX_PER_IN=()=>W()/BATTLEFIELD_WIDTH_IN,fieldHeightIn=()=>H()/Math.max(1,PX_PER_IN());
const dist=(a,b)=>Math.hypot((a.x-b.x)*BATTLEFIELD_WIDTH_IN,(a.y-b.y)*fieldHeightIn());
const enemies=u=>units().filter(v=>v.side!==u.side&&alive(v));
function say(msg){S.log.unshift(msg);S.log=S.log.slice(0,80);$("log").innerHTML=S.log.map(x=>'<div class="logentry">'+x+'</div>').join("");if(msg.includes("dice-stack")||msg.includes("dice-duel")){$("rollcontent").innerHTML=msg;$("rollview").classList.add("show");}if($("logpanel").classList.contains("open"))$("log").scrollTop=0;}
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
function closestEnemy(u){return enemies(u).sort((a,b)=>dist(u,a)-dist(u,b))[0]||null;}
function selectedTarget(u){const list=enemies(u);return list.find(v=>v.id===S.targetId)||closestEnemy(u);}
function renderRoster(){for(const side of ["ai","player"]){const el=$(side==="ai"?"enemycards":"playercards");el.innerHTML="";units().filter(u=>u.side===side).forEach(u=>{const b=document.createElement("button");b.className="unit-card"+(u.id===S.selected?" selected":"")+(side==="player"&&!u.moved&&!u.shot&&!u.fled?" unmoved":"");b.setAttribute("aria-label",u.name+" "+u.models+" models");b.title=u.name;b.innerHTML='<span class="sigil">'+(u.kind==="archer"?"🏹":"⚔")+'</span><span class="count">'+u.models+'</span><span class="bar '+(side==="ai"?"ai":"")+'"></span>';b.onclick=()=>{S.selected=u.id;S.mode=null;render();};el.append(b);});}}
function render(){const u=S.units[S.selected];renderRoster();draw();controls();}
function hint(){return "";}
function btn(label,icon,fn,disabled,active){const b=document.createElement("button");b.textContent=icon;b.title=label;b.setAttribute("aria-label",label);b.disabled=!!disabled;if(active)b.classList.add("active");b.onclick=fn;$("actions").append(b);}
function controls(){const el=$("actions");el.replaceChildren();if(S.finished){btn("New battle","↻",reset,false);return;}const u=S.units[S.selected],target=selectedTarget(u);
 if(S.phase==="charges"){if(S.chargeSide!=="player"){btn("Opponent declaring charges","…",()=>{},true);return;}btn("Declare charge","➜",()=>{S.mode=S.mode==="charge"?null:"charge";render();},!u||u.side!=="player"||u.engaged||u.fled||u.charged||!target||target.engaged||dist(u,target)>u.stats.M*2,S.mode==="charge");btn("Pass charges","Ⅱ",passCharges);return;}
 if(S.phase==="movement"){btn("Move","↔",()=>{S.mode=S.mode==="move"?null:"move";render();},!u||u.side!=="player"||u.activated||u.engaged||u.fled||u.shot||u.moveUsed>=u.stats.M,S.mode==="move");btn("Shoot","◎",()=>{S.mode=S.mode==="shoot"?null:"shoot";render();},!u||u.side!=="player"||u.activated||u.kind!=="archer"||u.shot||u.engaged,S.mode==="shoot");btn("End activation","✓",finishActivation,!u||u.side!=="player"||u.activated||u.engaged||u.fled);return;}
 if(S.phase==="combat"){btn("Resolve melee","⚔",resolveCombat,!units().some(v=>v.side==="player"&&v.engaged&&alive(v)));btn("End turn","▶",endTurn,!units().some(v=>v.engaged&&alive(v)));return;}
 if(S.phase==="break")btn("Break test","🎲",resolveBreak);
}
function setPhase(p){S.phase=p;S.mode=null;units().forEach(u=>{u.activated=false;if(p==="charges"){u.moved=false;u.moveUsed=0;u.shot=false;u.shootCasualties=0;u.panicTested=false;u.charged=false;}});if(p==="charges"){S.chargeSide="player";S.chargePasses=0;S.declaredCharges=[];}if(p==="movement")S.activationSide="player";S.targetId=null;render();if(p==="movement")startActivations();}
function declareCharge(u,target){if(!u||!target||u.engaged||u.fled||u.charged||!alive(u)||!alive(target)||target.engaged||dist(u,target)>u.stats.M*2)return false;S.declaredCharges.push({unitId:u.id,targetId:target.id});u.charged=true;say(u.name+" declares a charge against "+target.name+".");S.chargePasses=0;S.mode=null;S.chargeSide=u.side==="player"?"ai":"player";if(S.chargeSide==="ai")aiChargeStep();else render();return true;}
function finishMovement(){finishActivation();}
function passCharges(){if(S.phase!=="charges"||S.chargeSide!=="player")return;S.chargePasses++;S.mode=null;say("Player passes on charges.");S.chargeSide="ai";aiChargeStep();}
function aiChargeStep(){if(S.phase!=="charges"||S.chargeSide!=="ai")return;const candidates=units().filter(u=>u.side==="ai"&&alive(u)&&!u.engaged&&!u.fled&&!u.charged).map(u=>({u,t:enemies(u).filter(t=>!t.engaged&&!t.fled&&dist(u,t)<=u.stats.M*2).sort((a,b)=>dist(u,a)-dist(u,b))[0]})).filter(x=>x.t).sort((a,b)=>dist(a.u,a.t)-dist(b.u,b.t));if(candidates.length){declareCharge(candidates[0].u,candidates[0].t);return;}S.chargePasses++;say("Opponent passes on charges.");if(S.chargePasses>=2){resolveDeclaredCharges();return;}S.chargeSide="player";render();}
function resolveDeclaredCharges(){const declared=S.declaredCharges.slice();S.chargeSide=null;say("Resolving declared charges.");declared.forEach(c=>{const u=S.units[c.unitId],target=S.units[c.targetId];if(!u||!target||!alive(u)||!alive(target)||target.engaged||u.engaged||dist(u,target)>u.stats.M*2)return;const gap=dist(u,target);if(target.kind==="archer"&&gap>4&&gap<=BOW_RANGE){say(target.name+" chooses Stand and Shoot.");shoot(target,u,true);if(!alive(u)||u.fled)return;}const q=shape(u),t=shape(target),dx=target.x-u.x,dy=target.y-u.y,d=Math.max(.001,Math.hypot(dx,dy)),stop=(q.depth+t.depth)/2/BATTLEFIELD_WIDTH_IN;u.x=target.x-dx/d*stop;u.y=target.y-dy/d*stop;u.facing=Math.atan2(dy,dx);target.facing=Math.atan2(u.y-target.y,u.x-target.x);u.engaged=true;target.engaged=true;u.charged=true;say(u.name+" completes its charge into "+target.name+".");});setPhase("movement");}
function eligibleForActivation(u){return alive(u)&&!u.fled&&!u.engaged&&!u.activated;}
function startActivations(){S.activationSide="player";const p=units().filter(u=>u.side==="player"&&eligibleForActivation(u));if(!p.length){runAiActivations();return;}S.selected=p[0].id;render();}
const AI = createAI({ S, units, alive, eligibleForActivation, enemies, dist, BATTLEFIELD_WIDTH_IN, fieldHeightIn, shape, PX_PER_IN, canPlace, say, shoot, BOW_RANGE, beginCombatPhase });
const runAiActivation = AI.runAiActivation;
const runAiActivations = AI.runAiActivations;
function finishActivation(){const u=S.units[S.selected];if(!u||u.side!=="player"||u.activated||S.phase!=="movement")return;u.activated=true;S.mode=null;say(u.name+" completes its activation.");if(runAiActivation()){const next=units().find(v=>v.side==="player"&&eligibleForActivation(v));if(next){S.activationSide="player";S.selected=next.id;render();return;}}const next=units().find(v=>v.side==="player"&&eligibleForActivation(v));if(next){S.activationSide="player";S.selected=next.id;render();return;}runAiActivations();}
function beginCombatPhase(){if(units().some(u=>u.engaged&&alive(u))){setPhase("combat");}else{S.turn++;setPhase("charges");say("Turn "+S.turn+" begins.");}}
const COMBAT = createCombat({ S, units, alive, dist, meleeAttack, applyDamage, rankBonus, roll, say, diceStack, render, endTurn, finishBattle });
const { resolveCombat, resolveBreak } = COMBAT;
function endTurn(){units().forEach(u=>{u.charged=false;if(!alive(u)||!units().some(v=>v.side!==u.side&&alive(v)&&v.engaged&&dist(u,v)<4))u.engaged=false;});S.turn++;say("Turn "+S.turn+" begins.");setPhase("charges");}
function finishBattle(msg){S.finished=true;S.phase="over";say('<b>'+msg+'</b>');render();}
function reset(){S.turn=1;S.phase="charges";S.selected="pSword";S.mode=null;S.chargeSide="player";S.chargePasses=0;S.declaredCharges=[];S.activationSide="player";view.zoom=1;view.x=0;view.y=0;S.finished=false;S.combatRound=0;S.loser=null;S.crDiff=0;S.log=[];units().forEach(u=>Object.assign(u,{models:u.startModels,damage:0,x:(u.id==="pSword"||u.id==="pArch") ? 0.22 : 0.78,y:(u.id==="pSword"||u.id==="aSword") ? 0.36 : 0.70,facing:u.side==="player"?0:Math.PI,engaged:false,activated:false,moved:false,shot:false,charged:false,fled:false,moveUsed:0,shootCasualties:0,panicTested:false}));$("log").replaceChildren();say("Battle deployed: 20 swordsmen and 10 archers on each side.");render();}
const view={zoom:1,x:0,y:0};
$("logtoggle").onclick=()=>$("logpanel").classList.add("open");$("logclose").onclick=()=>$("logpanel").classList.remove("open");$("rollclose").onclick=()=>$("rollview").classList.remove("show");
window.addEventListener("resize",setupCanvas);
const RENDERING = createRendering({ canvas, ctx, S, units, alive, W, H, PX_PER_IN, BATTLEFIELD_WIDTH_IN, MODEL_BASE_IN, shape, view });
const { setupCanvas, draw } = RENDERING;
const INPUT = createInput({ canvas, S, view, W, H, units, alive, shape, PX_PER_IN, BATTLEFIELD_WIDTH_IN, canPlace, shoot, declareCharge, render, draw, $ });
reset();setupCanvas();
})();
}
;
