import { createUnitsFromArmy, buildOpponentArmy } from "./units.js";
import { createArmyBuilder } from "./armyBuilder.js";
import { createCollectionManager } from "./collection.js";
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
import { createNarrativeCampaign } from "./campaign.js";
import { generateSkirmishTerrain } from "./terrain.js";

export function startGame() {
(() => {
"use strict";
const $ = id => document.getElementById(id);
const canvas = $("field"), ctx = canvas.getContext("2d");
const BATTLEFIELD_WIDTH_IN=48, MODEL_BASE_IN=.9, BOW_RANGE=24;
const S=createGameState({});S.terrain=[];S.terrainTool="off";
const units=()=>Object.values(S.units), alive=u=>!!u&&(u.models>0||(u.attachedCharacters||[]).some(id=>S.units[id]&&S.units[id].models>0));
const W=()=>canvas.clientWidth,H=()=>canvas.clientHeight,PX_PER_IN=()=>W()/BATTLEFIELD_WIDTH_IN,fieldHeightIn=()=>H()/Math.max(1,PX_PER_IN());
const enemies=u=>units().filter(v=>v.side!==u.side&&alive(v)&&!v.attachedTo);
const MOVEMENT = createMovement({ W, H, PX_PER_IN, MODEL_BASE_IN, BATTLEFIELD_WIDTH_IN, fieldHeightIn, units, alive, terrain:()=>S.terrain });
const { dist, shape, corners, overlap, canPlace } = MOVEMENT;
function validDeployment(u,x,y,f){const poly=corners(u,x,y,f),w=W(),h=H(),scout=!!u.canDeployAnywhere||(u.attachedCharacters||[]).some(id=>S.units[id]?.models>0&&!S.units[id]?.fled&&S.units[id]?.canDeployAnywhere),maxX=scout?w-1:w/2-1;return canPlace(u,x,y,f)&&poly.every(p=>p.x>=1&&p.y>=1&&p.x<=maxX&&p.y<=h-1);}
function playCombatDiceQueue(){if(S.combatDicePlaying||!S.combatDiceQueue?.length)return;S.combatDicePlaying=true;const showNext=()=>{const next=S.combatDiceQueue.shift();if(!next){S.combatDicePlaying=false;return;}const content=$("rollcontent");const entry=document.createElement("div");entry.className="combat-roll-entry";entry.innerHTML=next;content.append(entry);$("rollview").classList.add("show");content.scrollTop=content.scrollHeight;setTimeout(showNext,950);};showNext();}
function say(msg){S.log.unshift(msg);S.log=S.log.slice(0,80);$("log").innerHTML=S.log.map(x=>'<div class="logentry">'+x+'</div>').join("");if(msg.includes("dice-stack")||msg.includes("dice-duel")){if(S.phase==="combat"){S.combatDiceQueue=S.combatDiceQueue||[];S.combatDiceQueue.push(msg);playCombatDiceQueue();}else{$("rollcontent").innerHTML=msg;$("rollview").classList.add("show");}}if($("logpanel").classList.contains("open"))$("log").scrollTop=0;}
const DICE = createDice({ S });
const { roll, diceStack, diceDuel } = DICE;
function closestEnemy(u){return enemies(u).sort((a,b)=>dist(u,a)-dist(u,b))[0]||null;}
function leadership(u){
  if(!u)return 0;
  const embedded=(u.attachedCharacters||[]).map(id=>S.units[id]).filter(h=>h&&h.models>0&&!h.fled);
  const general=units().find(h=>h.isGeneral&&h.models>0&&!h.fled&&h.side===u.side);
  const generalLd=general&&general.id!==u.id&&dist(u,general)<=12?general.stats.Ld:0;
  return Math.max(u.stats.Ld,...embedded.map(h=>h.stats.Ld),generalLd);
}
function panicNearby(source,reason="a nearby friendly unit is lost"){
  if(!source)return;
  units().filter(v=>v!==source&&!v.attachedTo&&v.side===source.side&&alive(v)&&!v.fled&&!v.panicTested&&dist(v,source)<=6).forEach(v=>{
    v.panicTested=true;const ld=leadership(v),dice=roll(2),total=dice[0]+dice[1],snakeEyes=dice[0]===1&&dice[1]===1;
    say("Panic test — "+v.name+" ("+reason+"): "+dice.join(" + ")+" = "+total+" against Leadership "+ld+".");
    if(!snakeEyes&&total>ld){v.fled=true;v.engaged=false;v.engagedWith=null;say(v.name+" panics and flees.");}
    else if(snakeEyes)say("Snake eyes! "+v.name+" automatically holds.");
    else say(v.name+" holds.");
  });
}

function selectedTarget(u){const list=enemies(u);if(S.mode==="shoot"&&S.targetId===null)return null;return list.find(v=>v.id===S.targetId)||closestEnemy(u);}
function equipMeleeWeapon(u,weapon){if(!u||!(u.meleeWeapons||["handWeapon"]).includes(weapon))return false;u.weapon=weapon;u.spears=weapon==="spear"&&!!u.hasSpear;u.greatWeapon=weapon==="greatWeapon";u.shield=!!u.ownsShield&&(weapon==="spear"||(!["greatWeapon","halberd"].includes(weapon)&&(!u.hasRangedWeapon||u.rangedMode==="shield")));return true;}
function setRangedMode(u,mode){if(!u||!u.hasRangedWeapon||!u.ownsShield||u.shot||!["bow","shield"].includes(mode))return false;u.rangedMode=mode;u.shield=mode==="shield";if(["greatWeapon","halberd"].includes(u.weapon))u.shield=false;return true;}
function eligibleForActivation(u){return alive(u)&&!u.attachedTo&&!u.fled&&!u.engaged&&!u.activated;}
function canCharge(u,target){
  const dx=(target.x-u.x)*W(),dy=(target.y-u.y)*H(),bearing=Math.atan2(dy,dx),length=Math.hypot(dx,dy);if(length<1)return false;
  let delta=bearing-(u.facing||0);while(delta>Math.PI)delta-=Math.PI*2;while(delta< -Math.PI)delta+=Math.PI*2;
  const targetRadius=Math.hypot(shape(target).front,shape(target).depth)/2,arcAllowance=Math.asin(Math.min(.999,targetRadius/length));
  if(Math.abs(delta)>Math.PI/4+arcAllowance+0.0001)return false;
  return !units().some(v=>v!==u&&v!==target&&alive(v)&&!v.fled&&(()=>{const vx=(v.x-u.x)*W(),vy=(v.y-u.y)*H(),t=Math.max(0,Math.min(1,(vx*dx+vy*dy)/(length*length))),px=t*dx,py=t*dy,clear=Math.hypot(vx-px,vy-py),radius=Math.max(shape(v).front,shape(v).depth)*0.45;return t>0.03&&t<0.97&&clear<radius;})());
}
function pursueAfterBreak(winner,loser,choice=null){
  if(winner.side==="player"&&!choice){S.pendingPursuit={winnerId:winner.id,loserId:loser.id};say(winner.name+" has broken "+loser.name+". Choose whether to pursue or hold position.");return true;}
  if(choice==="hold"){say(winner.name+" holds position instead of pursuing.");return false;}
  const fleeDice=roll(2),pursuitDice=roll(2),fleeDistance=fleeDice[0]+fleeDice[1],pursuitDistance=pursuitDice[0]+pursuitDice[1];
  const dx=(loser.x-winner.x)*W(),dy=(loser.y-winner.y)*H(),len=Math.max(1,Math.hypot(dx,dy)),nx=dx/len,ny=dy/len;
  const clearPair=u=>{u.engaged=false;u.engagedWith=null;u.engagedWithIds=[];u.engagementSides={};u.engagedSide=null;u.chargedSide=null;u.attackedFromSide=null;u.flankedBy=null;};
  clearPair(winner);clearPair(loser);
  say("Pursuit: "+winner.name+" rolls "+pursuitDice.join(" + ")+" = "+pursuitDistance+"; "+loser.name+" flees "+fleeDice.join(" + ")+" = "+fleeDistance+".");
  if(pursuitDistance>=fleeDistance){loser.models=0;loser.fled=false;say(winner.name+" catches and destroys "+loser.name+".");panicNearby(loser,"a friendly unit is destroyed in combat");}
  else {const px=fleeDistance*PX_PER_IN();loser.x+=nx*px/W();loser.y+=ny*px/H();const pursuePx=pursuitDistance*PX_PER_IN();winner.x+=nx*pursuePx/W();winner.y+=ny*pursuePx/H();loser.fled=true;winner.charged=true;say(loser.name+" escapes; "+winner.name+" pursues "+pursuitDistance+'".');if(loser.x<0||loser.x>1||loser.y<0||loser.y>1){loser.models=0;loser.fled=false;say(loser.name+" flees off the battlefield.");panicNearby(loser,"a friendly unit flees off the battlefield");}else panicNearby(loser,"a friendly unit flees from combat");}
}

const RULES = createRules({ roll, units });
const { rankBonus, hitTarget, woundTarget, saveTarget, applyDamage, meleeAttack, shootingAttack } = RULES;
const SHOOTING = createShooting({ S, units, alive, dist, BOW_RANGE, roll, woundTarget, saveTarget, applyDamage, say, diceStack, $, shootingAttack, panicNearby, shape, corners, W, H, terrain:()=>S.terrain, BATTLEFIELD_WIDTH_IN });
const { shoot, fireCannon } = SHOOTING;
function resolvePursuit(choice){const pending=S.pendingPursuit;if(!pending)return;S.pendingPursuit=null;const winner=S.units[pending.winnerId],loser=S.units[pending.loserId];if(winner&&loser)pursueAfterBreak(winner,loser,choice);if(units().filter(alive).every(v=>v.fled)||units().filter(v=>v.side==="player"&&alive(v)).length===0||units().filter(v=>v.side==="ai"&&alive(v)).length===0){finishBattle(units().some(v=>v.side==="player"&&alive(v)&&!v.fled)?"Player wins the battle!":"Opponent wins the battle!");return;}if(continueBreakTests())return;S.phase="combat";S.combatResolved=true;render();}
function startActivations(){S.activationSide="player";units().filter(u=>u.side==="ai"&&u.fled&&alive(u)).forEach(rallyUnit);const p=units().filter(u=>u.side==="player"&&eligibleForActivation(u));if(!p.length){runAiActivations();return;}S.selected=p[0].id;render();}
const AI = createAI({ S, units, alive, eligibleForActivation, enemies, dist, BATTLEFIELD_WIDTH_IN, fieldHeightIn, shape, PX_PER_IN, canPlace, say, shoot, BOW_RANGE, beginCombatPhase, terrain:()=>S.terrain });
const runAiActivation = AI.runAiActivation;
const runAiActivations = AI.runAiActivations;
function finishActivation(){const u=S.units[S.selected];if(!u||u.side!=="player"||u.activated||S.phase!=="movement")return;u.activated=true;S.mode=null;say(u.name+" completes its activation.");if(runAiActivation()){const next=units().find(v=>v.side==="player"&&eligibleForActivation(v));if(next){S.activationSide="player";S.selected=next.id;render();return;}}const next=units().find(v=>v.side==="player"&&eligibleForActivation(v));if(next){S.activationSide="player";S.selected=next.id;render();return;}runAiActivations();}
function rallyUnit(u){if(!u||!u.fled)return;if(u.models*4<u.startModels){say(u.name+" is below a quarter of its starting strength and cannot rally.");return;}const ld=leadership(u),dice=roll(2),total=dice[0]+dice[1];say("Rally test — "+u.name+": "+dice.join(" + ")+" = "+total+" against Leadership "+ld+".");if(total<=ld){u.fled=false;u.moveUsed=u.stats.M;u.activated=true;say(u.name+" rallies, but cannot move further this turn.");}else{const foe=closestEnemy(u),dx=foe?(u.x-foe.x)*W():Math.cos(u.facing+Math.PI)*W(),dy=foe?(u.y-foe.y)*H():Math.sin(u.facing+Math.PI)*H(),len=Math.max(1,Math.hypot(dx,dy)),distanceRoll=roll(2),distance=distanceRoll[0]+distanceRoll[1],px=distance*PX_PER_IN();u.x+=dx/len*px/W();u.y+=dy/len*px/H();say(u.name+" fails to rally and flees "+distance+" inches ("+distanceRoll.join(" + ")+").");if(u.x<0||u.x>1||u.y<0||u.y>1){u.models=0;u.fled=false;say(u.name+" flees off the battlefield.");}}render();}
function beginCombatPhase(){const playerReady=units().some(u=>u.side==="player"&&alive(u)&&!u.fled),aiReady=units().some(u=>u.side==="ai"&&alive(u)&&!u.fled);if(!playerReady||!aiReady){finishBattle(playerReady?"Player wins the battle!":"Opponent wins the battle!");return;}if(units().some(u=>u.engaged&&alive(u))){setPhase("combat");}else{S.turn++;setPhase("charges");say("Turn "+S.turn+" begins.");}}
function reformCombatPairs(){const pairs=[];units().filter(u=>u.engaged&&alive(u)).forEach(u=>{const v=u.engagedWith?S.units[u.engagedWith]:null;if(v&&alive(v)&&v.engagedWith===u.id&&!pairs.some(p=>p.includes(u)||p.includes(v)))pairs.push([u,v]);});if(pairs.length!==1)return;const [a,b]=pairs[0];if(!a.engaged||!b.engaged)return;const defender=[a,b].find(u=>["left","right","rear"].includes(u.attackedFromSide)&&u.flankedBy===([a,b].find(v=>v!==u)?.id));if(defender){const enemy=defender===a?b:a;const oldRanks=shape(defender).ranks;defender.formationWidth=Math.max(1,Math.min(defender.models,oldRanks+1,Math.max(1,enemy.formationWidth||5)));say(defender.name+" turns to face "+enemy.name+" and reforms to "+defender.formationWidth+" files. Its disrupted rank bonus and the flank bonus end for the next round.");}else say("The engaged units turn to face each other before the next round.");const dx=(b.x-a.x)*W(),dy=(b.y-a.y)*H(),angle=Math.atan2(dy,dx);a.facing=angle;b.facing=angle+Math.PI;const gap=(shape(a).depth+shape(b).depth)/2,midX=(a.x+b.x)/2,midY=(a.y+b.y)/2;a.x=midX-Math.cos(angle)*gap/2/W();a.y=midY-Math.sin(angle)*gap/2/H();b.x=midX+Math.cos(angle)*gap/2/W();b.y=midY+Math.sin(angle)*gap/2/H();for(const u of [a,b]){u.engagedSide="front";u.chargedSide="front";u.attackedFromSide="front";u.flankedBy=null;}}
let render = () => {};
const COMBAT = createCombat({ S, units, alive, dist, meleeAttack, applyDamage, rankBonus, roll, say, diceStack, render: () => render(), endTurn, finishBattle, reformCombatPairs, pursueAfterBreak, panicNearby, leadership });
const { resolveCombat, resolveBreak, continueBreakTests } = COMBAT;
function endTurn(){S.combatResolved=false;units().forEach(u=>{u.charged=false;u.defendedWallCombat=false;if(!alive(u)||u.fled||!u.engagedWith||!alive(S.units[u.engagedWith])||S.units[u.engagedWith].fled){u.engaged=false;u.engagedWith=null;u.engagedSide=null;u.chargedSide=null;u.attackedFromSide=null;u.flankedBy=null;}});S.turn++;say("Turn "+S.turn+" begins.");setPhase("charges");}
function finishBattle(msg){
 if(S.finished)return;
 S.finished=true;S.phase="over";
 const won=msg.toLowerCase().includes("player wins");
 if(won&&collectionManager&&!campaignBattle){collectionManager.grantLootbox("skirmish");say("Skirmish victory reward: one lootbox added to your collection.");}
 say('<b>'+msg+'</b>');
 if(campaignBattle){campaignBattle=false;narrativeCampaign?.onBattleFinished(won);$("battle-return").hidden=true;return;}
 $("battle-return").hidden=false;
 render();
}
function reset(){S.terrain=S.autoTerrain?generateSkirmishTerrain(S.terrainSeed||Date.now()):[];S.terrainDraft=null;S.terrainTool="off";S.turn=1;S.phase="deployment";S.mode=null;S.chargeSide="player";S.chargePasses=0;S.declaredCharges=[];S.activationSide="player";view.zoom=1;view.x=0;view.y=0;S.finished=false;S.combatRound=0;S.loser=null;S.crDiff=0;S.breakTests=[];S.log=[];S.combatDiceQueue=[];$("rollcontent").replaceChildren();const all=units();S.selected=all.find(u=>u.side==="player")?.id||null;all.forEach(u=>{const sideUnits=all.filter(v=>v.side===u.side),index=sideUnits.indexOf(u);Object.assign(u,{models:u.startModels,damage:0,artilleryWounds:u.artilleryStartWounds??u.artilleryWounds,x:u.side==="player"?.22:.78,y:(index+1)/(sideUnits.length+1),facing:u.side==="player"?0:Math.PI,deployed:u.side==="ai",engaged:false,engagedWith:null,engagedWithIds:[],engagementSides:{},engagedSide:null,chargedSide:null,attackedFromSide:null,flankedBy:null,formationWidth:u.isSiegeEngine?3:5,skirmishing:!!u.isSiegeEngine,skirmishCombatRound:0,wallDefence:null,defendedWallCombat:false,cover:u.isSiegeEngine?"soft":null,fleeingCharge:false,activated:false,moved:false,shot:false,charged:false,fled:false,moveUsed:0,shootCasualties:0,panicTested:false,delayedDeath:false,delayedDeathSnapshot:null});u.stats.M=u.baseMove??u.stats.M;u.characterWounds=u.isCharacter?u.stats.W:null;u.delayedDeath=false;u.delayedDeathSnapshot=null;u.championAlive=!!u.champion?.enabled;u.championWounds=u.championAlive?u.stats.W:0;});all.filter(u=>!u.isCharacter).forEach(host=>{host.stats.M=host.baseMove??host.stats.M;(host.attachedCharacters||[]).forEach(id=>{const hero=S.units[id];if(hero&&hero.models>0)host.stats.M=Math.min(host.stats.M,hero.stats.M);});});$("log").replaceChildren();$("logpanel").classList.remove("open");$("rollview").classList.remove("show");say("Deployment: select a unit card, tap your half of the field to place it, and rotate as needed. The opponent's deployment is hidden until you are ready.");render();}
const view={zoom:1,x:0,y:0};
const RENDERING = createRendering({ canvas, ctx, S, units, alive, W, H, PX_PER_IN, BATTLEFIELD_WIDTH_IN, MODEL_BASE_IN, shape, view });
const { setupCanvas, draw } = RENDERING;
function requestRender(){ render(); }
const PHASES = createPhases({ S, units, alive, shape, BATTLEFIELD_WIDTH_IN, fieldHeightIn, W, H, PX_PER_IN, BOW_RANGE, roll, dist, enemies, say, shoot, render:requestRender, startActivations, canPlace, canCharge });
const { setPhase, declareCharge, fleeFromCharge, finishMovement, passCharges, aiChargeStep, resolveDeclaredCharges } = PHASES;
const UI = createUI({ S, $, units, alive, draw, W, H, BOW_RANGE, selectedTarget, dist, passCharges, finishActivation, resolveCombat, endTurn, resolveBreak, resolvePursuit, reset, validDeployment, canPlace, rallyUnit, fleeFromCharge, say, equipMeleeWeapon, setRangedMode, shape, PX_PER_IN, terrain:()=>S.terrain, BATTLEFIELD_WIDTH_IN, startBattle:()=>{setPhase("charges");say("Battle begins! The opponent's deployment is revealed.");} });
render = UI.render;
const INPUT = createInput({ canvas, S, view, W, H, units, alive, shape, PX_PER_IN, BATTLEFIELD_WIDTH_IN, canPlace, validDeployment, shoot, fireCannon, declareCharge, render, draw, $, say, dist, terrain:()=>S.terrain });

function startBattleWithArmy(army,faction){campaignBattle=false;S.autoTerrain=true;S.terrainSeed=Date.now();const playerForce=createUnitsFromArmy(army,faction),aiRoster=buildOpponentArmy(army,faction),aiForce=createUnitsFromArmy(aiRoster,faction);S.units={...Object.fromEntries(Object.entries(playerForce).filter(([id])=>id.startsWith("p"))),...Object.fromEntries(Object.entries(aiForce).filter(([id])=>id.startsWith("a")))};const playerPoints=units().filter(u=>u.side==="player").reduce((sum,u)=>sum+(u.points||0),0),aiPoints=units().filter(u=>u.side==="ai").reduce((sum,u)=>sum+(u.points||0),0);$("mainmenu").hidden=true;$("mode-screen").hidden=true;$("campaign-screen").hidden=true;$("collection-screen").hidden=true;$("armybuilder").hidden=true;$("game").hidden=false;reset();say("Skirmish forces: your army "+playerPoints+" pts; opponent "+aiPoints+" pts ("+(aiPoints>=playerPoints?"+"+(aiPoints-playerPoints):"−"+(playerPoints-aiPoints))+" pts).");setupCanvas();}
function startCampaignBattle(army,enemyConfig){
 S.autoTerrain=true;S.terrainSeed=Date.now();const playerUnits=createUnitsFromArmy(army,"empire");
 const enemyPair=createUnitsFromArmy([{type:"swordsmen",models:20,weapon:"handWeapon",champion:false}], "empire");
 const enemy=enemyPair.a1;enemy.id="a1";enemy.side="ai";enemy.name="Enemy Human Swordsmen";enemy.x=.78;enemy.y=.5;enemy.facing=Math.PI;enemy.deployed=true;
 S.units={...Object.fromEntries(Object.entries(playerUnits).filter(([id])=>id.startsWith("p"))),a1:enemy};
 campaignBattle=true;$("mainmenu").hidden=true;$("mode-screen").hidden=true;$("campaign-screen").hidden=true;$("collection-screen").hidden=true;$("armybuilder").hidden=true;$("game").hidden=false;reset();setupCanvas();
}
function showMainMenu(){$("game").hidden=true;$("armybuilder").hidden=true;$("collection-screen").hidden=true;$("mode-screen").hidden=true;$("campaign-screen").hidden=true;$("mainmenu").hidden=false;}
function showCollection(){$("game").hidden=true;$("armybuilder").hidden=true;$("mode-screen").hidden=true;$("mainmenu").hidden=true;$("collection-screen").hidden=false;}
function showSkirmishBuilder(){$("game").hidden=true;$("mainmenu").hidden=true;$("mode-screen").hidden=true;$("collection-screen").hidden=true;$("armybuilder").hidden=false;armyBuilder?.open();}
let collectionManager=null;
let narrativeCampaign=null;
let campaignBattle=false;
function validateArmy(army,faction){
 if(collectionManager?.getBypass())return "";
 const owned=collectionManager?.getInventory()||[],used=new Set(),shortages=[];
 for(const entry of army){
  if(entry.type==="cannon"||entry.type==="boltThrower"){if(entry.type==="cannon"&&faction==="highElves")shortages.push("Cannons are only available to the Empire.");if(entry.type==="boltThrower"&&faction!=="highElves")shortages.push("Bolt throwers are only available to the High Elves.");continue;}
  const character=["captain","lord","legendaryLord","shadowElf"].includes(entry.type),collectionType=["legendaryLord","shadowElf"].includes(entry.type)?"lord":entry.type;
  const count=character?1:(entry.models||1);
  const mounted=entry.type==="cavalry"||(character&&!!entry.mounted);
  const matches=owned.filter(m=>!used.has(m.id)&&m.faction===faction&&(m.type===collectionType||(["swordsmen","archers"].includes(entry.type)&&["swordsmen","archers"].includes(m.type)))&&!!m.mounted===mounted);
  if(matches.length<count)shortages.push((count-matches.length)+" "+entry.type+" model(s) needed"+(mounted?" mounted":""));
  matches.slice(0,count).forEach(m=>used.add(m.id));
 }
 return shortages.length?"Not enough matching miniatures: "+shortages.join("; ")+". Add models in your Collection, or enable the developer bypass.":"";
}
let armyBuilder=null;
armyBuilder=createArmyBuilder({ $, onStart:startBattleWithArmy, onBack:showCollection, validateArmy });
narrativeCampaign=createNarrativeCampaign({$,onStartBattle:startCampaignBattle,onReturnMenu:showMainMenu});
collectionManager=createCollectionManager({$,onSkirmish:showSkirmishBuilder,onMainMenu:showMainMenu,onNarrativeCampaign:()=>narrativeCampaign.open()});
$("battle-return").addEventListener("click",()=>{ $("battle-return").hidden=true;showCollection();collectionManager?.open();});
})();
}
;
