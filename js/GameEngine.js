import { createUnitsFromArmy, buildOpponentArmy, unitCost } from "./units.js?v=20261022-ai-battle-lab-v2";
import { FACTIONS } from "./factions.js?v=20261020-thaurgath-v2";
import { createRoguelike } from "./roguelike.js?v=20261020-chariots-v2";
import { createWarband } from "./warband.js?v=20261020-warband-v1";
import { createWarbandExpedition } from "./warbandExpedition.js?v=20261020-warband-expedition-v4";
import { createArmyBuilder } from "./armyBuilder.js?v=20261021-wyvern-roster-v1";
import { createCollectionManager } from "./collection.js?v=20261021-wyvern-roster-v1";
import { createGameState } from "./gameState.js";
import { createAI } from "./ai.js?v=20261022-ai-battle-lab-v2";
import { createRules } from "./rules.js?v=20261020-wood-elf-v1";
import { createShooting } from "./shooting.js?v=20261020-vision-v1";
import { createCombat } from "./combat.js?v=20261020-wood-elf-v1";
import { createRendering } from "./rendering.js?v=20261021-charge-indicators-v1";
import { createInput } from "./input.js?v=20261021-flying-wall-pan-guard-v1";
import { createUI } from "./ui.js?v=20261021-character-undo-v1";
import { createPhases } from "./phases.js?v=20261022-ai-battle-lab-v2";
import { createDice } from "./dice.js";
import { createMovement } from "./movement.js?v=20261021-fly-over-walls-v1";
import { createNarrativeCampaign } from "./campaign.js";
import { generateSkirmishTerrain, generateRiverCrossingCastleTerrain } from "./terrain.js?v=20261021-river-crossing-castles-v5";
import { createVision } from "./vision.js?v=20261020-vision-v1";

export function startGame() {
(() => {
"use strict";
const $ = id => document.getElementById(id);
const canvas = $("field"), ctx = canvas.getContext("2d");
const BATTLEFIELD_WIDTH_IN=48, MODEL_BASE_IN=.9, BOW_RANGE=24;
const S=createGameState({});S.terrain=[];S.remainsInPlaySpells=[];S.pendingDome=null;S.terrainTool="off";S.battleType="skirmish";S.siegeRole="attacker";
const units=()=>Object.values(S.units), alive=u=>!!u&&(u.models>0||(u.attachedCharacters||[]).some(id=>S.units[id]&&S.units[id].models>0));
const BATTLEFIELD_HEIGHT_IN=36,W=()=>BATTLEFIELD_WIDTH_IN*20,H=()=>BATTLEFIELD_HEIGHT_IN*20,PX_PER_IN=()=>20,fieldHeightIn=()=>BATTLEFIELD_HEIGHT_IN;
const enemies=u=>units().filter(v=>v.side!==u.side&&alive(v)&&!v.attachedTo);
const MOVEMENT = createMovement({ W, H, PX_PER_IN, MODEL_BASE_IN, BATTLEFIELD_WIDTH_IN, fieldHeightIn, units, alive, terrain:()=>S.terrain, canPassGate:u=>S.battleType==="siege"&&((u.side==="player")===(S.siegeRole==="defender")) });
const { dist, shape, corners, overlap, canPlace } = MOVEMENT;
const VISION=createVision({S,units,alive,dist,terrain:()=>S.terrain,W,H,shape,BATTLEFIELD_WIDTH_IN,fieldHeightIn});
const {isUnitVisible,visibleEnemies,aiLastKnownTargets,revealUnit,beginMovementPhase,updateAiMemory}=VISION;
function hasPriorityRule(u){return !!u&&(!!u.priorityActivation||!!u.reserveDeployRule||(u.attachedCharacters||[]).some(id=>S.units[id]?.models>0&&S.units[id]?.priorityActivation));}
 function canUseNeutralZone(u){return !!u&&(!!u.canDeployNeutral||(u.attachedCharacters||[]).some(id=>S.units[id]?.models>0&&S.units[id]?.canDeployNeutral));}
 function validDeployment(u,x,y,f){const poly=corners(u,x,y,f),w=W(),h=H(),scout=!!u.canDeployAnywhere||(u.attachedCharacters||[]).some(id=>S.units[id]?.models>0&&!S.units[id]?.fled&&S.units[id]?.canDeployAnywhere);if(S.battleType==="siege"){const castle=(S.terrain||[]).find(t=>t.type==="siegeCastle");if(!castle)return false;const playerDefends=S.siegeRole==="defender",isDefender=(u.side==="player")===playerDefends,inch=PX_PER_IN(),mx=12*inch/w,my=12*inch/h,wallPad=1.25*inch/w,wallPadY=1.25*inch/h;const inBounds=poly.every(p=>p.x>=1&&p.y>=1&&p.x<=w-1&&p.y<=h-1);const inCastle=x>=castle.left-wallPad&&x<=castle.right+wallPad&&y>=castle.top-wallPadY&&y<=castle.bottom+wallPadY;const outsideRing=x>=castle.left-mx&&x<=castle.right+mx&&y>=castle.top-my&&y<=castle.bottom+my;const customZoneOk=!S.customSiegeMap||(S.customSiegeMap.approach==="north"?y<castle.top-.015:S.customSiegeMap.approach==="east"?x>castle.right+.12:S.customSiegeMap.approach==="south"?y>castle.bottom+.015:x<castle.left-.015);const insideInterior=x>castle.left&&x<castle.right&&y>castle.top&&y<castle.bottom;if(!inBounds||(isDefender?!inCastle:(!outsideRing||insideInterior||!customZoneOk)))return false;if(!isDefender){const minWallDistance=12*inch+Math.hypot(shape(u).front,shape(u).depth)/2,castleWalls=(S.terrain||[]).filter(t=>(t.type==="wall"||t.type==="gate")&&t.castle&&(t.wounds??2)>0),cx=x*w,cy=y*h;for(const wall of castleWalls){const ax=wall.x1*w,ay=wall.y1*h,bx=wall.x2*w,by=wall.y2*h,dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((cx-ax)*dx+(cy-ay)*dy)/l2)),d=Math.hypot(cx-(ax+dx*t),cy-(ay+dy*t));if(d<minWallDistance)return false;}}const priorLevel=u.wallLevel,priorSegment=u.wallSegment,priorDefence=u.wallDefence;if(isDefender){const px=x*w,py=y*h;let nearest=null,nearestD=Infinity;for(const wall of (S.terrain||[]).filter(t=>(t.type==="wall"||t.type==="gate")&&t.castle&&(t.wounds??2)>0)){const ax=wall.x1*w,ay=wall.y1*h,bx=wall.x2*w,by=wall.y2*h,dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/l2)),d=Math.hypot(px-(ax+dx*t),py-(ay+dy*t));if(d<nearestD){nearestD=d;nearest=wall;}}if(nearest&&nearestD<=1.25*inch){u.wallLevel=true;u.wallSegment=nearest;u.wallDefence={wall:nearest,posture:"active"};}}const placeable=canPlace(u,x,y,f);u.wallLevel=priorLevel;u.wallSegment=priorSegment;u.wallDefence=priorDefence;return placeable;}const neutral=canUseNeutralZone(u),minX=scout?1:neutral?w/3+1:u.side==="player"?1:2*w/3+1,maxX=scout?w-1:neutral?2*w/3-1:u.side==="player"?w/3-1:w-1;return canPlace(u,x,y,f)&&poly.every(p=>p.x>=minX&&p.y>=1&&p.x<=maxX&&p.y<=h-1);}
function playCombatDiceQueue(){if(S.combatDicePlaying||!S.combatDiceQueue?.length)return;S.combatDicePlaying=true;const showNext=()=>{const next=S.combatDiceQueue.shift();if(!next){S.combatDicePlaying=false;return;}const content=$("rollcontent");const entry=document.createElement("div");entry.className="combat-roll-entry";entry.innerHTML=next;content.append(entry);$("rollview").classList.add("show");content.scrollTop=content.scrollHeight;setTimeout(showNext,950);};showNext();}
function say(msg){S.log.unshift(msg);S.log=S.log.slice(0,80);$("log").innerHTML=S.log.map(x=>'<div class="logentry">'+x+'</div>').join("");if(msg.includes("dice-stack")||msg.includes("dice-duel")){if(S.phase==="combat"){S.combatDiceQueue=S.combatDiceQueue||[];S.combatDiceQueue.push(msg);playCombatDiceQueue();}else{$("rollcontent").innerHTML=msg;$("rollview").classList.add("show");}}if($("logpanel").classList.contains("open"))$("log").scrollTop=0;}
const DICE = createDice({ S });
const { roll, diceStack, diceDuel } = DICE;
function psychologyType(u){return !u?null:(u.causesTerror||u.isDragon||u.isDragonRider)?"terror":u.causesFear?"fear":null;}
function causesFear(u){return psychologyType(u)!==null;}
function immuneToFear(u){return !!u&&(!!u.immuneToPsychology||!!u.immuneToFear);}
function unitStrength(u){if(!u)return 0;if(Number.isFinite(u.unitStrength))return u.unitStrength;if(u.isDragon||u.isDragonRider)return 6;if(u.isCavalry)return Math.max(0,u.models)*2;return Math.max(0,u.models||0);}
function clearEngagement(u){if(!u)return;(u.engagedWithIds||[]).forEach(id=>{const v=S.units[id];if(v){v.engagedWithIds=(v.engagedWithIds||[]).filter(x=>x!==u.id);v.engagedWith=v.engagedWithIds[0]||null;if(!v.engagedWithIds.length)v.engaged=false;}});u.engaged=false;u.engagedWith=null;u.engagedWithIds=[];u.engagementSides={};u.engagedSide=null;}
function testPsychology(u,source,kind,reason){if(!u||immuneToFear(u))return true;const subjectType=psychologyType(u),sourceType=psychologyType(source);if(kind==="terror"&&subjectType==="terror")return true;if(kind==="fear"&&subjectType==="fear"&&sourceType==="fear")return true;if(kind==="terror"&&u.terrorTested)kind="fear";if(kind==="terror")u.terrorTested=true;const dice=roll(2),total=dice[0]+dice[1],ld=leadership(u),passed=total<=ld;say((kind==="terror"?"Terror":"Fear")+" test — "+u.name+(source?" faces "+source.name:"")+": "+dice.join(" + ")+" = "+total+" against Leadership "+ld+".");if(passed){say(u.name+" overcomes its "+kind+".");return true;}say(u.name+" fails its "+kind+" test.");if(kind==="terror"||(reason!=="charging"&&source&&unitStrength(u)<unitStrength(source))){u.fled=true;u.terrorFledThisTurn=reason==="turn-start";if(u.terrorFledThisTurn)u.terrorFledTurn=S.turn;u.fleeingCharge=reason==="charged";clearEngagement(u);say(u.name+" flees in terror/fear.");return false;}if(kind==="fear"&&source&&reason==="charged"){u.failedFearAgainst=source.id;u.failedFearCombatRound=S.combatRound+1;}u.failedFearCharge=reason==="charging";return false;}
function testTerrorAtTurnStart(){units().forEach(u=>{u.terrorFledThisTurn=false;u.failedFearCharge=false;u.failedFearAgainst=null;u.failedFearCombatRound=null;});units().filter(u=>alive(u)&&!u.fled&&!u.attachedTo&&!immuneToFear(u)&&psychologyType(u)!=="terror").forEach(u=>{const terror=enemies(u).filter(e=>psychologyType(e)==="terror"&&dist(u,e)<=6).sort((a,b)=>dist(u,a)-dist(u,b))[0];if(terror&&!u.terrorTested)testPsychology(u,terror,"terror","turn-start");});}
function testChargePsychology(charger,target){const targetType=psychologyType(target),chargerType=psychologyType(charger);if(targetType&&!immuneToFear(charger)){const kind=targetType==="terror"&&chargerType!=="fear"&&!charger.terrorTested?"terror":"fear";const passed=testPsychology(charger,target,kind,"charging");if(!passed){if(!charger.fled){charger.moveUsed=charger.stats.M;charger.activated=true;say(charger.name+" cannot charge "+target.name+" and remains stationary.");}return {allowed:false};}}let targetFlees=false;if(chargerType&&!immuneToFear(target)){const kind=chargerType==="terror"&&targetType!=="fear"&&!target.terrorTested?"terror":"fear";const passed=testPsychology(target,charger,kind,"charged");if(!passed&&target.fled)targetFlees=true;}return {allowed:true,targetFlees};}
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
  units().filter(v=>v!==source&&!v.attachedTo&&v.side===source.side&&alive(v)&&!v.fled&&!v.panicTested&&dist(v,source)<=6&&!(String(reason).includes("flees")&&source.faction==="greenskins"&&["goblins","wolfRiders"].includes(source.greenskinType)&&["orcBoyz","boarBoyz","orcHero","orcLord"].includes(v.greenskinType))).forEach(v=>{
    v.panicTested=true;const ld=leadership(v),dice=roll(2),total=dice[0]+dice[1],snakeEyes=dice[0]===1&&dice[1]===1;
    say("Panic test — "+v.name+" ("+reason+"): "+dice.join(" + ")+" = "+total+" against Leadership "+ld+".");
    if(!snakeEyes&&total>ld){v.fled=true;v.engaged=false;v.engagedWith=null;say(v.name+" panics and flees.");}
    else if(snakeEyes)say("Snake eyes! "+v.name+" automatically holds.");
    else say(v.name+" holds.");
  });
}

