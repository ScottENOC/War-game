import { createUnitsFromArmy, buildOpponentArmy, unitCost } from "./units.js?v=20261020-casters-final-v2";
import { createRoguelike } from "./roguelike.js?v=20261017-abandon-run-v1";
import { createArmyBuilder } from "./armyBuilder.js?v=20261020-casters-final-v2";
import { createCollectionManager } from "./collection.js?v=20261020-great-eagle-final-v2";
import { createGameState } from "./gameState.js";
import { createAI } from "./ai.js?v=greenskin-roster-v3";
import { createRules } from "./rules.js?v=20261020-nullification-dome-v1";
import { createShooting } from "./shooting.js?v=20261020-nullification-dome-v1";
import { createCombat } from "./combat.js?v=20261015-fear-rules-v1";
import { createRendering } from "./rendering.js?v=20261020-nullification-dome-v1";
import { createInput } from "./input.js?v=20261020-nullification-dome-v1";
import { createUI } from "./ui.js?v=20261020-nullification-dome-v1";
import { createPhases } from "./phases.js?v=20261019-animosity-v3";
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
const S=createGameState({});S.terrain=[];S.remainsInPlaySpells=[];S.pendingDome=null;S.terrainTool="off";S.battleType="skirmish";S.siegeRole="attacker";
const units=()=>Object.values(S.units), alive=u=>!!u&&(u.models>0||(u.attachedCharacters||[]).some(id=>S.units[id]&&S.units[id].models>0));
const BATTLEFIELD_HEIGHT_IN=36,W=()=>BATTLEFIELD_WIDTH_IN*20,H=()=>BATTLEFIELD_HEIGHT_IN*20,PX_PER_IN=()=>20,fieldHeightIn=()=>BATTLEFIELD_HEIGHT_IN;
const enemies=u=>units().filter(v=>v.side!==u.side&&alive(v)&&!v.attachedTo);
const MOVEMENT = createMovement({ W, H, PX_PER_IN, MODEL_BASE_IN, BATTLEFIELD_WIDTH_IN, fieldHeightIn, units, alive, terrain:()=>S.terrain, canPassGate:u=>S.battleType==="siege"&&((u.side==="player")===(S.siegeRole==="defender")) });
const { dist, shape, corners, overlap, canPlace } = MOVEMENT;
function hasPriorityRule(u){return !!u&&(!!u.priorityActivation||!!u.reserveDeployRule||(u.attachedCharacters||[]).some(id=>S.units[id]?.models>0&&S.units[id]?.priorityActivation));}
 function canUseNeutralZone(u){return !!u&&(!!u.canDeployNeutral||(u.attachedCharacters||[]).some(id=>S.units[id]?.models>0&&S.units[id]?.canDeployNeutral));}
 function validDeployment(u,x,y,f){const poly=corners(u,x,y,f),w=W(),h=H(),scout=!!u.canDeployAnywhere||(u.attachedCharacters||[]).some(id=>S.units[id]?.models>0&&!S.units[id]?.fled&&S.units[id]?.canDeployAnywhere);if(S.battleType==="siege"){const castle=(S.terrain||[]).find(t=>t.type==="siegeCastle");if(!castle)return false;const playerDefends=S.siegeRole==="defender",isDefender=(u.side==="player")===playerDefends,inch=PX_PER_IN(),mx=12*inch/w,my=12*inch/h,wallPad=1.25*inch/w,wallPadY=1.25*inch/h;const inBounds=poly.every(p=>p.x>=1&&p.y>=1&&p.x<=w-1&&p.y<=h-1);const inCastle=x>=castle.left-wallPad&&x<=castle.right+wallPad&&y>=castle.top-wallPadY&&y<=castle.bottom+wallPadY;const outsideRing=x>=castle.left-mx&&x<=castle.right+mx&&y>=castle.top-my&&y<=castle.bottom+my;const insideInterior=x>castle.left&&x<castle.right&&y>castle.top&&y<castle.bottom;if(!inBounds||(isDefender?!inCastle:(!outsideRing||insideInterior)))return false;if(!isDefender){const minWallDistance=12*inch+Math.hypot(shape(u).front,shape(u).depth)/2,castleWalls=(S.terrain||[]).filter(t=>(t.type==="wall"||t.type==="gate")&&t.castle&&(t.wounds??2)>0),cx=x*w,cy=y*h;for(const wall of castleWalls){const ax=wall.x1*w,ay=wall.y1*h,bx=wall.x2*w,by=wall.y2*h,dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((cx-ax)*dx+(cy-ay)*dy)/l2)),d=Math.hypot(cx-(ax+dx*t),cy-(ay+dy*t));if(d<minWallDistance)return false;}}const priorLevel=u.wallLevel,priorSegment=u.wallSegment,priorDefence=u.wallDefence;if(isDefender){const px=x*w,py=y*h;let nearest=null,nearestD=Infinity;for(const wall of (S.terrain||[]).filter(t=>(t.type==="wall"||t.type==="gate")&&t.castle&&(t.wounds??2)>0)){const ax=wall.x1*w,ay=wall.y1*h,bx=wall.x2*w,by=wall.y2*h,dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/l2)),d=Math.hypot(px-(ax+dx*t),py-(ay+dy*t));if(d<nearestD){nearestD=d;nearest=wall;}}if(nearest&&nearestD<=1.25*inch){u.wallLevel=true;u.wallSegment=nearest;u.wallDefence={wall:nearest,posture:"active"};}}const placeable=canPlace(u,x,y,f);u.wallLevel=priorLevel;u.wallSegment=priorSegment;u.wallDefence=priorDefence;return placeable;}const neutral=canUseNeutralZone(u),minX=scout?1:neutral?w/3+1:u.side==="player"?1:2*w/3+1,maxX=scout?w-1:neutral?2*w/3-1:u.side==="player"?w/3-1:w-1;return canPlace(u,x,y,f)&&poly.every(p=>p.x>=minX&&p.y>=1&&p.x<=maxX&&p.y<=h-1);}
