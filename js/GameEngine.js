import { createStartingUnits } from "./units.js";
import { createGameState } from "./gameState.js";
import { createAI } from "./ai.js";
import { createRules } from "./rules.js";
import { createShooting } from "./shooting.js";
import { createCombat } from "./combat.js";
import { createRendering } from "./rendering.js";
import { createInput } from "./input.js";
import { createUI } from "./ui.js";
import { createPhases } from "./phases.js";
import { createDice } from "./dice.js";
import { createMovement } from "./movement.js";

export function startGame() {
(() => {
"use strict";
const $ = id => document.getElementById(id);
const canvas = $("field"), ctx = canvas.getContext("2d");
const BATTLEFIELD_WIDTH_IN=48, MODEL_BASE_IN=.9, BOW_RANGE=24;
const S=createGameState(createStartingUnits());
const units=()=>Object.values(S.units), alive=u=>u.models>0;
const W=()=>canvas.clientWidth,H=()=>canvas.clientHeight,PX_PER_IN=()=>W()/BATTLEFIELD_WIDTH_IN,fieldHeightIn=()=>H()/Math.max(1,PX_PER_IN());
const enemies=u=>units().filter(v=>v.side!==u.side&&alive(v));
const MOVEMENT = createMovement({ W, H, PX_PER_IN, MODEL_BASE_IN, BATTLEFIELD_WIDTH_IN, fieldHeightIn, units, alive });
const { dist, shape, corners, overlap, canPlace } = MOVEMENT;
function say(msg){S.log.unshift(msg);S.log=S.log.slice(0,80);$("log").innerHTML=S.log.map(x=>'<div class="logentry">'+x+'</div>').join("");if(msg.includes("dice-stack")||msg.includes("dice-duel")){$("rollcontent").innerHTML=msg;$("rollview").classList.add("show");}if($("logpanel").classList.contains("open"))$("log").scrollTop=0;}
const DICE = createDice({ S });
const { roll, diceStack, diceDuel } = DICE;
function closestEnemy(u){return enemies(u).sort((a,b)=>dist(u,a)-dist(u,b))[0]||null;}
function selectedTarget(u){const list=enemies(u);return list.find(v=>v.id===S.targetId)||closestEnemy(u);}
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
const RENDERING = createRendering({ canvas, ctx, S, units, alive, W, H, PX_PER_IN, BATTLEFIELD_WIDTH_IN, MODEL_BASE_IN, shape, view });
const { setupCanvas, draw } = RENDERING;
function requestRender(){ render(); }
const PHASES = createPhases({ S, units, alive, shape, BATTLEFIELD_WIDTH_IN, dist, enemies, say, shoot, render:requestRender, startActivations });
const { setPhase, declareCharge, finishMovement, passCharges, aiChargeStep, resolveDeclaredCharges } = PHASES;
const UI = createUI({ S, $, units, draw, BOW_RANGE, selectedTarget, dist, passCharges, finishActivation, resolveCombat, endTurn, resolveBreak, reset });
const { render } = UI;
const INPUT = createInput({ canvas, S, view, W, H, units, alive, shape, PX_PER_IN, BATTLEFIELD_WIDTH_IN, canPlace, shoot, declareCharge, render, draw, $ });
reset();setupCanvas();
})();
}
;