function selectedTarget(u){const list=visibleEnemies(u);if(S.mode==="shoot"&&S.targetId===null)return null;return list.find(v=>v.id===S.targetId)||list.sort((a,b)=>dist(u,a)-dist(u,b))[0]||null;}
function equipMeleeWeapon(u,weapon){if(!u||!(u.meleeWeapons||["handWeapon"]).includes(weapon))return false;u.weapon=weapon;u.spears=weapon==="spear"&&!!u.hasSpear;u.greatWeapon=weapon==="greatWeapon";u.shield=!!u.ownsShield&&(weapon==="spear"||(!["greatWeapon","halberd"].includes(weapon)&&(!u.hasRangedWeapon||u.rangedMode==="shield")));return true;}
function setRangedMode(u,mode){if(!u||!u.hasRangedWeapon||!u.ownsShield||u.shot||!["bow","shield"].includes(mode))return false;u.rangedMode=mode;u.shield=mode==="shield";if(["greatWeapon","halberd"].includes(u.weapon))u.shield=false;return true;}
function eligibleForActivation(u){return alive(u)&&!u.attachedTo&&!u.fled&&!u.engaged&&!u.activated;}
function canCharge(u,target){
  if(target?.flyingMount&&!target.engaged&&!u?.flyingMount)return false;
  const dx=(target.x-u.x)*W(),dy=(target.y-u.y)*H(),bearing=Math.atan2(dy,dx),length=Math.hypot(dx,dy);if(length<1)return false;
  let delta=bearing-(u.facing||0);while(delta>Math.PI)delta-=Math.PI*2;while(delta< -Math.PI)delta+=Math.PI*2;
  const targetRadius=Math.hypot(shape(target).front,shape(target).depth)/2,arcAllowance=Math.asin(Math.min(.999,targetRadius/length));
  if(Math.abs(delta)>Math.PI/4+arcAllowance+0.0001)return false;
  return !units().some(v=>v!==u&&v!==target&&alive(v)&&!v.fled&&(()=>{const vx=(v.x-u.x)*W(),vy=(v.y-u.y)*H(),t=Math.max(0,Math.min(1,(vx*dx+vy*dy)/(length*length))),px=t*dx,py=t*dy,clear=Math.hypot(vx-px,vy-py),radius=Math.max(shape(v).front,shape(v).depth)*0.45;return t>0.03&&t<0.97&&clear<radius;})());
}
function pursueAfterBreak(winner,loser,choice=null){
  if(winner.side==="player"&&!choice&&!S.aiBattleLab){S.pendingPursuit={winnerId:winner.id,loserId:loser.id};say(winner.name+" has broken "+loser.name+". Choose whether to pursue or hold position.");return true;}
  if(choice==="hold"){say(winner.name+" holds position instead of pursuing.");return false;}
  const fleeDice=roll(2),pursuitDice=roll(2),fleeDistance=fleeDice[0]+fleeDice[1],pursuitDistance=pursuitDice[0]+pursuitDice[1];
  const dx=(loser.x-winner.x)*W(),dy=(loser.y-winner.y)*H(),len=Math.max(1,Math.hypot(dx,dy)),nx=dx/len,ny=dy/len;
  const clearPair=u=>{u.engaged=false;u.engagedWith=null;u.engagedWithIds=[];u.engagementSides={};u.engagedSide=null;u.chargedSide=null;u.attackedFromSide=null;u.flankedBy=null;};
  clearPair(winner);clearPair(loser);
  say("Pursuit: "+winner.name+" rolls "+pursuitDice.join(" + ")+" = "+pursuitDistance+"; "+loser.name+" flees "+fleeDice.join(" + ")+" = "+fleeDistance+".");
  if(pursuitDistance>=fleeDistance){loser.models=0;loser.fled=false;say(winner.name+" catches and destroys "+loser.name+".");panicNearby(loser,"a friendly unit is destroyed in combat");}
  else {const px=fleeDistance*PX_PER_IN();loser.x+=nx*px/W();loser.y+=ny*px/H();const pursuePx=pursuitDistance*PX_PER_IN();winner.x+=nx*pursuePx/W();winner.y+=ny*pursuePx/H();loser.fled=true;winner.charged=true;say(loser.name+" escapes; "+winner.name+" pursues "+pursuitDistance+'".');if(loser.x<0||loser.x>1||loser.y<0||loser.y>1){loser.models=0;loser.fled=false;say(loser.name+" flees off the battlefield.");panicNearby(loser,"a friendly unit flees off the battlefield");}else panicNearby(loser,"a friendly unit flees from combat");}
}