function playCombatDiceQueue(){if(S.combatDicePlaying||!S.combatDiceQueue?.length)return;S.combatDicePlaying=true;const showNext=()=>{const next=S.combatDiceQueue.shift();if(!next){S.combatDicePlaying=false;return;}const content=$("rollcontent");const entry=document.createElement("div");entry.className="combat-roll-entry";entry.innerHTML=next;content.append(entry);$("rollview").classList.add("show");content.scrollTop=content.scrollHeight;setTimeout(showNext,950);};showNext();}
function say(msg){S.log.unshift(msg);S.log=S.log.slice(0,80);$("log").innerHTML=S.log.map(x=>'<div class="logentry">'+x+'</div>').join("");if(msg.includes("dice-stack")||msg.includes("dice-duel")){if(S.phase==="combat"){S.combatDiceQueue=S.combatDiceQueue||[];S.combatDiceQueue.push(msg);playCombatDiceQueue();}else{$("rollcontent").innerHTML=msg;$("rollview").classList.add("show");}}if($("logpanel").classList.contains("open"))$("log").scrollTop=0;}
const DICE = createDice({ S });
const { roll, diceStack, diceDuel } = DICE;
function psychologyType(u){return !u?null:(u.causesTerror||u.isDragon||u.isDragonRider)?"terror":u.causesFear?"fear":null;}
function causesFear(u){return psychologyType(u)!==null;}
function immuneToFear(u){return !!u&&(!!u.immuneToPsychology||!!u.immuneToFear||causesFear(u));}
function unitStrength(u){if(!u)return 0;if(Number.isFinite(u.unitStrength))return u.unitStrength;if(u.isDragon||u.isDragonRider)return 6;if(u.isCavalry)return Math.max(0,u.models)*2;return Math.max(0,u.models||0);}
function clearEngagement(u){if(!u)return;(u.engagedWithIds||[]).forEach(id=>{const v=S.units[id];if(v){v.engagedWithIds=(v.engagedWithIds||[]).filter(x=>x!==u.id);v.engagedWith=v.engagedWithIds[0]||null;if(!v.engagedWithIds.length)v.engaged=false;}});u.engaged=false;u.engagedWith=null;u.engagedWithIds=[];u.engagementSides={};u.engagedSide=null;}
function testPsychology(u,source,kind,reason){if(!u||immuneToFear(u))return true;if(kind==="terror"&&u.terrorTested)kind="fear";if(kind==="terror")u.terrorTested=true;const dice=roll(2),total=dice[0]+dice[1],ld=leadership(u),passed=total<=ld;say((kind==="terror"?"Terror":"Fear")+" test — "+u.name+(source?" faces "+source.name:"")+": "+dice.join(" + ")+" = "+total+" against Leadership "+ld+".");if(passed){say(u.name+" overcomes its "+kind+".");return true;}say(u.name+" fails its "+kind+" test.");if(kind==="terror"||(reason!=="charging"&&source&&unitStrength(u)<unitStrength(source))){u.fled=true;u.terrorFledThisTurn=reason==="turn-start";if(u.terrorFledThisTurn)u.terrorFledTurn=S.turn;u.fleeingCharge=reason==="charged";clearEngagement(u);say(u.name+" flees in terror/fear.");return false;}if(kind==="fear"&&source&&reason==="charged"){u.failedFearAgainst=source.id;u.failedFearCombatRound=S.combatRound+1;}u.failedFearCharge=reason==="charging";return false;}
function testTerrorAtTurnStart(){units().forEach(u=>{u.terrorFledThisTurn=false;u.failedFearCharge=false;u.failedFearAgainst=null;u.failedFearCombatRound=null;});units().filter(u=>alive(u)&&!u.fled&&!u.attachedTo&&!immuneToFear(u)).forEach(u=>{const terror=enemies(u).filter(e=>psychologyType(e)==="terror"&&dist(u,e)<=6).sort((a,b)=>dist(u,a)-dist(u,b))[0];if(terror&&!u.terrorTested)testPsychology(u,terror,"terror","turn-start");});}
function testChargePsychology(charger,target){const targetType=psychologyType(target),chargerType=psychologyType(charger);if(targetType&&!immuneToFear(charger)){const kind=targetType==="terror"&&!charger.terrorTested?"terror":"fear";const passed=testPsychology(charger,target,kind,"charging");if(!passed){if(!charger.fled){charger.moveUsed=charger.stats.M;charger.activated=true;say(charger.name+" cannot charge "+target.name+" and remains stationary.");}return {allowed:false};}}let targetFlees=false;if(chargerType&&!immuneToFear(target)){const kind=chargerType==="terror"&&!target.terrorTested?"terror":"fear";const passed=testPsychology(target,charger,kind,"charged");if(!passed&&target.fled)targetFlees=true;}return {allowed:true,targetFlees};}
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

function selectedTarget(u){const list=enemies(u);if(S.mode==="shoot"&&S.targetId===null)return null;return list.find(v=>v.id===S.targetId)||closestEnemy(u);}
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
const { rankBonus, hitTarget, woundTarget, saveTarget, applyDamage:applyRawDamage, meleeAttack, shootingAttack } = RULES;
function applyDamage(u,wounds,shooting,cascadePlan=null){const before=u?.models??0,result=applyRawDamage(u,wounds,shooting,cascadePlan);if(u?.isDragon&&before>0&&u.models<=0&&!u.fallingResolved){u.fallingResolved=true;const rider=(u.attachedCharacters||[]).map(id=>S.units[id]).find(h=>h&&h.models>0&&!h.fled);if(rider){rider.characterWounds=Math.max(0,(rider.characterWounds??rider.stats.W)-1);if(rider.characterWounds<=0)rider.models=0;rider.x=u.x;rider.y=u.y;rider.attachedTo=null;rider.mounted=false;rider.mountType="none";rider.flyingMount=false;rider.flightAltitudeIn=0;rider.baseWidthIn=20/25.4;rider.baseDepthIn=20/25.4;rider.stats.M=5;rider.baseMove=5;u.attachedCharacters=(u.attachedCharacters||[]).filter(id=>id!==rider.id);say(rider.name+" suffers an automatic falling wound as the flying dragon dies"+(rider.models>0?"; they continue on foot.":"."));}}return result;}
const SHOOTING = createShooting({ S, units, alive, dist, BOW_RANGE, roll, woundTarget, saveTarget, applyDamage, say, diceStack, $, shootingAttack, panicNearby, shape, corners, W, H, terrain:()=>S.terrain, BATTLEFIELD_WIDTH_IN });
const { shoot, fireCannon, breathAttack } = SHOOTING;
function resolvePursuit(choice){const pending=S.pendingPursuit;if(!pending)return;S.pendingPursuit=null;const winner=S.units[pending.winnerId],loser=S.units[pending.loserId];if(winner&&loser)pursueAfterBreak(winner,loser,choice);if(units().filter(alive).every(v=>v.fled)||units().filter(v=>v.side==="player"&&alive(v)).length===0||units().filter(v=>v.side==="ai"&&alive(v)).length===0){finishBattle(units().some(v=>v.side==="player"&&alive(v)&&!v.fled)?"Player wins the battle!":"Opponent wins the battle!");return;}if(continueBreakTests())return;S.phase="combat";S.combatResolved=true;render();}
function startActivations(){S.activationSide="player";S.prioritySpentThisPhase=false;S.forcePlayerNext=false;S.normalMovementSide=S.turn%2===1?"player":"ai";units().filter(u=>u.fled&&alive(u)).forEach(rallyUnit);const p=units().filter(u=>u.side==="player"&&eligibleForActivation(u));if(!p.length){runAiActivations();return;}const priority=p.find(hasPriorityRule);if(priority){S.selected=priority.id;render();return;}if(S.normalMovementSide==="ai")runAiActivation();const next=units().find(v=>v.side==="player"&&eligibleForActivation(v));if(next){S.selected=next.id;render();return;}runAiActivations();}
const AI = createAI({ S, units, alive, eligibleForActivation, enemies, dist, BATTLEFIELD_WIDTH_IN, fieldHeightIn, shape, PX_PER_IN, canPlace, say, shoot, fireCannon, BOW_RANGE, beginCombatPhase, terrain:()=>S.terrain });
const runAiActivation = AI.runAiActivation;
const runAiActivations = AI.runAiActivations;
function finishActivation(unitOverride=null,alreadyActivated=false){const u=unitOverride||S.units[S.selected];if(!u||u.side!=="player"||(!alreadyActivated&&u.activated)||S.phase!=="movement")return;u.activated=true;S.mode=null;say(u.name+" completes its activation.");if(hasPriorityRule(u)&&!S.prioritySpentThisPhase){S.prioritySpentThisPhase=true;if(S.normalMovementSide==="ai"&&runAiActivation()){const next=units().find(v=>v.side==="player"&&eligibleForActivation(v));if(next){S.selected=next.id;render();return;}}const next=units().find(v=>v.side==="player"&&eligibleForActivation(v));if(next){S.forcePlayerNext=true;S.selected=next.id;render();return;}runAiActivations();return;}if(S.forcePlayerNext){S.forcePlayerNext=false;const next=units().find(v=>v.side==="player"&&eligibleForActivation(v));if(next){S.selected=next.id;render();return;}}if(runAiActivation()){const next=units().find(v=>v.side==="player"&&eligibleForActivation(v));if(next){S.activationSide="player";S.selected=next.id;render();return;}}const next=units().find(v=>v.side==="player"&&eligibleForActivation(v));if(next){S.activationSide="player";S.selected=next.id;render();return;}runAiActivations();}
function rallyUnit(u){if(!u||!u.fled||u.rallyAttemptTurn===S.turn||u.terrorFledTurn===S.turn)return false;if(u.models*4<u.startModels){say(u.name+" is below a quarter of its starting strength and cannot rally.");return false;}u.rallyAttemptTurn=S.turn;const ld=leadership(u),dice=roll(2),total=dice[0]+dice[1];say("Rally test — "+u.name+": "+dice.join(" + ")+" = "+total+" against unmodified Leadership "+ld+".");if(total<=ld){u.fled=false;u.moveUsed=u.stats.M;u.activated=true;say(u.name+" rallies, but cannot move further this turn.");}else{const foe=closestEnemy(u),dx=foe?(u.x-foe.x)*W():Math.cos(u.facing+Math.PI)*W(),dy=foe?(u.y-foe.y)*H():Math.sin(u.facing+Math.PI)*H(),len=Math.max(1,Math.hypot(dx,dy)),distanceRoll=roll(2),distance=distanceRoll[0]+distanceRoll[1],px=distance*PX_PER_IN();u.x+=dx/len*px/W();u.y+=dy/len*px/H();say(u.name+" fails to rally and flees "+distance+" inches ("+distanceRoll.join(" + ")+").");if(u.x<0||u.x>1||u.y<0||u.y>1){u.models=0;u.fled=false;say(u.name+" flees off the battlefield.");}}render();return !u.fled;}
function rallyingCall(source,target){if(!source||!source.rallyingCall||source.side!=="player"||source.fled||(source.attachedTo&&S.units[source.attachedTo]?.fled)||source.models<=0||source.rallyingCallUsed||S.phase!=="movement")return false;if(!target||target===source||target.side!==source.side||!target.fled||target.terrorFledTurn===S.turn||!alive(target)||dist(source,target)>12){say("Choose a friendly fleeing unit within 12 inches.");return false;}source.rallyingCallUsed=true;target.fled=false;target.engaged=false;target.engagedWith=null;target.moveUsed=target.stats.M;target.activated=true;target.rallyAttemptTurn=S.turn;say(source.name+" uses Rallying Call: "+target.name+" rallies automatically and cannot move further this turn.");S.mode=null;render();return true;}
function beginCombatPhase(){const playerReady=units().some(u=>u.side==="player"&&alive(u)&&!u.fled),aiReady=units().some(u=>u.side==="ai"&&alive(u)&&!u.fled);if(!playerReady||!aiReady){finishBattle(playerReady?"Player wins the battle!":"Opponent wins the battle!");return;}if(units().some(u=>u.engaged&&alive(u))){setPhase("combat");}else{S.turn++;if(checkSiegeDeadline())return;setPhase("charges");say("Turn "+S.turn+" begins.");}}
function reformCombatPairs(){const pairs=[];units().filter(u=>u.engaged&&alive(u)).forEach(u=>{const v=u.engagedWith?S.units[u.engagedWith]:null;if(v&&alive(v)&&v.engagedWith===u.id&&!pairs.some(p=>p.includes(u)||p.includes(v)))pairs.push([u,v]);});if(pairs.length!==1)return;const [a,b]=pairs[0];if(!a.engaged||!b.engaged)return;const defender=[a,b].find(u=>["left","right","rear"].includes(u.attackedFromSide)&&u.flankedBy===([a,b].find(v=>v!==u)?.id));if(defender){const enemy=defender===a?b:a;const oldRanks=shape(defender).ranks;defender.formationWidth=Math.max(1,Math.min(defender.models,oldRanks+1,Math.max(1,enemy.formationWidth||5)));say(defender.name+" turns to face "+enemy.name+" and reforms to "+defender.formationWidth+" files. Its disrupted rank bonus and the flank bonus end for the next round.");}else say("The engaged units turn to face each other before the next round.");const dx=(b.x-a.x)*W(),dy=(b.y-a.y)*H(),angle=Math.atan2(dy,dx);a.facing=angle;b.facing=angle+Math.PI;const gap=(shape(a).depth+shape(b).depth)/2,midX=(a.x+b.x)/2,midY=(a.y+b.y)/2;a.x=midX-Math.cos(angle)*gap/2/W();a.y=midY-Math.sin(angle)*gap/2/H();b.x=midX+Math.cos(angle)*gap/2/W();b.y=midY+Math.sin(angle)*gap/2/H();for(const u of [a,b]){u.engagedSide="front";u.chargedSide="front";u.attackedFromSide="front";u.flankedBy=null;}}
let render = () => { Object.values(S.units||{}).forEach(u=>{u.magicSuppressed=isInsideNullificationDome(u);});};
const COMBAT = createCombat({ S, units, alive, dist, meleeAttack, applyDamage, rankBonus, roll, say, diceStack, render: () => render(), endTurn, finishBattle, reformCombatPairs, pursueAfterBreak, panicNearby, leadership });
const { resolveCombat, resolveBreak, continueBreakTests } = COMBAT;
function resolveAnimosityBrawl(a,b){
 const aModels=Math.min(Math.max(1,Math.floor(a.formationWidth||5)),a.models||0),bModels=Math.min(Math.max(1,Math.floor(b.formationWidth||5)),b.models||0);
 const aAttack=meleeAttack(a,b,{attackingModels:aModels,attackingChampion:false,charging:true});
 const bAttack=meleeAttack(b,a,{attackingModels:bModels,attackingChampion:false,charging:true});
 applyDamage(b,aAttack.wounds,false,aAttack.cascadePlan);
 applyDamage(a,bAttack.wounds,false,bAttack.cascadePlan);
 const dx=(b.x-a.x)*W(),dy=(b.y-a.y)*H(),length=Math.hypot(dx,dy)||1,angle=Math.atan2(dy,dx),step=W()/BATTLEFIELD_WIDTH_IN*.5;
 a.x-=Math.cos(angle)*step/W();a.y-=Math.sin(angle)*step/H();b.x+=Math.cos(angle)*step/W();b.y+=Math.sin(angle)*step/H();
 say("Greenskin brawl: "+a.name+" inflicts "+aAttack.wounds+" wound(s); "+b.name+" inflicts "+bAttack.wounds+" wound(s). Casualties are removed, but no combat result or panic test is made.");
}
function checkSiegeDeadline(){if(S.battleType!=="siege"||S.turn<=10)return false;const castle=(S.terrain||[]).find(t=>t.type==="siegeCastle"),attackerSide=S.siegeRole==="attacker"?"player":"ai",breached=!!castle&&units().some(u=>u.side===attackerSide&&alive(u)&&!u.fled&&!u.wallLevel&&u.x>castle.left&&u.x<castle.right&&u.y>castle.top&&u.y<castle.bottom),playerAttacks=attackerSide==="player";finishBattle(breached?(playerAttacks?"Player wins the siege: the attackers have breached the castle.":"Opponent wins the siege: the attackers have breached the castle."):(playerAttacks?"Opponent wins the siege: the defenders hold the castle through turn 10.":"Player wins the siege: the defenders hold the castle through turn 10."));return true;}
function endTurn(){S.combatResolved=false;units().forEach(u=>{u.castingDiceUsed=0;u.dispelledDomeThisTurn=false;u.charged=false;u.defendedWallCombat=false;if(!alive(u)||u.fled||!u.engagedWith||!alive(S.units[u.engagedWith])||S.units[u.engagedWith].fled){u.engaged=false;u.engagedWith=null;u.engagedSide=null;u.chargedSide=null;u.attackedFromSide=null;u.flankedBy=null;}});units().filter(u=>u.wallLevel&&!u.engaged&&u.wallSegment).forEach(u=>{u.cover="hard";u.wallDefence={wall:u.wallSegment,posture:"active",wasSkirmishing:true};});S.turn++;if(checkSiegeDeadline())return;const aiDispel=units().find(u=>u.side==="ai"&&u.spellcaster&&alive(u)&&!u.fled&&!u.dispelledDomeThisTurn&&!isInsideNullificationDome(u));const enemyDome=(S.remainsInPlaySpells||[]).find(e=>e.castTurn<S.turn&&e.side==="player");if(aiDispel&&enemyDome){const dc=Math.max(1,Math.min(4,aiDispel.casterLevel||1)),dd=roll(dc),dt=dd.reduce((sum,n)=>sum+n,0)+(aiDispel.casterLevel||1)+(aiDispel.dispelBonus||0);aiDispel.dispelledDomeThisTurn=true;say(aiDispel.name+" attempts to dispel Nullification Dome using "+dc+" dice: "+dd.join(", ")+" + level "+aiDispel.casterLevel+" = "+dt+" (needs "+enemyDome.castingValue+").");if(dt>=enemyDome.castingValue){S.remainsInPlaySpells=S.remainsInPlaySpells.filter(e=>e.id!==enemyDome.id);say("The opponent dispels Nullification Dome.");}else say("The opponent fails to dispel the dome.");}say("Turn "+S.turn+" begins.");setPhase("charges");}
function finishBattle(msg){
 if(S.finished)return;
 S.finished=true;S.phase="over";
 clearBattleSave();
 const won=msg.toLowerCase().includes("player wins");
 if(won&&collectionManager&&!campaignBattle&&!grandCampaignBattle&&!roguelikeBattle){collectionManager.grantLootbox("skirmish");say("Skirmish victory reward: one lootbox added to your collection.");}
 say('<b>'+msg+'</b>');
 if(grandCampaignBattle){grandCampaignBattle=false;$("battle-return").hidden=true;const result={won,playerUnits:units().filter(u=>u.side==="player").map(u=>({id:u.id,type:u.type,models:u.models,damage:u.damage,characterWounds:u.characterWounds,points:u.points})),enemyUnits:units().filter(u=>u.side==="ai").map(u=>({id:u.id,type:u.type,models:u.models,damage:u.damage,characterWounds:u.characterWounds,points:u.points}))};const complete=grandCampaignBattleComplete;grandCampaignBattleComplete=null;try{complete?.(result);}catch(error){console.error("Campaign battle result handling failed",error);}$("game").hidden=true;const campaignScreen=$("grand-campaign-screen");if(campaignScreen)campaignScreen.hidden=false;return;}
 if(campaignBattle){campaignBattle=false;narrativeCampaign?.onBattleFinished(won);$("battle-return").hidden=true;return;}
 if(roguelikeBattle){roguelikeBattle=false;roguelike?.onBattleFinished(won,units().filter(u=>u.side==="player"));$("battle-return").hidden=true;return;}
 $("battle-return").hidden=false;
 render();
}
function reset(){S.units=Object.fromEntries(Object.entries(S.units).filter(([,u])=>!u.isWallParty));S.terrain=S.autoTerrain?generateSkirmishTerrain(S.terrainSeed||Date.now(),S.battleType):[];S.terrainDraft=null;S.remainsInPlaySpells=[];S.pendingDome=null;S.terrainTool="off";S.turn=1;S.phase="deployment";S.mode=null;S.chargeSide="player";S.chargePasses=0;S.declaredCharges=[];S.activationSide="player";S.prioritySpentThisPhase=false;S.forcePlayerNext=false;S.targetComponentByUnit={};S.dragonBreathAim=null;view.zoom=.55;view.x=0;view.y=0;S.finished=false;S.combatRound=0;S.loser=null;S.crDiff=0;S.breakTests=[];S.log=[];S.combatDiceQueue=[];$("rollcontent").replaceChildren();const all=units();S.selected=all.find(u=>u.side==="player")?.id||null;all.forEach(u=>{const sideUnits=all.filter(v=>v.side===u.side),index=sideUnits.indexOf(u);Object.assign(u,{models:u.startModels,damage:0,artilleryWounds:u.artilleryStartWounds??u.artilleryWounds,x:S.battleType==="siege"?(((u.side==="player")===(S.siegeRole==="defender"))?.38+(index%3)*.12:.10+(index%2)*.12):(u.side==="player"?.22:.78),y:S.battleType==="siege"?(((u.side==="player")===(S.siegeRole==="defender"))?.35+Math.floor(index/3)*.24:.34+Math.floor(index/2)*.16):(index+1)/(sideUnits.length+1),facing:u.side==="player"?0:Math.PI,deployed:u.side==="ai",wallLevel:false,wallSegment:null,laddersDeployed:0,ladderDeployedTurn:0,engaged:false,engagedWith:null,engagedWithIds:[],engagementSides:{},engagedSide:null,chargedSide:null,attackedFromSide:null,flankedBy:null,formationWidth:u.isSiegeEngine?3:5,skirmishing:!!u.isSiegeEngine||!!u.flyingMount,skirmishCombatRound:0,wallDefence:null,defendedWallCombat:false,cover:u.isSiegeEngine?"soft":null,fleeingCharge:false,activated:false,moved:false,shot:false,breathUsed:false,charged:false,fled:false,moveUsed:0,shootCasualties:0,panicTested:false,terrorTested:false,terrorFledThisTurn:false,failedFearCharge:false,terrorFledTurn:0,delayedDeath:false,delayedDeathSnapshot:null,fallingResolved:false,rallyingCallUsed:false,rallyAttemptTurn:0});u.stats.M=u.baseMove??u.stats.M;u.characterWounds=u.isCharacter?u.stats.W:null;u.delayedDeath=false;u.delayedDeathSnapshot=null;u.championAlive=!!u.champion?.enabled;u.championWounds=u.championAlive?u.stats.W:0;});all.filter(u=>!u.isCharacter).forEach(host=>{host.stats.M=host.baseMove??host.stats.M;(host.attachedCharacters||[]).forEach(id=>{const hero=S.units[id];if(hero&&hero.models>0)host.stats.M=Math.min(host.stats.M,hero.stats.M);});});$("log").replaceChildren();$("logpanel").classList.remove("open");$("rollview").classList.remove("show");say("Deployment: place units in your third of the field. The middle third is neutral; Aelthir and any unit he leads may deploy there. The opponent's deployment is hidden.");render();}
const view={zoom:.55,x:0,y:0};
const RENDERING = createRendering({ canvas, ctx, S, units, alive, W, H, PX_PER_IN, BATTLEFIELD_WIDTH_IN, MODEL_BASE_IN, shape, view });
const { setupCanvas, draw } = RENDERING;
function requestRender(){ render(); }
 function isInsideNullificationDome(point){return (S.remainsInPlaySpells||[]).some(effect=>effect.spell==="nullificationDome"&&dist(point,{x:effect.x,y:effect.y})<=(effect.radiusIn||6)+.001);}
 function castSpell(caster,target,spell,diceCount){if(!caster?.spellcaster||caster.side!=="player"||S.phase!=="movement"||!alive(caster)||caster.engaged||caster.fled)return false;if(isInsideNullificationDome(caster)){say(caster.name+" cannot cast while inside a Nullification Dome.");render();return false;}const level=Math.max(1,Math.min(4,caster.casterLevel||1)),remaining=level-(caster.castingDiceUsed||0),count=Math.max(1,Math.min(remaining,Math.floor(diceCount))),isDome=spell==="nullificationDome",cv=isDome?10:3;if(count<1||remaining<count){say(caster.name+" has insufficient casting dice.");return false;}if(!(caster.spells||["fireBolt"]).includes(spell)){say(caster.name+" does not know that spell.");return false;}if(isDome){if(caster.faction!=="highElves"){say("Only High Elf spellcasters can cast Nullification Dome.");return false;}if(!target||!Number.isFinite(target.x)||!Number.isFinite(target.y)||dist(caster,target)>18){say("Choose a point within 18 inches for Nullification Dome.");return false;}}else{if(!target||target.side===caster.side||!alive(target)||dist(caster,target)>30){say("Fire Bolt requires an enemy target within 30 inches.");return false;}if(isInsideNullificationDome(target)){say("Spells cannot affect a target inside a Nullification Dome.");return false;}}caster.castingDiceUsed=(caster.castingDiceUsed||0)+count;const dice=roll(count),total=dice.reduce((a,b)=>a+b,0)+level;say(caster.name+" casts "+(isDome?"Nullification Dome":"Fire Bolt")+": "+dice.join(", ")+" + caster level "+level+" = "+total+" (casting value "+cv+").");if(total<cv){say("The spell fails to take effect.");render();return true;}const dispeller=units().find(u=>u.side!==caster.side&&u.spellcaster&&alive(u)&&!u.fled&&!isInsideNullificationDome(u));if(dispeller){const dispelCount=Math.min(dispeller.casterLevel||1,Math.max(1,Math.ceil((total-(dispeller.casterLevel||1))/3)));const dd=roll(dispelCount),dt=dd.reduce((a,b)=>a+b,0)+(dispeller.casterLevel||1)+(dispeller.dispelBonus||0);say(dispeller.name+" attempts to counterspell with "+dispelCount+" dice: "+dd.join(", ")+" + level "+dispeller.casterLevel+" = "+dt+".");if(dt>total){say((isDome?"Nullification Dome":"Fire Bolt")+" is counterspelled.");render();return true;}say("The counterspell fails.");}if(isDome){S.remainsInPlaySpells.push({id:"dome-"+S.turn+"-"+Math.random().toString(36).slice(2,8),spell:"nullificationDome",name:"Nullification Dome",ownerId:caster.id,side:caster.side,x:target.x,y:target.y,radiusIn:6,castTurn:S.turn,castingValue:10});say("Nullification Dome forms at the chosen point. Its 6-inch radius suppresses spellcasting, spell effects and magic items within it. It remains until dispelled.");}else{const woundTargetNumber=woundTarget(4,target.stats.T),woundRoll=roll(1)[0],wound=woundTargetNumber!==null&&woundRoll>=woundTargetNumber;if(!wound){say("Fire Bolt hits but fails to wound "+target.name+".");render();return true;}let saved=false;const modified=saveTarget(target,4,1);if(modified!==null&&modified<=6&&roll(1)[0]>=modified)saved=true;if(saved){say("Fire Bolt wounds "+target.name+", but its armour saves the hit.");render();return true;}applyDamage(target,1,true);say("Fire Bolt inflicts one Strength 4, AP1 wound on "+target.name+".");}render();return true;}
 function dispelDome(caster,effectId){const effect=(S.remainsInPlaySpells||[]).find(e=>e.id===effectId);if(!caster?.spellcaster||caster.side!=="player"||!effect||effect.castTurn>=S.turn||caster.dispelledDomeThisTurn||!alive(caster)||caster.fled||isInsideNullificationDome(caster)){say("A remains-in-play spell cannot be dispelled on the turn it was created; choose an eligible mage and try again next turn.");return false;}const diceCount=Math.max(1,Math.min(4,caster.casterLevel||1)),dice=roll(diceCount),total=dice.reduce((a,b)=>a+b,0)+(caster.casterLevel||1)+(caster.dispelBonus||0);caster.dispelledDomeThisTurn=true;say(caster.name+" attempts to dispel Nullification Dome using "+diceCount+" dice: "+dice.join(", ")+" + level "+caster.casterLevel+" = "+total+" (needs "+effect.castingValue+").");if(total>=effect.castingValue){S.remainsInPlaySpells=S.remainsInPlaySpells.filter(e=>e.id!==effect.id);say("Nullification Dome collapses.");}else say("The dispel attempt fails; the dome remains.");render();return true;}