const RULES = createRules({ roll, units, say });
const { rankBonus, hitTarget, woundTarget, saveTarget, applyDamage:applyRawDamage, meleeAttack, shootingAttack } = RULES;
const OBJECTIVE_NAMES={holdGround:"Hold / Seize the Ground",captureFlag:"Capture the Flag",relics:"Relic Hunt"};
const EXPEDITION_OBJECTIVE_MODES=[null,"holdGround","captureFlag","relics"];
function chooseExpeditionObjective(){return EXPEDITION_OBJECTIVE_MODES[Math.floor(Math.random()*EXPEDITION_OBJECTIVE_MODES.length)];}
function expeditionObjectiveLabel(mode){return mode?OBJECTIVE_NAMES[mode]:"Standard Skirmish";}
function initializeObjectives(){
 S.objectiveScore={player:0,ai:0};
 S.objectives=[];
 S.flags=null;
 if(S.objectiveMode==="holdGround")S.objectives=[{id:"ground",kind:"ground",x:.5,y:.5}];
 if(S.objectiveMode==="captureFlag")S.flags={player:{side:"player",x:.08,y:.5,homeX:.08,homeY:.5,carrierId:null,atHome:true},ai:{side:"ai",x:.92,y:.5,homeX:.92,homeY:.5,carrierId:null,atHome:true}};
 if(S.objectiveMode==="relics")S.objectives=[
  {id:"relic1",kind:"relic",x:.39,y:.34,carrierId:null,bankedBy:null},
  {id:"relic2",kind:"relic",x:.5,y:.29,carrierId:null,bankedBy:null},
  {id:"relic3",kind:"relic",x:.61,y:.38,carrierId:null,bankedBy:null},
  {id:"relic4",kind:"relic",x:.42,y:.62,carrierId:null,bankedBy:null},
  {id:"relic5",kind:"relic",x:.59,y:.65,carrierId:null,bankedBy:null}
 ];
}
function dropObjectiveCarrier(u){
 if(!u)return;
 if(u.carryingFlagSide&&S.flags?.[u.carryingFlagSide]){
  const f=S.flags[u.carryingFlagSide];f.carrierId=null;f.x=u.x;f.y=u.y;f.atHome=false;
  say(u.name+" drops the "+f.side+" flag.");
  u.carryingFlagSide=null;
 }
 for(const item of S.objectives||[])if(item.kind==="relic"&&item.carrierId===u.id){item.carrierId=null;item.x=u.x;item.y=u.y;say(u.name+" drops "+item.id+".");}
 u.carryingRelicId=null;
}
function objectiveActive(u){return !!u&&alive(u)&&!u.fled&&!u.attachedTo&&!u.warbandStatus&&u.deployed!==false;}
function updateObjectiveInteractions(){
 if(!S.objectiveMode||S.finished)return;
 const roster=units().filter(objectiveActive);
 if(S.objectiveMode==="captureFlag"&&S.flags){
  for(const u of roster){
   for(const flag of Object.values(S.flags)){
    if(flag.carrierId===u.id||flag.carrierId!==null)continue;
    if(dist(u,{x:flag.x,y:flag.y})>1.4)continue;
    if(flag.side===u.side){
     if(flag.atHome)continue;
     flag.x=flag.homeX;flag.y=flag.homeY;flag.atHome=true;flag.carrierId=null;
     say(u.name+" returns their own flag to base.");
    }else{flag.carrierId=u.id;flag.atHome=false;u.carryingFlagSide=flag.side;say(u.name+" picks up the enemy flag!");}
   }
   if(u.carryingFlagSide){
    const home=S.flags[u.side];
    if(home?.atHome&&((u.side==="player"&&u.x<=.12)||(u.side==="ai"&&u.x>=.88))){
     say(u.name+" returns the enemy flag to base — capture!");
     finishBattle(u.side==="player"?"Player wins the battle! (Captured the flag)":"Opponent wins the battle! (Captured the flag)");
     return;
    }
   }
  }
 }
 if(S.objectiveMode==="relics"){
  for(const u of roster){
   if(u.carryingRelicId){
    if((u.side==="player"&&u.x<=.32)||(u.side==="ai"&&u.x>=.68)){
     const item=S.objectives.find(o=>o.id===u.carryingRelicId);
     if(item){item.carrierId=null;item.bankedBy=u.side;item.x=u.x;item.y=u.y;}
     S.objectiveScore[u.side]=(S.objectiveScore[u.side]||0)+1;
     say(u.name+" extracts a relic for "+u.side+" ("+S.objectiveScore[u.side]+"/3).");
     u.carryingRelicId=null;
     if(S.objectiveScore[u.side]>=3){finishBattle(u.side==="player"?"Player wins the battle! (Recovered three relics)":"Opponent wins the battle! (Recovered three relics)");return;}
    }
   }else{
    const item=S.objectives.find(o=>o.kind==="relic"&&!o.bankedBy&&!o.carrierId&&dist(u,o)<=1.25);
    if(item){item.carrierId=u.id;u.carryingRelicId=item.id;say(u.name+" picks up a neutral relic. Carry it back to your deployment side to secure it.");}
   }
  }
 }
}
function checkObjectiveDeadline(){
 if(!S.objectiveMode)return false;
 if(S.objectiveMode==="holdGround"&&S.turn>=7){
  const ground=S.objectives?.[0],near=units().filter(u=>objectiveActive(u)&&dist(u,ground)<=3.5);
  const p=near.filter(u=>u.side==="player").length,a=near.filter(u=>u.side==="ai").length;
  finishBattle(p===a?"The battle is a draw! (The ground remains contested)":p>a?"Player wins the battle! (Held the central ground)":"Opponent wins the battle! (Held the central ground)");return true;
 }
 if(S.turn>=11&&S.objectiveMode==="captureFlag"){finishBattle("The battle is a draw! (No flag was captured)");return true;}
 if(S.turn>=11&&S.objectiveMode==="relics"){
  const p=S.objectiveScore?.player||0,a=S.objectiveScore?.ai||0;
  finishBattle(p===a?"The battle is a draw! (Relics secured: "+p+" each)":p>a?"Player wins the battle! (Relics secured: "+p+" to "+a+")":"Opponent wins the battle! (Relics secured: "+a+" to "+p+")");return true;
 }
 return false;
}
function recordWarbandKill(u,attacker=null){if(!S.warbandExpedition||!u||u.side!=="ai"||u.warbandKillRecorded)return;if(attacker&&attacker.side!=="player"){u.warbandKillRecorded=true;return;}u.warbandKillRecorded=true;S.warbandKills=(S.warbandKills||0)+1;const killer=attacker?attacker:units().filter(v=>v.side==="player"&&alive(v)&&!v.fled&&!v.warbandStatus).sort((a,b)=>dist(a,u)-dist(b,u))[0];if(killer)killer.warbandXpEarned=(Number(killer.warbandXpEarned)||0)+1;}
function applyDamage(u,wounds,shooting,cascadePlan=null,attacker=null){if(S.warbandSkirmish&&u?.isWarbandFighter&&wounds>0){if(u.warbandStatus==="unconscious"||u.warbandStatus==="stunned"){dropObjectiveCarrier(u);u.warbandStatus="outOfAction";u.models=0;recordWarbandKill(u,attacker);say(u.name+" is struck while unconscious and is out of action.");render();return 0;}if(u.warbandStatus==="outOfAction")return 0;u.warbandWounds=Math.max(0,(u.warbandWounds??u.stats.W??1)-Math.max(1,Math.floor(wounds)));u.characterWounds=u.warbandWounds;if(u.warbandWounds>0){say(u.name+" suffers a wound ("+u.warbandWounds+" remaining).");render();return 0;}const injury=roll(1)[0];if(injury<=2){u.warbandStatus="stunned";u.stunnedUntilTurn=S.turn+1;u.warbandWounds=0;say("Injury — "+u.name+" rolls "+injury+": stunned and will miss their next turn.");}else if(injury<=4){dropObjectiveCarrier(u);u.warbandStatus="unconscious";u.warbandWounds=0;say("Injury — "+u.name+" rolls "+injury+": unconscious. A friendly fighter can revive them while adjacent during movement.");}else{dropObjectiveCarrier(u);u.warbandStatus="outOfAction";u.models=0;if(S.warbandExpedition)u.warbandKilledInBattle=true;recordWarbandKill(u,attacker);say("Injury — "+u.name+" rolls "+injury+": out of action.");}render();return 0;}if(u?.regeneration&&wounds>0&&!cascadePlan){let regenerated=0;for(let i=0;i<Math.floor(wounds);i++)if(roll(1)[0]>=u.regeneration)regenerated++;if(regenerated){wounds-=regenerated;say(u.name+" regenerates "+regenerated+" wound(s) on a 4+.");}}const before=u?.models??0,result=applyRawDamage(u,wounds,shooting,cascadePlan);if(before>0&&u?.models<=0)dropObjectiveCarrier(u);if(u?.isGiant&&before>0&&u.models<=0&&!u.fallingResolved){u.fallingResolved=true;say(u.name+" falls over as it dies!");for(const v of units().filter(v=>v!==u&&alive(v)&&dist(u,v)<=3)){if(roll(1)[0]>=4){const fallWounds=1+(roll(1)[0]%3);applyDamage(v,fallWounds,false);say(v.name+" is struck by the falling Giant for "+fallWounds+" wound(s).");}}}if(u?.isDragon&&before>0&&u.models<=0&&!u.fallingResolved){u.fallingResolved=true;const rider=(u.attachedCharacters||[]).map(id=>S.units[id]).find(h=>h&&h.models>0&&!h.fled);if(rider){rider.characterWounds=Math.max(0,(rider.characterWounds??rider.stats.W)-1);if(rider.characterWounds<=0)rider.models=0;rider.x=u.x;rider.y=u.y;rider.attachedTo=null;rider.mounted=false;rider.mountType="none";rider.flyingMount=false;rider.flightAltitudeIn=0;rider.baseWidthIn=20/25.4;rider.baseDepthIn=20/25.4;rider.stats.M=5;rider.baseMove=5;u.attachedCharacters=(u.attachedCharacters||[]).filter(id=>id!==rider.id);say(rider.name+" suffers an automatic falling wound as the flying dragon dies"+(rider.models>0?"; they continue on foot.":"."));}}return result;}
const SHOOTING = createShooting({ S, units, alive, dist, BOW_RANGE, roll, woundTarget, saveTarget, applyDamage, say, diceStack, $, shootingAttack, panicNearby, shape, corners, W, H, terrain:()=>S.terrain, BATTLEFIELD_WIDTH_IN, revealUnit, isUnitVisible });
const { shoot, fireCannon, breathAttack } = SHOOTING;
function resolvePursuit(choice){const pending=S.pendingPursuit;if(!pending)return;S.pendingPursuit=null;const winner=S.units[pending.winnerId],loser=S.units[pending.loserId];if(winner&&loser)pursueAfterBreak(winner,loser,choice);if(units().filter(alive).every(v=>v.fled)||units().filter(v=>v.side==="player"&&alive(v)).length===0||units().filter(v=>v.side==="ai"&&alive(v)).length===0){finishBattle(units().some(v=>v.side==="player"&&alive(v)&&!v.fled)?"Player wins the battle!":"Opponent wins the battle!");return;}if(continueBreakTests())return;S.phase="combat";S.combatResolved=true;render();}
function startActivations(){if(S.aiBattleLab){runAiLabMovement();return;}beginMovementPhase();S.activationSide="player";S.prioritySpentThisPhase=false;S.forcePlayerNext=false;S.normalMovementSide=S.turn%2===1?"player":"ai";units().filter(u=>u.fled&&alive(u)).forEach(rallyUnit);const p=units().filter(u=>u.side==="player"&&eligibleForActivation(u));if(!p.length){runAiActivations();return;}const priority=p.find(hasPriorityRule);if(priority){S.selected=priority.id;render();return;}if(S.normalMovementSide==="ai")runAiActivation();const next=units().find(v=>v.side==="player"&&eligibleForActivation(v));if(next){S.selected=next.id;render();return;}runAiActivations();}
const AI = createAI({ S, units, alive, eligibleForActivation, enemies, visibleEnemies, aiLastKnownTargets, dist, BATTLEFIELD_WIDTH_IN, fieldHeightIn, shape, PX_PER_IN, canPlace, say, shoot, fireCannon, BOW_RANGE, beginCombatPhase, terrain:()=>S.terrain });
const runAiActivation = AI.runAiActivation;
const runAiActivations = AI.runAiActivations;
const LAB_RED_AI=createAI({S,units,alive,eligibleForActivation,enemies,visibleEnemies,aiLastKnownTargets:()=>[],dist,BATTLEFIELD_WIDTH_IN,fieldHeightIn,shape,PX_PER_IN,canPlace,say,shoot,fireCannon,BOW_RANGE,beginCombatPhase,terrain:()=>S.terrain,side:"player",policy:"baseline"});
const LAB_BLUE_AI=createAI({S,units,alive,eligibleForActivation,enemies,visibleEnemies,aiLastKnownTargets:()=>[],dist,BATTLEFIELD_WIDTH_IN,fieldHeightIn,shape,PX_PER_IN,canPlace,say,shoot,fireCannon,BOW_RANGE,beginCombatPhase,terrain:()=>S.terrain,side:"ai",policy:"experimental"});
function finishActivation(unitOverride=null,alreadyActivated=false){const u=unitOverride||S.units[S.selected];if(!u||u.side!=="player"||(!alreadyActivated&&u.activated)||S.phase!=="movement")return;u.activated=true;S.mode=null;say(u.name+" completes its activation.");if(hasPriorityRule(u)&&!S.prioritySpentThisPhase){S.prioritySpentThisPhase=true;if(S.normalMovementSide==="ai"&&runAiActivation()){const next=units().find(v=>v.side==="player"&&eligibleForActivation(v));if(next){S.selected=next.id;render();return;}}const next=units().find(v=>v.side==="player"&&eligibleForActivation(v));if(next){S.forcePlayerNext=true;S.selected=next.id;render();return;}runAiActivations();return;}if(S.forcePlayerNext){S.forcePlayerNext=false;const next=units().find(v=>v.side==="player"&&eligibleForActivation(v));if(next){S.selected=next.id;render();return;}}if(runAiActivation()){const next=units().find(v=>v.side==="player"&&eligibleForActivation(v));if(next){S.activationSide="player";S.selected=next.id;render();return;}}const next=units().find(v=>v.side==="player"&&eligibleForActivation(v));if(next){S.activationSide="player";S.selected=next.id;render();return;}runAiActivations();}
function rallyUnit(u){if(!u||!u.fled||u.rallyAttemptTurn===S.turn||u.terrorFledTurn===S.turn)return false;if(u.models*4<u.startModels){say(u.name+" is below a quarter of its starting strength and cannot rally.");return false;}u.rallyAttemptTurn=S.turn;const ld=leadership(u),dice=roll(2),total=dice[0]+dice[1];say("Rally test — "+u.name+": "+dice.join(" + ")+" = "+total+" against unmodified Leadership "+ld+".");if(total<=ld){u.fled=false;u.moveUsed=u.stats.M;u.activated=true;say(u.name+" rallies, but cannot move further this turn.");}else{const foe=closestEnemy(u),dx=foe?(u.x-foe.x)*W():Math.cos(u.facing+Math.PI)*W(),dy=foe?(u.y-foe.y)*H():Math.sin(u.facing+Math.PI)*H(),len=Math.max(1,Math.hypot(dx,dy)),distanceRoll=roll(2),distance=distanceRoll[0]+distanceRoll[1],px=distance*PX_PER_IN();u.x+=dx/len*px/W();u.y+=dy/len*px/H();say(u.name+" fails to rally and flees "+distance+" inches ("+distanceRoll.join(" + ")+").");if(u.x<0||u.x>1||u.y<0||u.y>1){u.models=0;u.fled=false;say(u.name+" flees off the battlefield.");}}render();return !u.fled;}
function rallyingCall(source,target){if(!source||!source.rallyingCall||source.side!=="player"||source.fled||(source.attachedTo&&S.units[source.attachedTo]?.fled)||source.models<=0||source.rallyingCallUsed||S.phase!=="movement")return false;if(!target||target===source||target.side!==source.side||!target.fled||target.terrorFledTurn===S.turn||!alive(target)||dist(source,target)>12){say("Choose a friendly fleeing unit within 12 inches.");return false;}source.rallyingCallUsed=true;target.fled=false;target.engaged=false;target.engagedWith=null;target.moveUsed=target.stats.M;target.activated=true;target.rallyAttemptTurn=S.turn;say(source.name+" uses Rallying Call: "+target.name+" rallies automatically and cannot move further this turn.");S.mode=null;render();return true;}
function beginCombatPhase(){const canFight=u=>alive(u)&&!u.fled&&(!S.warbandSkirmish||!["unconscious","outOfAction"].includes(u.warbandStatus));const playerReady=units().some(u=>u.side==="player"&&canFight(u)),aiReady=units().some(u=>u.side==="ai"&&canFight(u));if(!playerReady||!aiReady){finishBattle(S.aiBattleLab&&!playerReady&&!aiReady?"The battle is a draw! (Both armies destroyed)":playerReady?"Player wins the battle!":"Opponent wins the battle!");return;}if(units().some(u=>u.engaged&&alive(u))){setPhase("combat");if(S.aiBattleLab)resolveCombat();}else{S.turn++;if(checkObjectiveDeadline())return;if(checkSiegeDeadline())return;setPhase("charges");say("Turn "+S.turn+" begins.");if(S.aiBattleLab)window.setTimeout(runAiLabCharges,0);}}
function reformCombatPairs(){const pairs=[];units().filter(u=>u.engaged&&alive(u)).forEach(u=>{const v=u.engagedWith?S.units[u.engagedWith]:null;if(v&&alive(v)&&v.engagedWith===u.id&&!pairs.some(p=>p.includes(u)||p.includes(v)))pairs.push([u,v]);});if(pairs.length!==1)return;const [a,b]=pairs[0];if(!a.engaged||!b.engaged)return;const defender=[a,b].find(u=>["left","right","rear"].includes(u.attackedFromSide)&&u.flankedBy===([a,b].find(v=>v!==u)?.id));if(defender){const enemy=defender===a?b:a;const oldRanks=shape(defender).ranks;defender.formationWidth=Math.max(1,Math.min(defender.models,oldRanks+1,Math.max(1,enemy.formationWidth||5)));say(defender.name+" turns to face "+enemy.name+" and reforms to "+defender.formationWidth+" files. Its disrupted rank bonus and the flank bonus end for the next round.");}else say("The engaged units turn to face each other before the next round.");const dx=(b.x-a.x)*W(),dy=(b.y-a.y)*H(),angle=Math.atan2(dy,dx);a.facing=angle;b.facing=angle+Math.PI;const gap=(shape(a).depth+shape(b).depth)/2,midX=(a.x+b.x)/2,midY=(a.y+b.y)/2;a.x=midX-Math.cos(angle)*gap/2/W();a.y=midY-Math.sin(angle)*gap/2/H();b.x=midX+Math.cos(angle)*gap/2/W();b.y=midY+Math.sin(angle)*gap/2/H();for(const u of [a,b]){u.engagedSide="front";u.chargedSide="front";u.attackedFromSide="front";u.flankedBy=null;}}
let render = () => { Object.values(S.units||{}).forEach(u=>{u.magicSuppressed=isInsideNullificationDome(u);});updateObjectiveInteractions();if(!S.finished&&S.phase!=="deployment"&&S.phase!=="over"&&S.phase!=="menu"){const canFight=u=>alive(u)&&!u.fled&&(!S.warbandSkirmish||!["unconscious","outOfAction"].includes(u.warbandStatus));const playerReady=units().some(u=>u.side==="player"&&canFight(u)),aiReady=units().some(u=>u.side==="ai"&&canFight(u));if(!playerReady||!aiReady){finishBattle(playerReady?"Player wins the battle!":"Opponent wins the battle!");return;}}};
const COMBAT = createCombat({ S, units, alive, dist, meleeAttack, applyDamage, rankBonus, roll, say, diceStack, render: () => render(), endTurn, finishBattle, reformCombatPairs, pursueAfterBreak, panicNearby, leadership });
const { resolveCombat, resolveBreak, continueBreakTests } = COMBAT;
function resolveAnimosityBrawl(a,b){
 const aModels=Math.min(Math.max(1,Math.floor(a.formationWidth||5)),a.models||0),bModels=Math.min(Math.max(1,Math.floor(b.formationWidth||5)),b.models||0);
 const aAttack=meleeAttack(a,b,{attackingModels:aModels,attackingChampion:false,charging:true});
 const bAttack=meleeAttack(b,a,{attackingModels:bModels,attackingChampion:false,charging:true});
 applyDamage(b,aAttack.wounds,false,aAttack.cascadePlan,a);
 applyDamage(a,bAttack.wounds,false,bAttack.cascadePlan,b);
 const dx=(b.x-a.x)*W(),dy=(b.y-a.y)*H(),length=Math.hypot(dx,dy)||1,angle=Math.atan2(dy,dx),step=W()/BATTLEFIELD_WIDTH_IN*.5;
 a.x-=Math.cos(angle)*step/W();a.y-=Math.sin(angle)*step/H();b.x+=Math.cos(angle)*step/W();b.y+=Math.sin(angle)*step/H();
 say("Greenskin brawl: "+a.name+" inflicts "+aAttack.wounds+" wound(s); "+b.name+" inflicts "+bAttack.wounds+" wound(s). Casualties are removed, but no combat result or panic test is made.");
}
function checkSiegeDeadline(){if(S.battleType!=="siege"||S.turn<=10)return false;const castle=(S.terrain||[]).find(t=>t.type==="siegeCastle"),attackerSide=S.siegeRole==="attacker"?"player":"ai",breached=!!castle&&units().some(u=>u.side===attackerSide&&alive(u)&&!u.fled&&!u.wallLevel&&u.x>castle.left&&u.x<castle.right&&u.y>castle.top&&u.y<castle.bottom),playerAttacks=attackerSide==="player";finishBattle(breached?(playerAttacks?"Player wins the siege: the attackers have breached the castle.":"Opponent wins the siege: the attackers have breached the castle."):(playerAttacks?"Opponent wins the siege: the defenders hold the castle through turn 10.":"Player wins the siege: the defenders hold the castle through turn 10."));return true;}
function endTurn(){S.combatResolved=false;units().forEach(u=>{u.castingDiceUsed=0;u.dispelledDomeThisTurn=false;u.charged=false;u.defendedWallCombat=false;if(!alive(u)||u.fled||!u.engagedWith||!alive(S.units[u.engagedWith])||S.units[u.engagedWith].fled){u.engaged=false;u.engagedWith=null;u.engagedSide=null;u.chargedSide=null;u.attackedFromSide=null;u.flankedBy=null;}});units().filter(u=>u.wallLevel&&!u.engaged&&u.wallSegment).forEach(u=>{u.cover="hard";u.wallDefence={wall:u.wallSegment,posture:"active",wasSkirmishing:true};});S.turn++;if(checkSiegeDeadline())return;const aiDispel=units().find(u=>u.side==="ai"&&u.spellcaster&&alive(u)&&!u.fled&&!u.dispelledDomeThisTurn&&!isInsideNullificationDome(u));const enemyDome=(S.remainsInPlaySpells||[]).find(e=>e.castTurn<S.turn&&e.side==="player");if(aiDispel&&enemyDome){const dc=Math.max(1,Math.min(4,aiDispel.casterLevel||1)),dd=roll(dc),dt=dd.reduce((sum,n)=>sum+n,0)+(aiDispel.casterLevel||1)+(aiDispel.dispelBonus||0);aiDispel.dispelledDomeThisTurn=true;say(aiDispel.name+" attempts to dispel Nullification Dome using "+dc+" dice: "+dd.join(", ")+" + level "+aiDispel.casterLevel+" = "+dt+" (needs "+enemyDome.castingValue+").");if(dt>=enemyDome.castingValue){S.remainsInPlaySpells=S.remainsInPlaySpells.filter(e=>e.id!==enemyDome.id);say("The opponent dispels Nullification Dome.");}else say("The opponent fails to dispel the dome.");}say("Turn "+S.turn+" begins.");setPhase("charges");if(S.aiBattleLab)window.setTimeout(runAiLabCharges,0);}
function finishBattle(msg){
 if(S.aiBattleLab){finishAiLabBattle(msg);return;}
 if(S.finished)return;
 S.finished=true;S.phase="over";
 clearBattleSave();
 const won=msg.toLowerCase().includes("player wins");
 if(won&&collectionManager&&!campaignBattle&&!grandCampaignBattle&&!roguelikeBattle&&!warbandBattle&&!warbandExpeditionBattle){collectionManager.grantLootbox("skirmish");say("Skirmish victory reward: one lootbox added to your collection.");}
 if(warbandExpeditionBattle){warbandExpeditionBattle=false;warbandExpedition?.onBattleFinished(won,units().filter(u=>u.side==="player"),S.warbandKills||0);S.warbandExpedition=false;S.warbandSkirmish=false;return;}
 if(warbandBattle){warband?.onBattleFinished(won);warbandBattle=false;S.warbandSkirmish=false;}
 say('<b>'+msg+'</b>');
 if(grandCampaignBattle){grandCampaignBattle=false;$("battle-return").hidden=true;const result={won,playerUnits:units().filter(u=>u.side==="player").map(u=>({id:u.id,type:u.type,models:u.models,damage:u.damage,characterWounds:u.characterWounds,points:u.points})),enemyUnits:units().filter(u=>u.side==="ai").map(u=>({id:u.id,type:u.type,models:u.models,damage:u.damage,characterWounds:u.characterWounds,points:u.points}))};const complete=grandCampaignBattleComplete;grandCampaignBattleComplete=null;try{complete?.(result);}catch(error){console.error("Campaign battle result handling failed",error);}$("game").hidden=true;const campaignScreen=$("grand-campaign-screen");if(campaignScreen)campaignScreen.hidden=false;return;}
 if(campaignBattle){campaignBattle=false;narrativeCampaign?.onBattleFinished(won);$("battle-return").hidden=true;return;}
 if(roguelikeBattle){roguelikeBattle=false;roguelike?.onBattleFinished(won,units().filter(u=>u.side==="player"));$("battle-return").hidden=true;return;}
 $("battle-return").hidden=false;
 render();
}
function reset(){S.units=Object.fromEntries(Object.entries(S.units).filter(([,u])=>!u.isWallParty));S.terrain=S.autoTerrain?(S.customSiegeMap?generateRiverCrossingCastleTerrain(S.terrainSeed||Date.now(),S.customSiegeMap.city,S.customSiegeMap.approach):generateSkirmishTerrain(S.terrainSeed||Date.now(),S.battleType)):[];S.terrainDraft=null;S.remainsInPlaySpells=[];S.pendingDome=null;S.terrainTool="off";S.turn=1;S.phase="deployment";S.mode=null;S.chargeSide="player";S.chargePasses=0;S.declaredCharges=[];S.activationSide="player";S.prioritySpentThisPhase=false;S.forcePlayerNext=false;S.targetComponentByUnit={};S.dragonBreathAim=null;view.zoom=.55;view.x=0;view.y=0;S.finished=false;S.combatRound=0;S.loser=null;S.crDiff=0;S.breakTests=[];S.log=[];S.combatDiceQueue=[];$("rollcontent").replaceChildren();const all=units();S.selected=all.find(u=>u.side==="player")?.id||null;all.forEach(u=>{const sideUnits=all.filter(v=>v.side===u.side),index=sideUnits.indexOf(u);Object.assign(u,{models:u.startModels,damage:0,chariotWounds:u.chariotStartWounds??u.chariotWounds,artilleryWounds:u.artilleryStartWounds??u.artilleryWounds,x:S.battleType==="siege"?(S.customSiegeMap?(u.side==="ai"?.38+(index%3)*.08:S.customSiegeMap.approach==="east"?.87:S.customSiegeMap.approach==="west"?.08:.22+(index%4)*.15):(((u.side==="player")===(S.siegeRole==="defender"))?.38+(index%3)*.12:.10+(index%2)*.12)):(u.side==="player"?.22:.78),y:S.battleType==="siege"?(S.customSiegeMap?(u.side==="ai"?.34+Math.floor(index/3)*.12:S.customSiegeMap.approach==="north"?.055+Math.floor(index/4)*.025:S.customSiegeMap.approach==="south"?.91-Math.floor(index/4)*.025:.34+Math.floor(index/4)*.08):(((u.side==="player")===(S.siegeRole==="defender"))?.35+Math.floor(index/3)*.24:.34+Math.floor(index/2)*.16)):(index+1)/(sideUnits.length+1),facing:u.side==="player"?0:Math.PI,deployed:u.side==="ai",wallLevel:false,wallSegment:null,laddersDeployed:0,ladderDeployedTurn:0,engaged:false,engagedWith:null,engagedWithIds:[],engagementSides:{},engagedSide:null,chargedSide:null,attackedFromSide:null,flankedBy:null,formationWidth:u.isSiegeEngine?3:5,skirmishing:!!u.isSiegeEngine||!!u.flyingMount,skirmishCombatRound:0,wallDefence:null,defendedWallCombat:false,cover:u.isSiegeEngine?"soft":null,fleeingCharge:false,activated:false,moved:false,shot:false,breathUsed:false,charged:false,impactResolvedRound:0,fled:false,moveUsed:0,shootCasualties:0,panicTested:false,terrorTested:false,terrorFledThisTurn:false,failedFearCharge:false,terrorFledTurn:0,delayedDeath:false,delayedDeathSnapshot:null,fallingResolved:false,rallyingCallUsed:false,rallyAttemptTurn:0});u.stats.M=u.baseMove??u.stats.M;u.characterWounds=u.isCharacter?u.stats.W:null;u.delayedDeath=false;u.delayedDeathSnapshot=null;u.championAlive=!!u.champion?.enabled;u.championWounds=u.championAlive?u.stats.W:0;});all.filter(u=>!u.isCharacter).forEach(host=>{host.stats.M=host.baseMove??host.stats.M;if(!host.isChariot)(host.attachedCharacters||[]).forEach(id=>{const hero=S.units[id];if(hero&&hero.models>0)host.stats.M=Math.min(host.stats.M,hero.stats.M);});});$("log").replaceChildren();$("logpanel").classList.remove("open");$("rollview").classList.remove("show");say("Deployment: place units in your third of the field. The middle third is neutral; Aelthir and any unit he leads may deploy there. The opponent's deployment is hidden.");render();}
const view={zoom:.55,x:0,y:0};
const RENDERING = createRendering({ canvas, ctx, S, units, alive, W, H, PX_PER_IN, BATTLEFIELD_WIDTH_IN, MODEL_BASE_IN, shape, view, isUnitVisible });
const { setupCanvas, draw } = RENDERING;
function requestRender(){ render(); }
 function isInsideNullificationDome(point){return (S.remainsInPlaySpells||[]).some(effect=>effect.spell==="nullificationDome"&&dist(point,{x:effect.x,y:effect.y})<=(effect.radiusIn||6)+.001);}
 function castSpell(caster,target,spell,diceCount){if(!caster?.spellcaster||caster.side!=="player"||S.phase!=="movement"||!alive(caster)||caster.engaged||caster.fled)return false;if(isInsideNullificationDome(caster)){say(caster.name+" cannot cast while inside a Nullification Dome.");render();return false;}const level=Math.max(1,Math.min(caster.specialSpell==="fateward"?5:4,caster.casterLevel||1)),remaining=level-(caster.castingDiceUsed||0),count=Math.max(1,Math.min(remaining,Math.floor(diceCount))),isDome=spell==="nullificationDome",cv=isDome?10:3;if(count<1||remaining<count){say(caster.name+" has insufficient casting dice.");return false;}if(!(caster.spells||["fireBolt"]).includes(spell)){say(caster.name+" does not know that spell.");return false;}if(isDome){if(caster.faction!=="highElves"){say("Only Elf spellcasters can cast Nullification Dome.");return false;}if(!target||!Number.isFinite(target.x)||!Number.isFinite(target.y)||dist(caster,target)>18){say("Choose a point within 18 inches for Nullification Dome.");return false;}}else{if(!target||target.side===caster.side||!alive(target)||!isUnitVisible(target,caster.side)||dist(caster,target)>30){say("Fire Bolt requires a visible enemy target within 30 inches.");return false;}if(isInsideNullificationDome(target)){say("Spells cannot affect a target inside a Nullification Dome.");return false;}}caster.castingDiceUsed=(caster.castingDiceUsed||0)+count;const dice=roll(count),total=dice.reduce((a,b)=>a+b,0)+level+(caster.castingBonus||0);say(caster.name+" casts "+(isDome?"Nullification Dome":"Fire Bolt")+": "+dice.join(", ")+" + caster level "+level+(caster.castingBonus? " + unicorn bonus "+caster.castingBonus:"")+" = "+total+" (casting value "+cv+").");if(total<cv){say("The spell fails to take effect.");render();return true;}const dispeller=units().find(u=>u.side!==caster.side&&u.spellcaster&&alive(u)&&!u.fled&&!isInsideNullificationDome(u));if(dispeller){const dispelCount=Math.min(dispeller.casterLevel||1,Math.max(1,Math.ceil((total-(dispeller.casterLevel||1))/3)));const dd=roll(dispelCount),dt=dd.reduce((a,b)=>a+b,0)+(dispeller.casterLevel||1)+(dispeller.dispelBonus||0);say(dispeller.name+" attempts to counterspell with "+dispelCount+" dice: "+dd.join(", ")+" + level "+dispeller.casterLevel+" = "+dt+".");if(dt>total){say((isDome?"Nullification Dome":"Fire Bolt")+" is counterspelled.");render();return true;}say("The counterspell fails.");}if(isDome){S.remainsInPlaySpells.push({id:"dome-"+S.turn+"-"+Math.random().toString(36).slice(2,8),spell:"nullificationDome",name:"Nullification Dome",ownerId:caster.id,side:caster.side,x:target.x,y:target.y,radiusIn:6,castTurn:S.turn,castingValue:10});say("Nullification Dome forms at the chosen point. Its 6-inch radius suppresses spellcasting, spell effects and magic items within it. It remains until dispelled.");}else{const woundTargetNumber=woundTarget(4,target.stats.T),woundRoll=roll(1)[0],wound=woundTargetNumber!==null&&woundRoll>=woundTargetNumber;if(!wound){say("Fire Bolt hits but fails to wound "+target.name+".");render();return true;}let saved=false;const modified=saveTarget(target,4,1);if(modified!==null&&modified<=6&&roll(1)[0]>=modified)saved=true;if(saved){say("Fire Bolt wounds "+target.name+", but its armour saves the hit.");render();return true;}applyDamage(target,1,true,null,caster);say("Fire Bolt inflicts one Strength 4, AP1 wound on "+target.name+".");}render();return true;}
 function dispelDome(caster,effectId){const effect=(S.remainsInPlaySpells||[]).find(e=>e.id===effectId);if(!caster?.spellcaster||caster.side!=="player"||!effect||effect.castTurn>=S.turn||caster.dispelledDomeThisTurn||!alive(caster)||caster.fled||isInsideNullificationDome(caster)){say("A remains-in-play spell cannot be dispelled on the turn it was created; choose an eligible mage and try again next turn.");return false;}const diceCount=Math.max(1,Math.min(5,caster.casterLevel||1)),dice=roll(diceCount),total=dice.reduce((a,b)=>a+b,0)+(caster.casterLevel||1)+(caster.dispelBonus||0);caster.dispelledDomeThisTurn=true;say(caster.name+" attempts to dispel Nullification Dome using "+diceCount+" dice: "+dice.join(", ")+" + level "+caster.casterLevel+" = "+total+" (needs "+effect.castingValue+").");if(total>=effect.castingValue){S.remainsInPlaySpells=S.remainsInPlaySpells.filter(e=>e.id!==effect.id);say("Nullification Dome collapses.");}else say("The dispel attempt fails; the dome remains.");render();return true;}
const PHASES = createPhases({ S, units, alive, shape, BATTLEFIELD_WIDTH_IN, fieldHeightIn, W, H, PX_PER_IN, BOW_RANGE, roll, dist, enemies, visibleEnemies, say, shoot, render:requestRender, startActivations, canPlace, canCharge, testTerrorAtTurnStart, testChargePsychology, resolveCombat, resolveAnimosityBrawl });
const { setPhase, declareCharge, fleeFromCharge, finishMovement, passCharges, aiChargeStep, resolveDeclaredCharges } = PHASES;
const UI = createUI({ S, $, units, alive, draw, W, H, BOW_RANGE, selectedTarget, dist, passCharges, finishActivation, resolveCombat, endTurn, resolveBreak, resolvePursuit, reset, validDeployment, canPlace, rallyUnit, rallyingCall, fleeFromCharge, say, equipMeleeWeapon, setRangedMode, shape, PX_PER_IN, terrain:()=>S.terrain, BATTLEFIELD_WIDTH_IN, castSpell, dispelDome, startBattle:()=>{setPhase("charges");say("Battle begins! The opponent's deployment is revealed.");} });
const renderUI = UI.render;
let persistenceReady = false;
const BATTLE_SAVE_KEY = "warGameActiveBattleV1";
const BATTLE_BACKUP_KEY = "warGameActiveBattleBackupV1";
function clearBattleSave() {
 try { localStorage.removeItem(BATTLE_SAVE_KEY); localStorage.removeItem(BATTLE_BACKUP_KEY); } catch {}
}