const PHASES = createPhases({ S, units, alive, shape, BATTLEFIELD_WIDTH_IN, fieldHeightIn, W, H, PX_PER_IN, BOW_RANGE, roll, dist, enemies, say, shoot, render:requestRender, startActivations, canPlace, canCharge, testTerrorAtTurnStart, testChargePsychology, resolveCombat, resolveAnimosityBrawl });
const { setPhase, declareCharge, fleeFromCharge, finishMovement, passCharges, aiChargeStep, resolveDeclaredCharges } = PHASES;
const UI = createUI({ S, $, units, alive, draw, W, H, BOW_RANGE, selectedTarget, dist, passCharges, finishActivation, resolveCombat, endTurn, resolveBreak, resolvePursuit, reset, validDeployment, canPlace, rallyUnit, rallyingCall, fleeFromCharge, say, equipMeleeWeapon, setRangedMode, shape, PX_PER_IN, terrain:()=>S.terrain, BATTLEFIELD_WIDTH_IN, castSpell, dispelDome, startBattle:()=>{setPhase("charges");say("Battle begins! The opponent's deployment is revealed.");} });
const renderUI = UI.render;
let persistenceReady = false;
const BATTLE_SAVE_KEY = "warGameActiveBattleV1";
const BATTLE_BACKUP_KEY = "warGameActiveBattleBackupV1";
function clearBattleSave() {
 try { localStorage.removeItem(BATTLE_SAVE_KEY); localStorage.removeItem(BATTLE_BACKUP_KEY); } catch {}
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
 Object.values(S.units||{}).forEach(u=>{u.magicSuppressed=isInsideNullificationDome(u);});
 renderUI();
 saveBattleSnapshot();
};
window.warGameSaveNow = saveBattleSnapshot;
const INPUT = createInput({ canvas, S, view, W, H, units, alive, shape, PX_PER_IN, BATTLEFIELD_WIDTH_IN, canPlace, validDeployment, shoot, fireCannon, breathAttack, declareCharge, render, draw, $, say, dist, finishActivation, terrain:()=>S.terrain, rallyingCall, castSpell });

function startBattleWithArmy(army,faction,battleType="skirmish",siegeRole="attacker"){if(roguelikeBuilderMode){roguelikeBuilderMode=false;roguelike?.beginBattle(army,faction,roguelikeArmyPoints(army,faction));return;}campaignBattle=false;S.battleType=battleType;S.siegeRole=siegeRole;S.autoTerrain=true;S.terrainSeed=Date.now();const budgetMultiplier=battleType==="siege"?(siegeRole==="attacker"?1/1.5:1.5):1;const playerForce=createUnitsFromArmy(army,faction),aiRoster=buildOpponentArmy(army,faction,{budgetMultiplier,siege:battleType==="siege"}),aiForce=createUnitsFromArmy(aiRoster,faction);S.units={...Object.fromEntries(Object.entries(playerForce).filter(([id])=>id.startsWith("p"))),...Object.fromEntries(Object.entries(aiForce).filter(([id])=>id.startsWith("a")))};if(battleType==="siege"){const castle={left:.29,right:.71,top:.22,bottom:.78};Object.values(S.units).forEach(u=>{if(u.side==="player"){u.x=siegeRole==="defender"?.5:.12;u.y=.5;}else{u.x=siegeRole==="defender"?.12:.5;u.y=.5;}u.facing=u.side==="player"?(siegeRole==="defender"?0:0):Math.PI;});}const playerPoints=units().filter(u=>u.side==="player").reduce((sum,u)=>sum+(u.points||0),0),aiPoints=units().filter(u=>u.side==="ai").reduce((sum,u)=>sum+(u.points||0),0);$("mainmenu").hidden=true;$("mode-screen").hidden=true;$("campaign-screen").hidden=true;$("collection-screen").hidden=true;$("armybuilder").hidden=true;$("game").hidden=false;reset();say((battleType==="siege"?"Siege · you are the "+siegeRole+". ":"Skirmish · ")+"Your army "+playerPoints+" pts; opponent "+aiPoints+" pts ("+(aiPoints>=playerPoints?"+"+(aiPoints-playerPoints):"−"+(playerPoints-aiPoints))+" pts). "+(battleType==="siege"?"The attacker receives 50% more budget; castle walls are T10/10 W and gates T8/6 W.":""));setupCanvas();}
function roguelikeCampaignStatCost(config,faction){
 const m=config.models||1,dwarf=faction==="dwarfs",elf=faction==="highElves",character=["captain","lord","mageHero","mageLord","goblinShaman","goblinGreatShaman","orcShaman","orcGreatShaman","legendaryLord","shadowElf","pegasusChampion","rifleman","captainWeiss","dwarfCaptain","dwarfLord","dwarfKingHaldric","goblinHero","goblinLord","orcHero","orcLord"].includes(config.type),s=config.campaignStats||{};
 const rate={M:character?(dwarf?8:5):(dwarf?4:2)*m,WS:character?(elf?3:5):(elf?1:2)*m,BS:character?(elf?3:5):(elf?1:2)*m,S:character?6:3*m,T:character?(dwarf?5:elf?10:8):(dwarf?2:elf?6:4)*m,I:character?(dwarf?5:3):(dwarf?3:1)*m,Ld:character?3:m};
 return (s.M||0)*rate.M+(s.S||0)*rate.S+(s.T||0)*rate.T+(s.WS||0)*rate.WS+(s.BS||0)*rate.BS+(s.I||0)*rate.I+(s.Ld||0)*rate.Ld+(s.MI||0)*(rate.M+rate.I);
}
function roguelikeUnitCost(config,faction){
 const base=unitCost(config,faction),type=config.type,models=config.models||1;
 const fixed=["cannon","boltThrower","youngDragon","dragon","ancientDragon","pegasusChampion","dwarfKingHaldric"].includes(type);
 const character=["captain","lord","mageHero","mageLord","goblinShaman","goblinGreatShaman","orcShaman","orcGreatShaman","legendaryLord","shadowElf","pegasusChampion","rifleman","captainWeiss","dwarfCaptain","dwarfLord","dwarfKingHaldric","goblinHero","goblinLord","orcHero","orcLord"].includes(type);
 const skillCount=["rerollOnesMelee","rerollOnesShooting","steadfast","skirmish"].filter(key=>config.skills?.[key]).length;
 return base+(!fixed&&!character?skillCount*3*Math.max(0,models-1):0)+roguelikeCampaignStatCost(config,faction);
}
function roguelikeArmyPoints(army,faction){return army.reduce((sum,u)=>sum+roguelikeUnitCost(u,faction),0);}
function startRoguelikeBattle(army,faction,round,targetPoints,battleType="skirmish",siegeRole="attacker"){
 campaignBattle=false;roguelikeBattle=true;S.battleType=battleType;S.siegeRole=siegeRole;S.autoTerrain=true;S.terrainSeed=Date.now();
 const playerForce=createUnitsFromArmy(army,faction),playerPoints=roguelikeArmyPoints(army,faction),basePoints=army.reduce((sum,u)=>sum+unitCost(u,faction),0);
 const siegeMultiplier=battleType==="siege"?(siegeRole==="defender"?1.5:1/1.5):1,enemyTarget=Math.round(targetPoints*siegeMultiplier);
 const aiRoster=buildOpponentArmy(army,faction,{budgetMultiplier:enemyTarget/Math.max(1,basePoints),siege:battleType==="siege"}),aiForce=createUnitsFromArmy(aiRoster,faction);
 S.units={...Object.fromEntries(Object.entries(playerForce).filter(([id])=>id.startsWith("p"))),...Object.fromEntries(Object.entries(aiForce).filter(([id])=>id.startsWith("a")))};
 $("mainmenu").hidden=true;$("mode-screen").hidden=true;$("campaign-screen").hidden=true;$("roguelike-screen").hidden=true;$("collection-screen").hidden=true;$("armybuilder").hidden=true;$("game").hidden=false;
 reset();
 army.forEach((cfg,i)=>{const id="p"+(i+1),u=S.units[id];if(!u)return;if(cfg.currentDamage!=null)u.damage=Math.max(0,Number(cfg.currentDamage)||0);if(cfg.currentWounds!=null&&u.isCharacter)u.characterWounds=Math.max(0,Math.min(u.stats.W,cfg.currentWounds));if(cfg.currentArtilleryWounds!=null&&u.isSiegeEngine)u.artilleryWounds=Math.max(0,Math.min(u.artilleryStartWounds,cfg.currentArtilleryWounds));if(cfg.type==="lord"&&["youngDragon","dragon","ancientDragon"].includes(cfg.mountType)){const rider=S.units[id+"r"];if(rider&&cfg.currentWounds!=null)rider.characterWounds=Math.max(0,Math.min(rider.stats.W,cfg.currentWounds));}});
 const actualEnemy=units().filter(u=>u.side==="ai").reduce((sum,u)=>sum+(u.points||0),0);
 say("Roguelike · Round "+round+" · "+(battleType==="siege"?"Siege — you are the "+siegeRole+". ":"Skirmish. ")+"Your army "+playerPoints+" pts; opponent "+actualEnemy+" pts (target "+enemyTarget+")."+(battleType==="siege"?" The attacker must breach the castle by the end of turn 10; otherwise the defender wins.":""));setupCanvas();
}
function startPoliticalCampaignBattle({army, faction="empire", enemyArmy, enemyFaction="empire", onComplete}){
 if(!Array.isArray(army)||!army.length||!Array.isArray(enemyArmy)||!enemyArmy.length)return false;
 S.battleType="skirmish";S.siegeRole="attacker";S.autoTerrain=true;S.terrainSeed=Date.now();
 const playerForce=createUnitsFromArmy(army,faction),enemySource=createUnitsFromArmy(enemyArmy,enemyFaction),enemyForce={};
 for(const [oldId,unit] of Object.entries(enemySource).filter(([id])=>id.startsWith("p"))){const id=oldId.replace(/^p/,"a");const copy={...unit,id,side:"ai",attachedCharacters:(unit.attachedCharacters||[]).map(characterId=>characterId.replace(/^p/,"a")),attachedTo:unit.attachedTo?unit.attachedTo.replace(/^p/,"a"):null};enemyForce[id]=copy;}
 S.units={...Object.fromEntries(Object.entries(playerForce).filter(([id])=>id.startsWith("p"))),...enemyForce};
 campaignBattle=false;roguelikeBattle=false;grandCampaignBattle=true;grandCampaignBattleComplete=onComplete;
 $("mainmenu").hidden=true;$("mode-screen").hidden=true;$("campaign-screen").hidden=true;$("roguelike-screen").hidden=true;$("collection-screen").hidden=true;$("armybuilder").hidden=true;$("grand-campaign-screen").hidden=true;$("game").hidden=false;$("battle-return").hidden=true;
 reset();say("Grand campaign battle · "+faction+" against "+enemyFaction+". Victory or defeat will change the campaign.");setupCanvas();return true;
}
window.startPoliticalCampaignBattle=startPoliticalCampaignBattle;
function startCampaignBattle(army,enemyConfig){
 S.autoTerrain=true;S.terrainSeed=Date.now();const playerUnits=createUnitsFromArmy(army,"empire");
 const enemyPair=createUnitsFromArmy([{type:"swordsmen",models:20,weapon:"handWeapon",champion:false}], "empire");
 const enemy=enemyPair.a1;enemy.id="a1";enemy.side="ai";enemy.name="Enemy Human Swordsmen";enemy.x=.78;enemy.y=.5;enemy.facing=Math.PI;enemy.deployed=true;
 S.units={...Object.fromEntries(Object.entries(playerUnits).filter(([id])=>id.startsWith("p"))),a1:enemy};
 campaignBattle=true;$("mainmenu").hidden=true;$("mode-screen").hidden=true;$("campaign-screen").hidden=true;$("collection-screen").hidden=true;$("armybuilder").hidden=true;$("game").hidden=false;reset();setupCanvas();
}
function showMainMenu(){$("game").hidden=true;$("armybuilder").hidden=true;$("collection-screen").hidden=true;$("mode-screen").hidden=true;$("campaign-screen").hidden=true;$("roguelike-screen").hidden=true;$("mainmenu").hidden=false;}
function showCollection(){$("game").hidden=true;$("armybuilder").hidden=true;$("mode-screen").hidden=true;$("mainmenu").hidden=true;$("collection-screen").hidden=false;}
function showSkirmishBuilder(){$("game").hidden=true;$("mainmenu").hidden=true;$("mode-screen").hidden=true;$("collection-screen").hidden=true;$("roguelike-screen").hidden=true;armyBuilder?.configureSkirmish();armyBuilder?.open();}
let collectionManager=null;
let narrativeCampaign=null;
let roguelike=null;
let campaignBattle=false,grandCampaignBattle=false,grandCampaignBattleComplete=null,roguelikeBattle=false,roguelikeBuilderMode=false;
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
  if(entry.type==="cannon"||entry.type==="boltThrower"){
    const allowed=entry.type==="boltThrower"?faction==="highElves":faction==="empire"||faction==="dwarfs";
    if(!allowed){shortages.push(entry.type==="boltThrower"?"Bolt throwers are only available to the High Elves.":"Cannons are only available to humans and dwarves.");continue;}
    const machine=owned.find(m=>!used.has(m.id)&&m.faction===faction&&m.type===entry.type);
    if(!machine)shortages.push("One assembled "+(entry.type==="cannon"?"cannon":"bolt thrower")+" is required.");else used.add(machine.id);
    const crewCount=entry.type==="cannon"?3:2,crewType=faction==="dwarfs"?"dwarfInfantry":"swordsmen",crewWeapon=faction==="highElves"?"spear":"handWeapon";
    const crew=owned.filter(m=>!used.has(m.id)&&m.faction===faction&&m.type===crewType&&m.weapon===crewWeapon&&!m.mounted);
    if(crew.length<crewCount)shortages.push((crewCount-crew.length)+" compatible "+(faction==="highElves"?"spear-armed elven":faction==="dwarfs"?"dwarf":"human")+" crew model(s) needed for the "+entry.type+".");
    crew.slice(0,crewCount).forEach(m=>used.add(m.id));
    continue;
   }
   if(["youngDragon","dragon","ancientDragon"].includes(entry.type)){if(faction!=="highElves")shortages.push("Dragons are only available to the High Elves.");continue;}
  const character=["captain","lord","mageHero","mageLord","goblinShaman","goblinGreatShaman","orcShaman","orcGreatShaman","legendaryLord","shadowElf","pegasusChampion","dwarfCaptain","dwarfLord","dwarfKingHaldric","rifleman","captainWeiss","goblinHero","goblinLord","orcHero","orcLord"].includes(entry.type);
  if(entry.type==="orcLord"&&entry.mountType==="wyvern"){if(faction!=="greenskins")shortages.push("Only Orc Warbosses may ride Wyverns.");continue;}if(entry.type==="lord"&&["youngDragon","dragon","ancientDragon"].includes(entry.mountType)){if(faction!=="highElves")shortages.push("Only High Elf Lords may ride dragons.");continue;}
  const collectionType=entry.type==="mageHero"?"captain":entry.type==="mageLord"?"lord":entry.type==="goblinShaman"?"goblinHero":entry.type==="goblinGreatShaman"?"goblinLord":entry.type==="orcShaman"?"orcHero":entry.type==="orcGreatShaman"?"orcLord":entry.type;const count=character?1:(entry.models||1);
  const mounted=entry.type==="cavalry"||(character&&!!entry.mounted),expectedMount=mounted?(entry.mountType||(entry.type==="cavalry"?"horse":"horse")):"none";
  const matches=owned.filter(m=>!used.has(m.id)&&m.faction===faction&&(m.type===collectionType||(["swordsmen","archers"].includes(entry.type)&&["swordsmen","archers"].includes(m.type)))&&!!m.mounted===mounted&&(m.mountType||(m.mounted?"horse":"none"))===expectedMount);
  if(matches.length<count)shortages.push((count-matches.length)+" "+entry.type+" model(s) needed"+(mounted?" mounted":""));
  matches.slice(0,count).forEach(m=>used.add(m.id));
 }
 return shortages.length?"Not enough matching miniatures: "+shortages.join("; ")+". Add models in your Collection, or enable the developer bypass.":"";
}
let armyBuilder=null;
armyBuilder=createArmyBuilder({ $, onStart:startBattleWithArmy, onBack:()=>{if(roguelikeBuilderMode){roguelikeBuilderMode=false;roguelike?.open();}else showCollection();}, validateArmy });
narrativeCampaign=createNarrativeCampaign({$,onStartBattle:startCampaignBattle,onReturnMenu:showMainMenu});
collectionManager=createCollectionManager({$,onSkirmish:showSkirmishBuilder,onMainMenu:showMainMenu,onNarrativeCampaign:()=>narrativeCampaign.open(),onRoguelike:()=>roguelike?.open(),onResetCollection:()=>roguelike?.resetProgress()});
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
$("battle-return").addEventListener("click",()=>{ $("battle-return").hidden=true;showCollection();collectionManager?.open();});
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
window.addEventListener("pagehide", saveBattleSnapshot);
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="hidden") saveBattleSnapshot(); });
restoreBattleSnapshot();
})();
}
;