function installBattleMenu() {
 const menu = $("battle-menu-panel");
 const open = $("battle-menu-open");
 const toggle = show => {
  if (!menu) return;
  menu.hidden = !show;
  if (open) open.setAttribute("aria-expanded", show ? "true" : "false");
 };
 open?.addEventListener("click", () => toggle(menu.hidden));
 $("battle-menu-resume")?.addEventListener("click", () => toggle(false));
 $("battle-save-main-menu")?.addEventListener("click", () => {
  saveBattleSnapshot();
  toggle(false);
  $("game").hidden = true;
  $("mainmenu").hidden = false;
  $("resume-saved-battle").hidden = false;
 });
 $("resume-saved-battle")?.addEventListener("click", () => {
  let saved = false;
  try {
   const raw = localStorage.getItem(BATTLE_SAVE_KEY) || localStorage.getItem(BATTLE_BACKUP_KEY);
   const snap = raw && JSON.parse(raw);
   if (snap?.schemaVersion === 1 && snap.state?.units && Object.keys(snap.state.units).length && snap.state.phase !== "over") {
    Object.assign(S, snap.state);
    if (snap.view && Number.isFinite(snap.view.zoom)) Object.assign(view, snap.view);
    campaignBattle = !!snap.campaignBattle;
    grandCampaignBattle = !!snap.grandCampaignBattle;
    roguelikeBattle = !!snap.roguelikeBattle;
    $("mainmenu").hidden = true;
    $("game").hidden = false;
    $("resume-saved-battle").hidden = true;
    $("battle-return").hidden = true;
    $("log").innerHTML = (S.log || []).map(x => '<div class="logentry">' + x + '</div>').join("");
    $("rollcontent").replaceChildren();
    setupCanvas();
    render();
    saved = true;
   }
  } catch (error) { console.warn("Could not resume saved battle", error); }
  if (!saved) $("resume-saved-battle").hidden = true;
 });
 $("battle-concede")?.addEventListener("click", () => {
  if (S.finished) return;
  if (!window.confirm("Concede this battle? All of your troops will be killed and the battle will count as a defeat.")) return;
  units().filter(u => u.side === "player").forEach(u => {
   u.models = 0; u.damage = 0; u.characterWounds = 0; u.chariotWounds = 0; u.artilleryWounds = 0;
   (u.attachedCharacters || []).forEach(id => {
    const character = S.units[id];
    if (character) { character.models = 0; character.characterWounds = 0; }
   });
  });
  toggle(false);
  finishBattle("Opponent wins — you conceded the battle. All of your troops have been lost.");
 });
}
function saveBattleSnapshot() {
 if (!persistenceReady) return;
 if (S.finished || !S.units || !Object.keys(S.units).length || !S.phase || S.phase === "menu") {
  clearBattleSave();
  return;
 }
 try {
  const snapshot = {
   schemaVersion: 1,
   savedAt: new Date().toISOString(),
   state: S,
   view,
   campaignBattle,
   grandCampaignBattle,
   roguelikeBattle
  };
  const json = JSON.stringify(snapshot);
  const previous = localStorage.getItem(BATTLE_SAVE_KEY);
  if (previous) localStorage.setItem(BATTLE_BACKUP_KEY, previous);
  localStorage.setItem(BATTLE_SAVE_KEY, json);
 } catch (error) {
  console.warn("Battle autosave failed", error);
 }
}
render = () => {
 const battleMenuBar = $("battle-menu-bar");
 if (battleMenuBar) battleMenuBar.hidden = !(campaignBattle || grandCampaignBattle);
 updateAiMemory();
 Object.values(S.units||{}).forEach(u=>{u.magicSuppressed=isInsideNullificationDome(u);});
 updateObjectiveInteractions();
 const revive=$("warband-revive"),rescuer=S.units[S.selected];if(revive){const target=!!S.warbandSkirmish&&S.phase==="movement"&&rescuer?.side==="player"&&alive(rescuer)&&!rescuer.warbandStatus&&!rescuer.fled&&!rescuer.engaged&&!rescuer.activated&&units().some(v=>v.side==="player"&&v.warbandStatus==="unconscious"&&alive(v)&&dist(rescuer,v)<=1.5);revive.hidden=!target;}
 renderUI();
 saveBattleSnapshot();
};
window.warGameSaveNow = saveBattleSnapshot;
const INPUT = createInput({ canvas, S, view, W, H, units, alive, shape, PX_PER_IN, BATTLEFIELD_WIDTH_IN, canPlace, validDeployment, shoot, fireCannon, breathAttack, declareCharge, render, draw, $, say, dist, finishActivation, terrain:()=>S.terrain, rallyingCall, castSpell, isUnitVisible });

let pendingRiverSiegeTest=null;
function startBattleWithArmy(army,faction,battleType="skirmish",siegeRole="attacker"){S.warbandSkirmish=false;S.objectiveMode=pendingObjectiveMode;pendingObjectiveMode=null;if(roguelikeBuilderMode){roguelikeBuilderMode=false;roguelike?.beginBattle(army,faction,roguelikeArmyPoints(army,faction));return;}if(pendingRiverSiegeTest){S.customSiegeMap={...pendingRiverSiegeTest};battleType="siege";siegeRole="attacker";S.objectiveMode=null;pendingRiverSiegeTest=null;}else S.customSiegeMap=null;grandCampaignReturn=false;campaignBattle=false;S.battleType=battleType;S.siegeRole=siegeRole;S.autoTerrain=true;S.terrainSeed=Date.now();const budgetMultiplier=battleType==="siege"?(siegeRole==="attacker"?1/1.5:1.5):1;const playerForce=createUnitsFromArmy(army,faction),aiRoster=buildOpponentArmy(army,faction,{budgetMultiplier,siege:battleType==="siege"}),aiForce=createUnitsFromArmy(aiRoster,faction);S.units={...Object.fromEntries(Object.entries(playerForce).filter(([id])=>id.startsWith("p"))),...Object.fromEntries(Object.entries(aiForce).filter(([id])=>id.startsWith("a")))};initializeObjectives();if(battleType==="siege"){const castle={left:.29,right:.71,top:.22,bottom:.78};Object.values(S.units).forEach(u=>{if(u.side==="player"){u.x=siegeRole==="defender"?.5:.12;u.y=.5;}else{u.x=siegeRole==="defender"?.12:.5;u.y=.5;}u.facing=u.side==="player"?(siegeRole==="defender"?0:0):Math.PI;});}const playerPoints=units().filter(u=>u.side==="player").reduce((sum,u)=>sum+(u.points||0),0),aiPoints=units().filter(u=>u.side==="ai").reduce((sum,u)=>sum+(u.points||0),0);$("mainmenu").hidden=true;$("mode-screen").hidden=true;$("campaign-screen").hidden=true;$("collection-screen").hidden=true;$("armybuilder").hidden=true;$("game").hidden=false;reset();if(S.customSiegeMap){const approach=S.customSiegeMap.approach,side=approach==="east"?"east":approach==="north"?"north":approach==="south"?"south":"west",wallCandidates=S.terrain.filter(t=>t.type==="wall"&&t.castle&&String(t.side||"").startsWith(side)&&(t.wounds??2)>0),rangedDefenders=units().filter(u=>u.side==="ai"&&(u.range>0||u.hasRangedWeapon||u.rangedWeapon||u.isSiegeEngine));rangedDefenders.forEach((u,i)=>{const wall=wallCandidates[i%Math.max(1,wallCandidates.length)];if(!wall)return;const sameWallCount=wallCandidates.length===1?rangedDefenders.length:Math.ceil(rangedDefenders.length/wallCandidates.length),slot=wallCandidates.length===1?i:i%wallCandidates.length,t=.18+.64*((slot%Math.max(1,sameWallCount)+1)/(sameWallCount+1));u.x=wall.x1+(wall.x2-wall.x1)*t;u.y=wall.y1+(wall.y2-wall.y1)*t;u.wallLevel=true;u.wallSegment=wall;u.wallDefence={wall,posture:"active"};});}say((battleType==="siege"?"Siege · you are the "+siegeRole+". ":"Skirmish · ")+"Your army "+playerPoints+" pts; opponent "+aiPoints+" pts ("+(aiPoints>=playerPoints?"+"+(aiPoints-playerPoints):"−"+(playerPoints-aiPoints))+" pts). "+(battleType==="siege"?"The attacker receives 50% more budget; castle walls are T10/10 W and gates T8/6 W.":""));setupCanvas();}
function roguelikeCampaignStatCost(config,faction){
 const m=config.models||1,dwarf=faction==="dwarfs",elf=faction==="highElves",character=["captain","lord","mageHero","mageLord","starwardenLord","goblinShaman","goblinGreatShaman","orcShaman","orcGreatShaman","legendaryLord","shadowElf","pegasusChampion","rifleman","captainWeiss","dwarfCaptain","dwarfLord","dwarfKingHaldric","goblinHero","goblinLord","orcHero","orcLord"].includes(config.type),s=config.campaignStats||{};
 const rate={M:character?(dwarf?8:5):(dwarf?4:2)*m,WS:character?(elf?3:5):(elf?1:2)*m,BS:character?(elf?3:5):(elf?1:2)*m,S:character?6:3*m,T:character?(dwarf?5:elf?10:8):(dwarf?2:elf?6:4)*m,I:character?(dwarf?5:3):(dwarf?3:1)*m,Ld:character?3:m};
 return (s.M||0)*rate.M+(s.S||0)*rate.S+(s.T||0)*rate.T+(s.WS||0)*rate.WS+(s.BS||0)*rate.BS+(s.I||0)*rate.I+(s.Ld||0)*rate.Ld+(s.MI||0)*(rate.M+rate.I);
}
function roguelikeUnitCost(config,faction){
 const base=unitCost(config,faction),type=config.type,models=config.models||1;
 const fixed=["cannon","boltThrower","youngDragon","dragon","ancientDragon","pegasusChampion","dwarfKingHaldric"].includes(type);
 const character=["captain","lord","mageHero","mageLord","starwardenLord","goblinShaman","goblinGreatShaman","orcShaman","orcGreatShaman","legendaryLord","shadowElf","pegasusChampion","rifleman","captainWeiss","dwarfCaptain","dwarfLord","dwarfKingHaldric","goblinHero","goblinLord","orcHero","orcLord"].includes(type);
 const skillCount=["rerollOnesMelee","rerollOnesShooting","steadfast","skirmish"].filter(key=>config.skills?.[key]).length;
 return base+(!fixed&&!character?skillCount*3*Math.max(0,models-1):0)+roguelikeCampaignStatCost(config,faction);
}
function roguelikeArmyPoints(army,faction){return army.reduce((sum,u)=>sum+roguelikeUnitCost(u,faction),0);}
function startRoguelikeBattle(army,faction,round,targetPoints,battleType="skirmish",siegeRole="attacker"){
 grandCampaignReturn=false;campaignBattle=false;roguelikeBattle=true;S.battleType=battleType;S.siegeRole=siegeRole;S.autoTerrain=true;S.terrainSeed=Date.now();
 const playerForce=createUnitsFromArmy(army,faction),playerPoints=roguelikeArmyPoints(army,faction),basePoints=army.reduce((sum,u)=>sum+unitCost(u,faction),0);
 const siegeMultiplier=battleType==="siege"?(siegeRole==="defender"?1.5:1/1.5):1,enemyTarget=Math.round(targetPoints*siegeMultiplier);
 const aiRoster=buildOpponentArmy(army,faction,{budgetMultiplier:enemyTarget/Math.max(1,basePoints),siege:battleType==="siege"}),aiForce=createUnitsFromArmy(aiRoster,faction);
 S.units={...Object.fromEntries(Object.entries(playerForce).filter(([id])=>id.startsWith("p"))),...Object.fromEntries(Object.entries(aiForce).filter(([id])=>id.startsWith("a")))};
 S.objectiveMode=battleType==="skirmish"?chooseExpeditionObjective():null;initializeObjectives();
 $("mainmenu").hidden=true;$("mode-screen").hidden=true;$("campaign-screen").hidden=true;$("roguelike-screen").hidden=true;$("collection-screen").hidden=true;$("armybuilder").hidden=true;$("game").hidden=false;
 reset();
 army.forEach((cfg,i)=>{const id="p"+(i+1),u=S.units[id];if(!u)return;if(cfg.currentDamage!=null)u.damage=Math.max(0,Number(cfg.currentDamage)||0);if(cfg.currentWounds!=null&&u.isCharacter)u.characterWounds=Math.max(0,Math.min(u.stats.W,cfg.currentWounds));if(cfg.currentArtilleryWounds!=null&&u.isSiegeEngine)u.artilleryWounds=Math.max(0,Math.min(u.artilleryStartWounds,cfg.currentArtilleryWounds));if(cfg.currentChariotWounds!=null&&u.isChariot)u.chariotWounds=Math.max(0,Math.min(u.chariotStartWounds,cfg.currentChariotWounds));if(cfg.type==="lord"&&["youngDragon","dragon","ancientDragon"].includes(cfg.mountType)){const rider=S.units[id+"r"];if(rider&&cfg.currentWounds!=null)rider.characterWounds=Math.max(0,Math.min(rider.stats.W,cfg.currentWounds));}});
 const actualEnemy=units().filter(u=>u.side==="ai").reduce((sum,u)=>sum+(u.points||0),0);
 say("Roguelike · Round "+round+" · "+(battleType==="siege"?"Siege — you are the "+siegeRole+". ":expeditionObjectiveLabel(S.objectiveMode)+". ")+"Your army "+playerPoints+" pts; opponent "+actualEnemy+" pts (target "+enemyTarget+")."+(battleType==="siege"?" The attacker must breach the castle by the end of turn 10; otherwise the defender wins.":""));setupCanvas();
}

const AI_LAB_ROSTERS={
 empire:{infantry:["swordsmen","archers"],mobile:["cavalry"],heroes:["captain","mageHero","lord"],support:["cannon","humanChariot"]},
 highElves:{infantry:["swordsmen","archers"],mobile:["cavalry"],heroes:["captain","mageHero","lord"],support:["boltThrower","elfChariot","youngDragon","dragon"]},
 dwarfs:{infantry:["dwarfInfantry"],mobile:[],heroes:["dwarfCaptain","dwarfLord"],support:["cannon"]},
 greenskins:{infantry:["goblins","orcBoyz"],mobile:["wolfRiders","boarBoyz"],heroes:["goblinHero","orcHero","goblinShaman","orcShaman"],support:["catapult","trolls","giant"]},
 undead:{infantry:["skeletons","zombies"],mobile:["skeletonHorses"],heroes:["necromancer","vampireHero"],support:["catapult","skeletonChariot","skeletonDragon"]}
};
let aiLabRun=null;
function labRandomInt(min,max){return min+Math.floor(Math.random()*(max-min+1));}
function makeAiLabArmyOnce(faction,budget,style){
 const groups=AI_LAB_ROSTERS[faction]||AI_LAB_ROSTERS.empire,all=[...groups.infantry,...groups.mobile,...groups.heroes,...groups.support].filter(t=>FACTIONS[faction]?.units?.[t]);
 const weighted=style==="melee"?[...groups.infantry,...groups.infantry,...groups.heroes,...groups.mobile]:style==="ranged"?[...groups.infantry,...groups.infantry,...groups.support,...groups.heroes]:style==="mobile"?[...groups.mobile,...groups.mobile,...groups.infantry,...groups.heroes]:all;
 const candidates=[...new Set(weighted.filter(t=>FACTIONS[faction]?.units?.[t]))];
 const infantry=new Set(["swordsmen","archers","dwarfInfantry","goblins","orcBoyz","skeletons","zombies","trolls"]);
 const cavalry=new Set(["cavalry","wolfRiders","boarBoyz","skeletonHorses"]);
 const artillery=new Set(["cannon","boltThrower","catapult"]);
 const army=[];let spent=0;
 for(let slot=0;slot<6;slot++){
  const source=slot<2?groups.infantry:candidates;
  const choices=source.filter(t=>candidates.includes(t)&&unitCost({type:t,models:infantry.has(t)?5:cavalry.has(t)?5:1,weapon:"handWeapon"},faction)<=budget-spent);
  if(!choices.length)break;
  const type=choices[labRandomInt(0,choices.length-1)];
  const entry={type,models:infantry.has(type)?labRandomInt(8,20):cavalry.has(type)?labRandomInt(5,10):artillery.has(type)?(type==="boltThrower"?2:3):1,weapon:"handWeapon"};
  if(type==="archers")entry.rangedWeapon="bow";
  if(type==="cavalry")entry.freeCavalryOption=faction==="highElves"?"bow":"spear";
  let cost=unitCost(entry,faction);
  while(cost>budget-spent&&infantry.has(type)&&entry.models>5){entry.models--;cost=unitCost(entry,faction);}
  if(cost<=budget-spent){army.push(entry);spent+=cost;}
 }
 if(!army.length){const fallback=candidates.find(t=>infantry.has(t))||candidates[0]||"swordsmen";army.push({type:fallback,models:5,weapon:"handWeapon"});spent=unitCost(army[0],faction);}
 for(let guard=0;guard<250;guard++){
  let best=null,bestGap=Math.abs(budget-spent);
  for(let i=0;i<army.length;i++){const u=army[i],max=infantry.has(u.type)?30:cavalry.has(u.type)?15:0;if(!max||u.models>=max)continue;const next={...u,models:u.models+1},delta=unitCost(next,faction)-unitCost(u,faction),gap=Math.abs(budget-(spent+delta));if(spent+delta<=budget*1.08&&gap<bestGap){best={i,next,delta};bestGap=gap;}}
  if(!best)break;army[best.i]=best.next;spent+=best.delta;
 }
 return army.slice(0,6);
}
function makeAiLabArmy(faction,budget,style){
 let best=null,bestGap=Infinity;
 for(let attempt=0;attempt<30;attempt++){
  const candidate=makeAiLabArmyOnce(faction,budget,style),points=candidate.reduce((sum,u)=>sum+unitCost(u,faction),0),gap=Math.abs(budget-points);
  if(points<=budget*1.08&&gap<bestGap){best=candidate;bestGap=gap;}
  if(gap<=budget*.025)break;
 }
 return best||makeAiLabArmyOnce(faction,budget,style);
}
function labSurvivingPoints(side){
 return units().filter(u=>u.side===side).reduce((sum,u)=>{const start=Math.max(1,u.startModels||u.models||1),models=Math.max(0,u.models||0),wounds=u.stats?.W||1;const fraction=u.isCharacter||u.isDragon||u.isDragonRider?Math.max(0,Math.min(1,(u.characterWounds??wounds)/wounds)):Math.max(0,Math.min(1,models/start));return sum+Math.round((u.points||0)*fraction);},0);
}
function runAiBattleLab(){
 const redFaction=$("ai-lab-red-faction").value,blueFaction=$("ai-lab-blue-faction").value,points=Number($("ai-lab-points").value)||1000,count=Number($("ai-lab-count").value)||1;
 aiLabRun={redFaction,blueFaction,points,count,completed:0,results:[],stop:false,composition:$("ai-lab-composition").value,terrain:$("ai-lab-terrain").value,swap:$("ai-lab-swap-sides").checked,seed:Date.now()};
 $("ai-battle-lab-results").innerHTML="";$("ai-battle-lab-status").textContent="Preparing battle 1 of "+count+"…";$("ai-battle-lab-run").hidden=true;$("ai-battle-lab-stop").hidden=false;
 $("ai-battle-lab-screen").hidden=true;$("mainmenu").hidden=true;$("game").hidden=false;startAiLabBattle();
}
function startAiLabBattle(){
 if(!aiLabRun)return;
 const n=aiLabRun.completed;
 if(n%2===0||!aiLabRun.pair)aiLabRun.pair={redArmy:makeAiLabArmy(aiLabRun.redFaction,aiLabRun.points,aiLabRun.composition),blueArmy:makeAiLabArmy(aiLabRun.blueFaction,aiLabRun.points,aiLabRun.composition),seed:aiLabRun.seed+Math.floor(n/2)*7919};
 const {redArmy,blueArmy}=aiLabRun.pair;
 const red=createUnitsFromArmy(redArmy,aiLabRun.redFaction,{preserveFactionForOpponent:true}),blue=createUnitsFromArmy(blueArmy,aiLabRun.blueFaction,{preserveFactionForOpponent:true});
 S.aiBattleLab=true;S.aiLabBattleNumber=n+1;S.warbandSkirmish=false;S.objectiveMode=null;S.objectives=[];S.flags=null;S.objectiveScore={player:0,ai:0};S.battleType="skirmish";S.siegeRole="attacker";S.customSiegeMap=null;S.autoTerrain=true;S.terrainSeed=aiLabRun.terrain==="fixed"?aiLabRun.seed:aiLabRun.pair.seed;
 S.units={...Object.fromEntries(Object.entries(red).filter(([id])=>id.startsWith("p"))),...Object.fromEntries(Object.entries(blue).filter(([id])=>id.startsWith("a")))};
 const redPoints=units().filter(u=>u.side==="player").reduce((sum,u)=>sum+(u.points||0),0),bluePoints=units().filter(u=>u.side==="ai").reduce((sum,u)=>sum+(u.points||0),0);
 reset();Object.values(S.units).forEach(u=>{u.deployed=true;u.aiLabTeam=u.side==="player"?"red":"blue";});
 const reverse=aiLabRun.swap&&n%2===1;if(reverse)Object.values(S.units).forEach(u=>{u.x=1-u.x;u.y=1-u.y;u.facing=(u.facing||0)+Math.PI;});
 S.aiLabStartingPoints={red:redPoints,blue:bluePoints};$("battle-menu-caption").textContent="AI Battle Lab · Battle "+(n+1)+"/"+aiLabRun.count;
 say("AI Battle Lab · Red baseline ("+aiLabRun.redFaction+") "+redPoints+" pts vs Blue experimental ("+aiLabRun.blueFaction+") "+bluePoints+" pts. "+(reverse?"Reversed deployment sides. ":"")+"Battle "+(n+1)+" of "+aiLabRun.count+".");
 setPhase("charges");window.setTimeout(runAiLabCharges,0);
}
function runAiLabMovement(){
 if(!S.aiBattleLab||S.finished)return;beginMovementPhase();S.activationSide="player";units().filter(u=>u.fled&&alive(u)).forEach(rallyUnit);
 let guard=0;while(LAB_RED_AI.runAiActivation()&&guard++<30){}guard=0;while(LAB_BLUE_AI.runAiActivation()&&guard++<30){}
 updateObjectiveInteractions();beginCombatPhase();
}
function runAiLabCharges(){
 if(!S.aiBattleLab||S.finished||S.phase!=="charges")return;
 if(S.turn>=16){finishBattle("The battle is a draw! (AI Lab turn limit)");return;}
 if(S.chargeSide==="ai"){aiChargeStep();if(S.phase==="charges")window.setTimeout(runAiLabCharges,0);return;}
 const candidates=units().filter(u=>u.side==="player"&&alive(u)&&!u.engaged&&!u.fled&&!u.charged&&(!S.priorityChargePending||hasPriorityRule(u))).map(u=>({u,t:visibleEnemies(u).filter(t=>(!t.engaged||t.flyingMount)&&!t.fled&&dist(u,t)<=u.stats.M*2&&canCharge(u,t)).sort((a,b)=>dist(u,a)-dist(u,b))[0]})).filter(x=>x.t).sort((a,b)=>dist(a.u,a.t)-dist(b.u,b.t));
 if(candidates.length){if(!declareCharge(candidates[0].u,candidates[0].t))candidates[0].u.charged=true;window.setTimeout(runAiLabCharges,0);return;}
 if(S.priorityChargePending){S.priorityChargePending=false;S.chargeSide=S.normalChargeSide;if(S.chargeSide==="player"){window.setTimeout(runAiLabCharges,0);return;}}S.chargePasses++;if(S.chargePasses>=2){resolveDeclaredCharges();return;}S.chargeSide="ai";aiChargeStep();if(S.phase==="charges")window.setTimeout(runAiLabCharges,0);
}
function finishAiLabBattle(msg){
 if(!S.aiBattleLab||!aiLabRun)return;S.finished=true;S.phase="over";clearBattleSave();
 const redAlive=units().some(u=>u.side==="player"&&alive(u)&&!u.fled),blueAlive=units().some(u=>u.side==="ai"&&alive(u)&&!u.fled);
 const winner=msg.toLowerCase().includes("draw")?"draw":msg.toLowerCase().includes("player wins")?"red":msg.toLowerCase().includes("opponent wins")?"blue":redAlive&&!blueAlive?"red":blueAlive&&!redAlive?"blue":"draw";
 aiLabRun.completed++;aiLabRun.results.push({battle:aiLabRun.completed,winner,turns:S.turn,redStart:S.aiLabStartingPoints?.red||0,blueStart:S.aiLabStartingPoints?.blue||0,redRemaining:labSurvivingPoints("player"),blueRemaining:labSurvivingPoints("ai"),reason:msg.replace(/<[^>]*>/g,"")});
 const redWins=aiLabRun.results.filter(r=>r.winner==="red").length,blueWins=aiLabRun.results.filter(r=>r.winner==="blue").length,draws=aiLabRun.results.filter(r=>r.winner==="draw").length;
 $("ai-battle-lab-status").textContent="Completed "+aiLabRun.completed+" / "+aiLabRun.count+" · Red wins "+redWins+" · Blue wins "+blueWins+" · Draws "+draws+".";
 if(aiLabRun.completed<aiLabRun.count&&!aiLabRun.stop){window.setTimeout(startAiLabBattle,0);return;}
 S.aiBattleLab=false;$("game").hidden=true;$("ai-battle-lab-screen").hidden=false;$("ai-battle-lab-run").hidden=false;$("ai-battle-lab-stop").hidden=true;
 const n=aiLabRun.results.length,redRate=n?Math.round(redWins/n*100):0,blueRate=n?Math.round(blueWins/n*100):0;
 const rows=aiLabRun.results.map(r=>"<tr><td>"+r.battle+"</td><td class='"+r.winner+"'>"+(r.winner==="red"?"Red win":r.winner==="blue"?"Blue win":"Draw")+"</td><td>"+r.turns+"</td><td>"+r.redRemaining+"</td><td>"+r.blueRemaining+"</td></tr>").join("");
 $("ai-battle-lab-results").innerHTML="<h2>Batch results</h2><p><strong>Red win rate:</strong> "+redRate+"% ("+redWins+") · <strong>Blue win rate:</strong> "+blueRate+"% ("+blueWins+") · <strong>Draws:</strong> "+draws+"</p><p>Average surviving points — Red "+Math.round(aiLabRun.results.reduce((s,r)=>s+r.redRemaining,0)/Math.max(1,n))+"; Blue "+Math.round(aiLabRun.results.reduce((s,r)=>s+r.blueRemaining,0)/Math.max(1,n))+". These are initial test results, not proof of general superiority.</p><table class='lab-results-table'><thead><tr><th>#</th><th>Winner</th><th>Turns</th><th>Red left</th><th>Blue left</th></tr></thead><tbody>"+rows+"</tbody></table>";
 $("battle-menu-caption").textContent="Battle";
}
function startPoliticalCampaignBattle({army, faction="empire", enemyArmy, enemyFaction="empire", onComplete}){
 if(!Array.isArray(army)||!army.length||!Array.isArray(enemyArmy)||!enemyArmy.length)return false;
 S.battleType="skirmish";S.siegeRole="attacker";S.autoTerrain=true;S.terrainSeed=Date.now();
 const playerForce=createUnitsFromArmy(army,faction),enemySource=createUnitsFromArmy(enemyArmy,enemyFaction),enemyForce={};
 for(const [oldId,unit] of Object.entries(enemySource).filter(([id])=>id.startsWith("p"))){const id=oldId.replace(/^p/,"a");const copy={...unit,id,side:"ai",attachedCharacters:(unit.attachedCharacters||[]).map(characterId=>characterId.replace(/^p/,"a")),attachedTo:unit.attachedTo?unit.attachedTo.replace(/^p/,"a"):null};enemyForce[id]=copy;}
 S.units={...Object.fromEntries(Object.entries(playerForce).filter(([id])=>id.startsWith("p"))),...enemyForce};
 campaignBattle=false;roguelikeBattle=false;grandCampaignBattle=true;grandCampaignReturn=true;grandCampaignBattleComplete=onComplete;
 $("mainmenu").hidden=true;$("mode-screen").hidden=true;$("campaign-screen").hidden=true;$("roguelike-screen").hidden=true;$("collection-screen").hidden=true;$("armybuilder").hidden=true;$("grand-campaign-screen").hidden=true;$("game").hidden=false;$("battle-return").hidden=true;
 reset();say("Grand campaign battle · "+faction+" against "+enemyFaction+". Victory or defeat will change the campaign.");setupCanvas();return true;
}
window.startPoliticalCampaignBattle=startPoliticalCampaignBattle;
function startWarbandBattle(army,faction,budget){
  grandCampaignReturn=false;S.objectiveMode=null;S.objectives=[];S.flags=null;S.objectiveScore={player:0,ai:0};
  campaignBattle=false;grandCampaignBattle=false;roguelikeBattle=false;warbandBattle=true;S.warbandSkirmish=true;S.battleType="skirmish";S.siegeRole="attacker";S.autoTerrain=true;S.terrainSeed=Date.now();
  const playerForce=createUnitsFromArmy(army,faction),aiRoster=army.map(entry=>({...entry,meleeWeapons:[...(entry.meleeWeapons||[])],warbandCollectionId:undefined})).sort(()=>Math.random()-.5),aiForce=createUnitsFromArmy(aiRoster,faction);
  S.units={...Object.fromEntries(Object.entries(playerForce).filter(([id])=>id.startsWith("p"))),...Object.fromEntries(Object.entries(aiForce).filter(([id])=>id.startsWith("a")))};
  Object.values(S.units).forEach(u=>{u.attachedTo=null;u.attachedCharacters=[];u.isWarbandFighter=true;u.isCharacter=true;u.singleCharacter=true;u.models=1;u.startModels=1;u.warbandWounds=Math.max(1,u.stats?.W||u.characterWounds||1);u.characterWounds=u.warbandWounds;u.warbandStatus=null;u.name=u.name||u.type;});
  const playerPoints=units().filter(u=>u.side==="player").reduce((sum,u)=>sum+(u.points||0),0),aiPoints=units().filter(u=>u.side==="ai").reduce((sum,u)=>sum+(u.points||0),0);
  $("mainmenu").hidden=true;$("mode-screen").hidden=true;$("warband-screen").hidden=true;$("campaign-screen").hidden=true;$("collection-screen").hidden=true;$("armybuilder").hidden=true;$("game").hidden=false;reset();say("Warband Skirmish · "+units().filter(u=>u.side==="player").length+" individual fighters · "+playerPoints+" pts; AI "+aiPoints+" pts. Injury rolls are active; the warband is temporary.");setupCanvas();
}
function startWarbandExpeditionBattle(army,faction,round){
 grandCampaignReturn=false;campaignBattle=false;grandCampaignBattle=false;roguelikeBattle=false;warbandBattle=false;warbandExpeditionBattle=true;S.warbandSkirmish=true;S.warbandExpedition=true;S.warbandKills=0;S.battleType="skirmish";S.siegeRole="attacker";S.autoTerrain=true;S.terrainSeed=Date.now();
 const playerForce=createUnitsFromArmy(army,faction),rivalArmy=army.map(f=>({...f,name:"Rival · "+(f.name||f.type),injuries:{},xp:undefined,benchFights:0})),aiForce=createUnitsFromArmy(rivalArmy,faction);
 S.units={...Object.fromEntries(Object.entries(playerForce).filter(([id])=>id.startsWith("p"))),...Object.fromEntries(Object.entries(aiForce).filter(([id])=>id.startsWith("a")))};
 S.objectiveMode=chooseExpeditionObjective();initializeObjectives();
 Object.values(S.units).forEach(u=>{u.attachedTo=null;u.attachedCharacters=[];u.isWarbandFighter=true;u.isWarbandExpeditionFighter=true;u.isCharacter=true;u.singleCharacter=true;u.models=1;u.startModels=1;u.warbandWounds=Math.max(1,u.stats?.W||u.characterWounds||1);u.characterWounds=u.warbandWounds;u.warbandStatus=null;u.warbandXpEarned=0;u.name=u.name||u.type;});
 $("mainmenu").hidden=true;$("mode-screen").hidden=true;$("warband-screen").hidden=true;$("warband-expedition-screen").hidden=true;$("campaign-screen").hidden=true;$("roguelike-screen").hidden=true;$("collection-screen").hidden=true;$("armybuilder").hidden=true;$("game").hidden=false;$("battle-return").hidden=true;reset();
 army.forEach((cfg,i)=>{const u=S.units["p"+(i+1)];if(!u)return;u.warbandFighterId=cfg.id;if(cfg.woundsCurrent!=null)u.characterWounds=u.warbandWounds=Math.max(1,Math.min(u.stats.W,Number(cfg.woundsCurrent)||1));if(cfg.injuries?.leg){u.stats.M=Math.max(1,u.stats.M-1);u.baseMove=Math.max(1,(u.baseMove??u.stats.M)-1);}if(cfg.injuries?.leftArm){u.rangedWeapon=null;u.hasBow=false;u.hasRangedWeapon=false;u.range=0;u.shield=false;u.offhandWeapon=false;u.meleeWeapons=(u.meleeWeapons||[]).filter(w=>!["greatWeapon","halberd","offhandWeapon"].includes(w));if(!u.meleeWeapons.includes("handWeapon"))u.meleeWeapons.unshift("handWeapon");if(["greatWeapon","halberd","bow","crossbow","firearm","longRifle","magicBow"].includes(u.weapon))u.weapon="handWeapon";}});
 say("Warband Expedition · Fight "+round+" · "+army.length+" individual fighters · Mission: "+expeditionObjectiveLabel(S.objectiveMode)+". Fighters who go out of action face a post-battle injury roll; opponents removed in battle grant 1 XP to the nearest available fighter. Set up and fight.");setupCanvas();
}
function startCampaignBattle(army,enemyConfig){
 S.objectiveMode=null;S.objectives=[];S.flags=null;S.objectiveScore={player:0,ai:0};
 S.autoTerrain=true;S.terrainSeed=Date.now();const playerUnits=createUnitsFromArmy(army,"empire");
 const enemyPair=createUnitsFromArmy([{type:"swordsmen",models:20,weapon:"handWeapon",champion:false}], "empire");
 const enemy=enemyPair.a1;enemy.id="a1";enemy.side="ai";enemy.name="Enemy Human Swordsmen";enemy.x=.78;enemy.y=.5;enemy.facing=Math.PI;enemy.deployed=true;
 S.units={...Object.fromEntries(Object.entries(playerUnits).filter(([id])=>id.startsWith("p"))),a1:enemy};
 campaignBattle=true;$("mainmenu").hidden=true;$("mode-screen").hidden=true;$("campaign-screen").hidden=true;$("collection-screen").hidden=true;$("armybuilder").hidden=true;$("game").hidden=false;reset();setupCanvas();
}
function showMainMenu(){S.customSiegeMap=null;$("game").hidden=true;$("armybuilder").hidden=true;$("collection-screen").hidden=true;$("mode-screen").hidden=true;$("campaign-screen").hidden=true;$("roguelike-screen").hidden=true;$("warband-screen").hidden=true;$("warband-expedition-screen").hidden=true;$("river-siege-test-screen").hidden=true;$("mainmenu").hidden=false;}
function showCollection(){S.customSiegeMap=null;$("game").hidden=true;$("armybuilder").hidden=true;$("mode-screen").hidden=true;$("mainmenu").hidden=true;$("river-siege-test-screen").hidden=true;$("collection-screen").hidden=false;if($("battle-type"))$("battle-type").disabled=false;if($("battle-type")?.closest("label"))$("battle-type").closest("label").hidden=false;}
let pendingObjectiveMode=null;
function showSkirmishBuilder(objectiveMode=null){pendingObjectiveMode=objectiveMode;$("game").hidden=true;$("mainmenu").hidden=true;$("mode-screen").hidden=true;$("collection-screen").hidden=true;$("roguelike-screen").hidden=true;armyBuilder?.configureSkirmish();armyBuilder?.open();}
let collectionManager=null;
let narrativeCampaign=null;
let roguelike=null;
let warband=null,warbandBattle=false;
let warbandExpedition=null,warbandExpeditionBattle=false;
let campaignBattle=false,grandCampaignBattle=false,grandCampaignReturn=false,grandCampaignBattleComplete=null,roguelikeBattle=false,roguelikeBuilderMode=false;
function validateArmy(army,faction){
 if(collectionManager?.getBypass())return "";
 const owned=(collectionManager?.getInventory()||[]).slice(),used=new Set(),shortages=[];
 if(roguelikeBuilderMode){
  for(const loss of roguelike?.getLostModels()||[]){
   let remaining=Number(loss.count)||0;
   for(let i=owned.length-1;i>=0&&remaining>0;i--){
    const m=owned[i],mount=m.mountType||(m.mounted?"horse":"none");
    const mappedLossType=loss.type==="goblinShaman"?"goblinHero":loss.type==="goblinGreatShaman"?"goblinLord":loss.type==="orcShaman"?"orcHero":loss.type==="orcGreatShaman"?"orcLord":loss.type==="mageHero"?"captain":loss.type==="mageLord"?"lord":lossType;
    const matches=m.faction===loss.faction&&(loss.kind==="infantry"?!m.mounted&&["swordsmen","archers","dwarfInfantry"].includes(m.type):loss.kind==="cavalry"?m.type==="cavalry"&&!!m.mounted&&mount===loss.mountType:m.type===mappedLossType&&!!m.mounted===!!loss.mounted&&mount===loss.mountType);
    if(matches){owned.splice(i,1);remaining--;}
   }
  }
 }
 for(const entry of army){
  if(["humanChariot","elfChariot","goblinChariot","orcChariot"].includes(entry.type)){const expectedFaction=entry.type==="humanChariot"?"empire":entry.type==="elfChariot"?"highElves":"greenskins";if(faction!==expectedFaction){shortages.push("That chariot is only available to its matching faction.");continue;}const model=owned.find(m=>!used.has(m.id)&&m.faction===faction&&m.type===entry.type);if(!model)shortages.push("One assembled "+entry.type+" model is required.");else used.add(model.id);continue;}
  if(entry.type==="cannon"||entry.type==="boltThrower"){
    const allowed=entry.type==="boltThrower"?faction==="highElves":faction==="empire"||faction==="dwarfs";
    if(!allowed){shortages.push(entry.type==="boltThrower"?"Bolt throwers are only available to the Elves.":"Cannons are only available to humans and dwarves.");continue;}
    const machine=owned.find(m=>!used.has(m.id)&&m.faction===faction&&m.type===entry.type);
    if(!machine)shortages.push("One assembled "+(entry.type==="cannon"?"cannon":"bolt thrower")+" is required.");else used.add(machine.id);
    const crewCount=entry.type==="cannon"?3:2,crewType=faction==="dwarfs"?"dwarfInfantry":"swordsmen",crewWeapon=faction==="highElves"?"spear":"handWeapon";
    const crew=owned.filter(m=>!used.has(m.id)&&m.faction===faction&&m.type===crewType&&m.weapon===crewWeapon&&!m.mounted);
    if(crew.length<crewCount)shortages.push((crewCount-crew.length)+" compatible "+(faction==="highElves"?"spear-armed elven":faction==="dwarfs"?"dwarf":"human")+" crew model(s) needed for the "+entry.type+".");
    crew.slice(0,crewCount).forEach(m=>used.add(m.id));
    continue;
   }
   if(["youngDragon","dragon","ancientDragon"].includes(entry.type)){if(faction!=="highElves")shortages.push("Dragons are only available to the Elves.");continue;}
  const character=["captain","lord","mageHero","mageLord","starwardenLord","goblinShaman","goblinGreatShaman","orcShaman","orcGreatShaman","legendaryLord","shadowElf","pegasusChampion","dwarfCaptain","dwarfLord","dwarfKingHaldric","rifleman","captainWeiss","goblinHero","goblinLord","orcHero","orcLord"].includes(entry.type);
  if(entry.type==="orcLord"&&entry.mountType==="wyvern"){if(faction!=="greenskins")shortages.push("Only Orc Warbosses may ride Wyverns.");continue;}if(entry.type==="lord"&&["youngDragon","dragon","ancientDragon"].includes(entry.mountType)){if(faction!=="highElves")shortages.push("Only Elf Lords may ride dragons.");continue;}
  const collectionType=entry.type;const count=character?1:(entry.models||1);
  const mounted=entry.type==="cavalry"||(character&&!!entry.mounted),expectedMount=mounted?(entry.mountType||(entry.type==="cavalry"?"horse":"horse")):"none";
  const matches=owned.filter(m=>!used.has(m.id)&&m.faction===faction&&(m.type===collectionType||(["swordsmen","archers"].includes(entry.type)&&["swordsmen","archers"].includes(m.type)))&&!!m.mounted===mounted&&(m.mountType||(m.mounted?"horse":"none"))===expectedMount);
  if(matches.length<count)shortages.push((count-matches.length)+" "+entry.type+" model(s) needed"+(mounted?" mounted":""));
  matches.slice(0,count).forEach(m=>used.add(m.id));
 }
 return shortages.length?"Not enough matching miniatures: "+shortages.join("; ")+". Add models in your Collection, or enable the developer bypass.":"";
}
let armyBuilder=null;
armyBuilder=createArmyBuilder({ $, onStart:startBattleWithArmy, onBack:()=>{if(roguelikeBuilderMode){roguelikeBuilderMode=false;roguelike?.open();}else if(pendingRiverSiegeTest){$("armybuilder").hidden=true;$("river-siege-test-screen").hidden=false;if($("battle-type"))$("battle-type").disabled=false;if($("battle-type")?.closest("label"))$("battle-type").closest("label").hidden=false;}else showCollection();}, validateArmy });
$("river-siege-test-open").addEventListener("click",()=>{$("mainmenu").hidden=true;$("river-siege-test-screen").hidden=false;});
$("river-siege-test-back").addEventListener("click",()=>{pendingRiverSiegeTest=null;$("river-siege-test-screen").hidden=true;$("mainmenu").hidden=false;});
$("river-siege-test-army").addEventListener("click",()=>{pendingRiverSiegeTest={city:$("river-siege-city").value,approach:$("river-siege-approach").value};$("river-siege-test-screen").hidden=true;armyBuilder?.configureSkirmish();armyBuilder?.open();$("battle-type").value="siege";$("battle-type").disabled=true;if($("battle-type").closest("label"))$("battle-type").closest("label").hidden=true;$("siege-role").value="attacker";});
$("ai-battle-lab-open")?.addEventListener("click",()=>{$("mainmenu").hidden=true;$("ai-battle-lab-screen").hidden=false;});
$("ai-battle-lab-back")?.addEventListener("click",()=>{$("ai-battle-lab-screen").hidden=true;$("mainmenu").hidden=false;});
$("ai-battle-lab-run")?.addEventListener("click",runAiBattleLab);
$("ai-battle-lab-stop")?.addEventListener("click",()=>{if(aiLabRun){aiLabRun.stop=true;$("ai-battle-lab-status").textContent+=" Stop requested; finishing current battle.";$("ai-battle-lab-stop").hidden=true;}});
narrativeCampaign=createNarrativeCampaign({$,onStartBattle:startCampaignBattle,onReturnMenu:showMainMenu});
collectionManager=createCollectionManager({$,onSkirmish:showSkirmishBuilder,onMainMenu:showMainMenu,onNarrativeCampaign:()=>narrativeCampaign.open(),onRoguelike:()=>roguelike?.open(),onWarband:()=>warband?.open(),onWarbandExpedition:()=>warbandExpedition?.open(),onResetCollection:()=>roguelike?.resetProgress()});
warband=createWarband({$,getInventory:()=>collectionManager?.getInventory()||[],getBypass:()=>collectionManager?.getBypass(),startBattle:startWarbandBattle,grantLootbox:source=>collectionManager?.grantLootbox(source)});
roguelike=createRoguelike({
 $,
 onBuildArmy:(army,limit,faction)=>{roguelikeBuilderMode=true;armyBuilder.configureCampaign(army,limit,faction);armyBuilder.open();},
 onStartBattle:(army,faction,round,targetPoints)=>startRoguelikeBattle(army,faction,round,targetPoints),
 onReturnMenu:showMainMenu,
 grantModel:(category,round)=>collectionManager?.grantRoguelikeModel(category,round),
 grantLootbox:source=>collectionManager?.grantLootbox(source),
 calculatePoints:roguelikeArmyPoints,
 resetProgress:()=>{}
});
warbandExpedition=createWarbandExpedition({$,getInventory:()=>collectionManager?.getInventory()||[],getBypass:()=>collectionManager?.getBypass(),startBattle:startWarbandExpeditionBattle});
$("battle-return").addEventListener("click",()=>{ $("battle-return").hidden=true;if(grandCampaignReturn){const game=$("game"),campaignScreen=$("grand-campaign-screen");if(game)game.hidden=true;if(campaignScreen)campaignScreen.hidden=false;return;}showCollection();collectionManager?.open();});
$("warband-revive").addEventListener("click",()=>{if(!S.warbandSkirmish||S.phase!=="movement")return;const rescuer=S.units[S.selected];if(!rescuer||rescuer.side!=="player"||!alive(rescuer)||rescuer.warbandStatus||rescuer.fled||rescuer.engaged||rescuer.activated)return;const target=units().filter(v=>v.side==="player"&&v.warbandStatus==="unconscious"&&alive(v)&&dist(rescuer,v)<=1.5).sort((a,b)=>dist(a,rescuer)-dist(b,rescuer))[0];if(!target)return;target.warbandStatus=null;target.warbandWounds=1;target.characterWounds=1;target.shot=true;rescuer.activated=true;S.mode=null;say(rescuer.name+" revives "+target.name+". The rescued fighter cannot shoot this turn.");render();});
function restoreBattleSnapshot() {
 let snapshot = null;
 try {
  const current = localStorage.getItem(BATTLE_SAVE_KEY);
  const backup = localStorage.getItem(BATTLE_BACKUP_KEY);
  for (const candidate of [current, backup]) {
   if (!candidate) continue;
   try {
    const parsed = JSON.parse(candidate);
    if (parsed?.schemaVersion === 1 && parsed.state?.units && Object.keys(parsed.state.units).length && parsed.state.phase && parsed.state.phase !== "over") {
     snapshot = parsed;
     break;
    }
   } catch {}
  }
 } catch {}
 persistenceReady = true;
 if (!snapshot) return;
 try {
  Object.assign(S, snapshot.state);
  if (snapshot.view && Number.isFinite(snapshot.view.zoom)) Object.assign(view, snapshot.view);
  campaignBattle = !!snapshot.campaignBattle;
  grandCampaignBattle = !!snapshot.grandCampaignBattle;
  roguelikeBattle = !!snapshot.roguelikeBattle;
  $("mainmenu").hidden = true;
  $("mode-screen").hidden = true;
  $("campaign-screen").hidden = true;
  $("roguelike-screen").hidden = true;
  $("collection-screen").hidden = true;
  $("armybuilder").hidden = true;
  $("game").hidden = false;
  $("battle-return").hidden = true;
  $("log").innerHTML = (S.log || []).map(x=>'<div class="logentry">'+x+'</div>').join("");
  $("rollcontent").replaceChildren();
  setupCanvas();
  render();
 } catch (error) {
  console.warn("Could not restore autosaved battle", error);
 }
}
installBattleMenu();
window.addEventListener("pagehide", saveBattleSnapshot);
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="hidden") saveBattleSnapshot(); });
restoreBattleSnapshot();
})();
}
;
