import { terrainMovementCost } from "./terrain.js";
export function createAI({ S, units, alive, eligibleForActivation, enemies, visibleEnemies = enemies, aiLastKnownTargets = () => [], dist, gap, BATTLEFIELD_WIDTH_IN, fieldHeightIn, shape, PX_PER_IN, canPlace, say, shoot, fireCannon, castSpell, BOW_RANGE, beginCombatPhase, terrain = () => [], side = "ai", policy = "baseline" }) {
  const enemySide = side === "player" ? "ai" : "player";
  function armyRangeScore(side){const force=units().filter(u=>u.side===side&&alive(u));return force.length?force.filter(u=>u.hasRangedWeapon).length/force.length:0;}
function aiWantsRange(){return armyRangeScore(side)>armyRangeScore(enemySide);}
function aiTargetScore(u,t,preferRanged){
 const dx=(t.x-u.x)*BATTLEFIELD_WIDTH_IN,dy=(t.y-u.y)*fieldHeightIn(),d=Math.hypot(dx,dy),bearing=Math.atan2(dy,dx),delta=Math.atan2(Math.sin(bearing-u.facing),Math.cos(bearing-u.facing)),frontPenalty=Math.abs(delta)>Math.PI/2?7:Math.abs(delta)*1.5,rangedBonus=preferRanged&&(t.kind==="archer"||t.hasRangedWeapon)?3:0;
 const stagnationPenalty=u.aiStuckTargetId===t.id?Math.min(18,6*Math.max(1,u.aiStagnantTurns||1)):0;
 if(policy!=="experimental"&&policy!=="experimental2"&&policy!=="experimental3")return d+frontPenalty-rangedBonus+stagnationPenalty;
 const danger=(t.isCannon||t.isBoltThrower||t.isCatapult?7:0)+(t.spellcaster?5:0)+(t.hasRangedWeapon?2.2:0)+(t.isDragon||t.isDragonRider?5:0)+(t.isCavalry?2:0);
 const fragility=(t.models<=5?2.5:t.models<=10?1.3:0)+(t.stats?.W&&t.stats.W<=2?1:0);
 const value=Math.min(5,Math.max(0,(t.points||0)/250));
 const currentThreat=(u.isCannon||u.isBoltThrower||u.isCatapult?1.5:0)+(u.hasRangedWeapon?1.2:0);
 const supported=units().filter(v=>v.side===enemySide&&alive(v)&&!v.fled&&v.id!==t.id&&dist(v,t)<=4).length;
 // Blue values enemy shooting opportunities that can still be denied by acting now.
 const unspentEnemyShot=(policy==="experimental"||policy==="experimental2"||policy==="experimental3")&&t.hasRangedWeapon&&!t.activated&&!t.shot?3.5:0;
 // Experimental 2 tests a simpler aggression hypothesis: prefer reachable, nearby targets over distant high-value threats, to turn attritional draws into engagements.
 const aggressiveScore=d*1.15+frontPenalty*.6-rangedBonus-danger*.35-fragility*.65-value*.2-supported*.1-currentThreat*.1-unspentEnemyShot+stagnationPenalty;
 if(policy==="experimental2")return aggressiveScore;
 if(policy==="experimental3"){
  const startingModels=Math.max(1,t.startModels||t.models||1);
  const remainingRatio=t.isCharacter&&t.stats?.W>0?Math.max(0,Math.min(1,(t.characterWounds??t.stats.W)/t.stats.W)):Math.max(0,Math.min(1,(t.models||0)/startingModels));
  const focusFire=Math.min(5,Math.max(0,1-remainingRatio)*5)+(t.models>0&&t.models<=3?1.25:0);
  // Experimental 3 adds a strong incentive to concentrate damage and finish off weakened units.
  return aggressiveScore-focusFire;
 }
 return d*.72+frontPenalty*.6-rangedBonus-danger*.8-fragility*.65-value*.45-supported*.25-currentThreat*.1-unspentEnemyShot;
}
function aiBestTarget(u,targets,preferRanged){return targets.slice().sort((a,b)=>aiTargetScore(u,a,preferRanged)-aiTargetScore(u,b,preferRanged))[0]||null;}
function aiActivationPriority(u){
 if(policy!=="experimental"&&policy!=="experimental2"&&policy!=="experimental3")return 0;
 const targets=visibleEnemies(u).filter(t=>t.side!==side&&alive(t)&&!t.fled);
 const range=u.range||BOW_RANGE;
 if(u.hasRangedWeapon){
  const inRange=targets.filter(t=>gap(u,t)<=range);
  if(inRange.some(t=>t.hasRangedWeapon&&!t.activated&&!t.shot))return 10;
  if(inRange.some(t=>gap(u,t)<=range/2))return 6;
  if(inRange.length){
   const canImproveByWaiting=units().some(t=>t.side===enemySide&&alive(t)&&!t.fled&&!t.activated&&!t.hasRangedWeapon&&gap(u,t)>range/2&&gap(u,t)<=range/2+(t.stats?.M||0));
   return canImproveByWaiting?0:3;
  }
 }
 return 0;
}
function aiCastSpells(){
 if(typeof castSpell!=="function"||S.phase!=="movement")return false;
 let castAny=false;
 const casters=units().filter(c=>c.side===side&&c.spellcaster&&alive(c)&&!c.fled&&!c.engaged&&!c.magicSuppressed&&c.aiSpellAttemptedTurn!==S.turn);
 for(const caster of casters){
  if(!(caster.spells||["fireBolt"]).includes("fireBolt"))continue;
  let remaining=Math.max(0,Math.min(4,caster.casterLevel||1)-(caster.castingDiceUsed||0));
  while(remaining>0){
   const targets=visibleEnemies(caster).filter(t=>t.side!==side&&alive(t)&&!t.fled&&dist(caster,t)<=30);
   const target=aiBestTarget(caster,targets,false);
   if(!target)break;
   if(!castSpell(caster,target,"fireBolt",1))break;
   caster.aiSpellAttemptedTurn=S.turn;
   castAny=true;
   remaining=Math.max(0,Math.min(4,caster.casterLevel||1)-(caster.castingDiceUsed||0));
  }
 }
 return castAny;
}
function normalizeTurn(a){while(a>Math.PI)a-=Math.PI*2;while(a< -Math.PI)a+=Math.PI*2;return a;}
function findRouteCore(u,target,desiredGap){
  const step=.035,frontIn=shape(u).front/PX_PER_IN(),minX=Math.ceil((-.0-u.x)/step),maxX=Math.floor((1-u.x)/step),minY=Math.ceil((-.0-u.y)/step),maxY=Math.floor((1-u.y)/step),dirs=Array.from({length:8},(_,i)=>i*Math.PI/4);
  const position=(ix,iy)=>({x:u.x+ix*step,y:u.y+iy*step}),key=(ix,iy,d)=>ix+","+iy+","+d;
  const startDir=((Math.round((normalizeTurn(u.facing)+Math.PI*2)%(Math.PI*2)/(Math.PI/4)))%8),start={ix:0,iy:0,dir:startDir,g:0,f:Math.max(0,gap(u,target)-desiredGap),parent:null},best=new Map([[key(0,0,startDir),0]]);
  if(gap(u,target)<=desiredGap+.15)return [];
  const heap=[];const push=n=>{heap.push(n);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p].f<=heap[i].f)break;heap[i]=heap[p];i=p;}heap[i]=n;};const pop=()=>{const root=heap[0],last=heap.pop();if(heap.length){let i=0;while(true){let l=i*2+1,r=l+1;if(l>=heap.length)break;let m=r<heap.length&&heap[r].f<heap[l].f?r:l;if(heap[m].f>=last.f)break;heap[i]=heap[m];i=m;}heap[i]=last;}return root;};push(start);
  let found=null,expanded=0;
  while(heap.length&&expanded<3200){
    const node=pop(),k=key(node.ix,node.iy,node.dir);if(node.g>(best.get(k)??Infinity)+1e-6)continue;expanded++;
    const p=position(node.ix,node.iy);
    if((node.ix!==0||node.iy!==0)&&gap(u,target,p.x,p.y,dirs[node.dir])<=desiredGap+.18){found=node;break;}
    const currentAngle=node.parent?dirs[node.dir]:u.facing;
    for(let d=0;d<8;d++){
      const nx=node.ix+Math.round(Math.cos(dirs[d])),ny=node.iy+Math.round(Math.sin(dirs[d]));
      if(nx<minX||nx>maxX||ny<minY||ny>maxY)continue;
      const q=position(nx,ny),turn=normalizeTurn(dirs[d]-currentAngle),turnCost=Math.abs(turn)*frontIn;
      if(turnCost>.02&&!canPlace(u,p.x,p.y,dirs[d]))continue;
      if(!canPlace(u,q.x,q.y,dirs[d]))continue;
      const moveCost=terrainMovementCost(terrain(),p.x,p.y,q.x,q.y,BATTLEFIELD_WIDTH_IN,fieldHeightIn(),BATTLEFIELD_WIDTH_IN,fieldHeightIn());
      const edgeCost=turnCost+moveCost;
      const g=node.g+edgeCost,nk=key(nx,ny,d);if(g>=(best.get(nk)??Infinity)-1e-6)continue;
      best.set(nk,g);const h=Math.max(0,gap(u,target,q.x,q.y,dirs[d])-desiredGap);
      push({ix:nx,iy:ny,dir:d,g,f:g+h,parent:node});
    }
  }
  u.aiLastRouteSearch={expanded,found:!!found,limitHit:expanded>=3200,desiredGap};
  if(!found)return null;
  const path=[];for(let n=found;n&&n.parent;n=n.parent)path.push({ ...position(n.ix,n.iy),dir:n.dir });return path.reverse();
}
function aiNow(){return typeof performance!=="undefined"&&typeof performance.now==="function"?performance.now():Date.now();}
function findRoute(u,target,desiredGap){
 const started=aiNow();u.aiLastRouteSearch=null;
 try{return findRouteCore(u,target,desiredGap);}
 finally{
  if(S.aiBattleLab){
   const elapsed=Math.max(0,aiNow()-started),key=side==="player"?"red":"blue",stats=S.aiLabDecisionTiming?.[key];
   if(stats){stats.routeCalls++;stats.routeMs+=elapsed;const detail=u.aiLastRouteSearch;if(detail){stats.expandedNodes=(stats.expandedNodes||0)+detail.expanded;stats.routeNulls=(stats.routeNulls||0)+(!detail.found?1:0);stats.routeCaps=(stats.routeCaps||0)+(detail.limitHit?1:0);}}
  }
 }
}
function aiStuckContext(u,target){
 const nearbyFriendly=units().filter(v=>v.id!==u.id&&v.side===u.side&&alive(v)&&!v.fled)
  .map(v=>({name:v.name,kind:v.kind||v.type||null,distance:Math.hypot((v.x-u.x)*BATTLEFIELD_WIDTH_IN,(v.y-u.y)*fieldHeightIn())}))
  .filter(v=>v.distance<=2.5).sort((a,b)=>a.distance-b.distance).slice(0,3).map(v=>({...v,distance:Number(v.distance.toFixed(2))}));
 const nearbyTerrain=terrain().filter(t=>Number.isFinite(t.x)&&Number.isFinite(t.y))
  .map(t=>({type:t.type||t.kind||"terrain",name:t.label||t.name||null,distance:Math.hypot((t.x-u.x)*BATTLEFIELD_WIDTH_IN,(t.y-u.y)*fieldHeightIn())}))
  .filter(t=>t.distance<=2.5).sort((a,b)=>a.distance-b.distance).slice(0,3).map(t=>({...t,distance:Number(t.distance.toFixed(2))}));
 const summarizeHistory=(history,incoming=false)=>{
  const records=Array.isArray(history)?history:[];
  const latest=records.length?records[records.length-1]:null;
  const describe=e=>({turn:e.turn,turnsAgo:S.turn-e.turn,otherUnit:incoming?e.chargerName:e.targetName,status:e.status||"declared",counterCharge:!!e.counterCharge,reason:e.reason||null});
  return {ever:records.length>0,thisTurn:records.some(e=>e.turn===S.turn),previousTurn:records.some(e=>e.turn===S.turn-1),latest:latest?describe(latest):null,recent:records.filter(e=>e.turn>=S.turn-1).map(describe)};
 };
 const ownCharges=summarizeHistory(u.aiChargeHistory,false),incomingCharges=summarizeHistory(u.aiIncomingChargeHistory,true);
 const livingEnemies=units().filter(v=>v.side!==u.side&&alive(v)&&!v.attachedTo),eligibleEnemies=livingEnemies.filter(v=>!v.fled);
 return {target:target?.name||"unknown",enemyTargets:{living:livingEnemies.length,eligible:eligibleEnemies.length,fleeing:livingEnemies.length-eligibleEnemies.length},chargeHistory:{own:ownCharges,incoming:incomingCharges},nearbyFriendly,nearbyTerrain,likelyBlocker:nearbyFriendly.length?"friendly unit(s)":nearbyTerrain.length?"nearby terrain":"not identified by proximity"};
}
function aiRecordStagnation(u,target,reason){
 u.aiStagnationEvents=(u.aiStagnationEvents||0)+1;
 const context=aiStuckContext(u,target);
 u.aiLastStuckReport={turn:S.turn,reason,...context};
 // Pause only for a route that was found but could not execute a step.
 // A failed route search may still recover by retargeting or turning in place.
 if(S.aiBattleLab&&S.aiLabPauseOnStuck&&!S.aiLabPauseRequested&&!u.engaged&&reason==="route-found-but-no-step-applied")S.aiLabPauseRequested={turn:S.turn,phase:S.phase,side:side==="player"?"red":"blue",unit:u.name,target:target?.name||"unknown",reason,engaged:!!u.engaged,...context};
 if(S.aiBattleLab){
  const blockers=S.aiLabStuckBlockers||(S.aiLabStuckBlockers={});
  blockers[context.likelyBlocker]=(blockers[context.likelyBlocker]||0)+1;
  if(context.nearbyFriendly.length){const k="friendly: "+context.nearbyFriendly[0].name;blockers[k]=(blockers[k]||0)+1;}
  if(context.nearbyTerrain.length){const k="terrain: "+context.nearbyTerrain[0].type;blockers[k]=(blockers[k]||0)+1;}
 }
 return context;
}
function aiPivotAndAdvance(u,target,retargeted=null){
  const seen=retargeted||new Set();
  if(target?.id)seen.add(target.id);
  const separation=gap(u,target),melee=(u.kind==="melee"&&!u.hasRangedWeapon)||(u.isCavalry&&!u.hasRangedWeapon)||(u.isCharacter&&!u.hasRangedWeapon),desiredGap=melee?1.2:Math.max(0,(u.range||BOW_RANGE)-.5),budget=Math.max(0,u.stats.M-u.moveUsed);
  if(separation<=desiredGap+.15)return false;
  let route=findRoute(u,target,desiredGap),changedFormation=false;
  if(!route&&budget>=u.stats.M/2&&!u.isCharacter&&!u.isCavalry&&!u.isDragon&&!u.isSiegeEngine){
    const original=Math.max(1,Math.floor(u.formationWidth||5)),maxWidth=Math.max(1,Math.min(u.models||1,12)),candidates=[original-1,original+1,1,maxWidth].filter((v,i,a)=>v>=1&&v<=maxWidth&&v!==original&&a.indexOf(v)===i);
    for(const width of candidates){
      const old=u.formationWidth;u.formationWidth=width;
      if(canPlace(u,u.x,u.y,u.facing)){
        const candidate=findRoute(u,target,desiredGap);
        if(candidate){u.moveUsed+=u.stats.M/2;u.moved=true;changedFormation=true;route=candidate;say(u.name+" changes formation to "+width+" file(s) to find a route around the obstruction.");break;}
      }
      u.formationWidth=old;
    }
    if(!changedFormation)u.formationWidth=original;
  }
  if(route===null){
    // The route search is deliberately bounded. If it cannot find a complete path,
    // still try a short, legal approach instead of spending the entire activation turning in place.
    const desired=Math.atan2((target.y-u.y)*fieldHeightIn(),(target.x-u.x)*BATTLEFIELD_WIDTH_IN);
    const frontIn=shape(u).front/PX_PER_IN(),budgetLeft=Math.max(0,u.stats.M-u.moveUsed);
    const angles=[desired,desired-Math.PI/4,desired+Math.PI/4,desired-Math.PI/2,desired+Math.PI/2,desired-Math.PI*3/4,desired+Math.PI*3/4,desired+Math.PI];
    let best=null;
    for(const angle of angles){
      const turnCost=Math.abs(normalizeTurn(angle-u.facing))*frontIn;
      if(turnCost>budgetLeft+.001||!canPlace(u,u.x,u.y,angle))continue;
      let x=u.x,y=u.y,travel=0;
      for(let step=0;step<Math.ceil(Math.max(0,budgetLeft-turnCost)*4);step++){
        const remaining=budgetLeft-turnCost-travel;
        if(remaining<=.001)break;
        const inches=Math.min(.25,remaining),nx=x+Math.cos(angle)*inches/BATTLEFIELD_WIDTH_IN,ny=y+Math.sin(angle)*inches/fieldHeightIn();
        if(!canPlace(u,nx,ny,angle))break;
        const cost=terrainMovementCost(terrain(),x,y,nx,ny,BATTLEFIELD_WIDTH_IN,fieldHeightIn(),BATTLEFIELD_WIDTH_IN,fieldHeightIn());
        if(travel+cost>budgetLeft-turnCost+.001)break;
        x=nx;y=ny;travel+=cost;
        if(gap(u,target,x,y,angle)<=desiredGap+.15)break;
      }
      const improvement=separation-gap(u,target,x,y,angle);
      if(improvement>.1&&(!best||improvement>best.improvement))best={angle,x,y,startX:u.x,startY:u.y,turnCost,travel,improvement};
    }
    if(best){
      u.facing=best.angle;u.x=best.x;u.y=best.y;u.moveUsed+=best.turnCost+best.travel;u.moved=true;
      say(u.name+" makes a direct approach toward "+target.name+" after route search found no complete path.");
      u.aiStuckTargetId=null;u.aiStagnantTurns=0;
      if(S.aiLabDiagnosticsEnabled)S.aiLabDiagnostics.push({turn:S.turn,phase:S.phase,side,kind:"movement-route-fallback",unit:u.name,target:target.name,routeFound:false,from:{x:Number(best.startX.toFixed(3)),y:Number(best.startY.toFixed(3))},to:{x:Number(u.x.toFixed(3)),y:Number(u.y.toFixed(3))},movementCost:Number((best.turnCost+best.travel).toFixed(2)),centreDistanceBefore:Number(dist({x:best.startX,y:best.startY},target).toFixed(2)),centreDistanceAfter:Number(dist(u,target).toFixed(2)),baseGapBefore:Number(separation.toFixed(2)),baseGapAfter:Number(gap(u,target).toFixed(2)),distanceImprovement:Number(best.improvement.toFixed(2))});
      return true;
    }
    if(S.aiLabDiagnosticsEnabled)S.aiLabDiagnostics.push({turn:S.turn,phase:S.phase,side,kind:"movement-route-fallback",unit:u.name,target:target.name,routeFound:false,fallbackMoved:false,reason:"no-legal-progress",distance:Number(separation.toFixed(2)),centreDistance:Number(dist(u,target).toFixed(2)),baseGap:Number(separation.toFixed(2)),movementRemaining:Number(budgetLeft.toFixed(2))});
    const stuckContext=aiRecordStagnation(u,target,"no-legal-progress");
    if(S.aiLabDiagnosticsEnabled)S.aiLabDiagnostics.push({turn:S.turn,phase:S.phase,side,kind:"stuck-context",unit:u.name,...stuckContext});
    if(S.aiLabPauseRequested)return false;
    if(u.aiStagnantTurn!==S.turn){u.aiStagnantTurns=(u.aiStuckTargetId===target.id?(u.aiStagnantTurns||0)+1:1);u.aiStagnantTurn=S.turn;}
    u.aiStuckTargetId=target.id||null;
    // If the chosen target is physically unreachable from this position, stop repeating
    // the same failed approach. Try a small number of other visible targets first.
    if(seen.size<3){
      const alternatives=visibleEnemies(u).filter(t=>t.side!==side&&alive(t)&&!t.fled&&!seen.has(t.id))
        .sort((a,b)=>aiTargetScore(u,a,false)-aiTargetScore(u,b,false));
      for(const alternative of alternatives.slice(0,3-seen.size)){
        seen.add(alternative.id);
        if(aiPivotAndAdvance(u,alternative,seen)){
          if(!retargeted)u.aiMovementRetargets=(u.aiMovementRetargets||0)+1;
          u.aiStuckTargetId=null;u.aiStagnantTurns=0;
          if(S.aiLabDiagnosticsEnabled)S.aiLabDiagnostics.push({turn:S.turn,phase:S.phase,side,kind:"movement-retarget",unit:u.name,fromTarget:target.name||"objective",toTarget:alternative.name,reason:"no-legal-progress"});
          return true;
        }
      }
    }
    const turns=angles.map(a=>({a,c:Math.abs(normalizeTurn(a-u.facing))*frontIn})).filter(v=>v.c<=budgetLeft+.001&&canPlace(u,u.x,u.y,v.a)).sort((a,b)=>Math.abs(normalizeTurn(a.a-desired))-Math.abs(normalizeTurn(b.a-desired)));
    if(turns.length){u.facing=turns[0].a;u.moveUsed+=turns[0].c;u.moved=true;say(u.name+" turns toward "+target.name+" but cannot advance along any tested approach this turn.");return true;}
    say(u.name+" cannot find a passable route to "+target.name+" this turn.");return false;
  }
  if(!route.length)return changedFormation;
  const frontIn=shape(u).front/PX_PER_IN();let travelled=0,lastMovementAttempt=null;
  for(const point of route){
    const startX=u.x,startY=u.y,startFacing=u.facing,startUsed=u.moveUsed;
    const angle=point.dir*Math.PI/4,turn=normalizeTurn(angle-u.facing),turnCost=Math.abs(turn)*frontIn;
    const moveCost=terrainMovementCost(terrain(),startX,startY,point.x,point.y,BATTLEFIELD_WIDTH_IN,fieldHeightIn(),BATTLEFIELD_WIDTH_IN,fieldHeightIn());
    const turnPlaceable=turnCost<=.02||canPlace(u,u.x,u.y,angle),endpointPlaceable=canPlace(u,point.x,point.y,angle);
    lastMovementAttempt={stage:null,start:{x:Number(startX.toFixed(4)),y:Number(startY.toFixed(4)),facing:Number(startFacing.toFixed(3)),moveUsed:Number(startUsed.toFixed(3))},waypoint:{x:Number(point.x.toFixed(4)),y:Number(point.y.toFixed(4)),dir:point.dir},turnCost:Number(turnCost.toFixed(3)),moveCost:Number(moveCost.toFixed(3)),movementBudget:Number(u.stats.M.toFixed(3)),remainingBeforeTurn:Number(Math.max(0,u.stats.M-u.moveUsed).toFixed(3)),turnPlaceable,endpointPlaceable,partialFraction:null,partialEndpoint:null,actualDistanceIn:0,moveCostSpent:0};
    if(u.moveUsed+turnCost>u.stats.M+.001){
      // A route can be valid even when the unit cannot complete the whole wheel this turn.
      // Use the remaining movement allowance to turn as far as possible instead of doing nothing.
      const turnBudget=Math.max(0,u.stats.M-u.moveUsed),maxTurnRadians=frontIn>0?turnBudget/frontIn:0;
      if(turnBudget>.001&&Math.abs(turn)>.001&&maxTurnRadians>.001){
        const partialTurn=Math.sign(turn)*Math.min(Math.abs(turn),maxTurnRadians);
        const partialFacing=normalizeTurn(u.facing+partialTurn);
        if(canPlace(u,u.x,u.y,partialFacing)){
          u.facing=partialFacing;u.moveUsed+=Math.abs(partialTurn)*frontIn;u.moved=true;
          lastMovementAttempt.stage="partial-turn-budget";
          lastMovementAttempt.partialTurnRadians=Number(partialTurn.toFixed(4));
          lastMovementAttempt.partialFacing=Number(partialFacing.toFixed(4));
          lastMovementAttempt.moveCostSpent=Number((u.moveUsed-startUsed).toFixed(3));
          lastMovementAttempt.actualDistanceIn=0;
        }else lastMovementAttempt.stage="turn-budget-and-partial-facing-blocked";
      }else lastMovementAttempt.stage="turn-budget";
      break;
    }
    if(!turnPlaceable){lastMovementAttempt.stage="turn-position-blocked";break;}
    u.facing=angle;u.moveUsed+=turnCost;u.moved=true;
    const remaining=Math.max(0,u.stats.M-u.moveUsed);
    if(moveCost<=remaining+.001&&endpointPlaceable){
      u.x=point.x;u.y=point.y;u.moveUsed+=moveCost;travelled+=moveCost;
      lastMovementAttempt.stage="full-step";lastMovementAttempt.actualDistanceIn=Number(Math.hypot((u.x-startX)*BATTLEFIELD_WIDTH_IN,(u.y-startY)*fieldHeightIn()).toFixed(3));lastMovementAttempt.moveCostSpent=Number((turnCost+moveCost).toFixed(3));
      continue;
    }
    // The next route waypoint may be legal but just beyond this turn's budget.
    // Move the furthest affordable, collision-free fraction of this segment instead
    // of discarding an otherwise valid route. Sample along the short segment as well
    // as checking its endpoint so partial movement cannot skip through an obstacle.
    const fractionChecks=[];
    const isLegalFraction=f=>{
      const x=startX+(point.x-startX)*f,y=startY+(point.y-startY)*f;
      const cost=terrainMovementCost(terrain(),startX,startY,x,y,BATTLEFIELD_WIDTH_IN,fieldHeightIn(),BATTLEFIELD_WIDTH_IN,fieldHeightIn());
      const sampleFailures=[];
      if(cost>remaining+.001)return false;
      for(let i=1;i<=4;i++){
        const t=f*i/4,sx=startX+(point.x-startX)*t,sy=startY+(point.y-startY)*t,placeable=canPlace(u,sx,sy,angle);
        if(!placeable)sampleFailures.push({sample:i,fraction:Number(t.toFixed(4)),x:Number(sx.toFixed(4)),y:Number(sy.toFixed(4))});
      }
      fractionChecks.push({fraction:Number(f.toFixed(4)),cost:Number(cost.toFixed(3)),withinBudget:cost<=remaining+.001,legal:sampleFailures.length===0,sampleFailures});
      return sampleFailures.length===0;
    };
    let lo=0,hi=1;
    for(let i=0;i<12;i++){
      const mid=(lo+hi)/2;
      if(isLegalFraction(mid))lo=mid;else hi=mid;
    }
    if(lo>.025){
      const x=startX+(point.x-startX)*lo,y=startY+(point.y-startY)*lo;
      const partialCost=terrainMovementCost(terrain(),startX,startY,x,y,BATTLEFIELD_WIDTH_IN,fieldHeightIn(),BATTLEFIELD_WIDTH_IN,fieldHeightIn());
      if(partialCost<=remaining+.001&&canPlace(u,x,y,angle)){
        u.x=x;u.y=y;u.moveUsed+=partialCost;travelled+=partialCost;
        lastMovementAttempt.stage=endpointPlaceable?"partial-budget-step":"partial-before-blocked-waypoint";
        lastMovementAttempt.partialFraction=Number(lo.toFixed(4));lastMovementAttempt.partialEndpoint={x:Number(x.toFixed(4)),y:Number(y.toFixed(4))};
        lastMovementAttempt.actualDistanceIn=Number(Math.hypot((u.x-startX)*BATTLEFIELD_WIDTH_IN,(u.y-startY)*fieldHeightIn()).toFixed(3));
        lastMovementAttempt.moveCostSpent=Number((turnCost+partialCost).toFixed(3));
      }else lastMovementAttempt.stage="partial-recheck-failed";
    }else lastMovementAttempt.stage=endpointPlaceable?"partial-step-no-legal-fraction":"waypoint-blocked-no-legal-fraction";
    lastMovementAttempt.fractionChecks=fractionChecks.slice(-16);
    break;
  }
  if(travelled>0){say(u.name+" advances "+travelled.toFixed(1)+'" along a passable route toward '+target.name+".");u.aiStuckTargetId=null;u.aiStagnantTurns=0;}
  else if(!changedFormation){
    if(S.aiLabDiagnosticsEnabled){const first=route[0]||null,firstAngle=first?first.dir*Math.PI/4:u.facing,firstTurn=first?Math.abs(normalizeTurn(firstAngle-u.facing))*shape(u).front/PX_PER_IN():0,firstMove=first?terrainMovementCost(terrain(),u.x,u.y,first.x,first.y,BATTLEFIELD_WIDTH_IN,fieldHeightIn(),BATTLEFIELD_WIDTH_IN,fieldHeightIn()):0;S.aiLabDiagnostics.push({turn:S.turn,phase:S.phase,side,kind:"movement-stagnation",unit:u.name,target:target.name,reason:"route-found-but-no-step-applied",routeLength:route.length,firstStep:first?{x:Number(first.x.toFixed(3)),y:Number(first.y.toFixed(3)),dir:first.dir,canPlace:canPlace(u,first.x,first.y,firstAngle),turnCost:Number(firstTurn.toFixed(2)),moveCost:Number(firstMove.toFixed(2)),totalCost:Number((firstTurn+firstMove).toFixed(2)),remaining:Number(Math.max(0,u.stats.M-u.moveUsed).toFixed(2))}:null,movementAttempt:lastMovementAttempt,movementRemaining:Number(Math.max(0,u.stats.M-u.moveUsed).toFixed(2)),lastRouteSearch:u.aiLastRouteSearch||null});}
    const stuckContext=aiRecordStagnation(u,target,"route-found-but-no-step-applied");
    if(S.aiLabDiagnosticsEnabled)S.aiLabDiagnostics.push({turn:S.turn,phase:S.phase,side,kind:"stuck-context",unit:u.name,...stuckContext});
    if(S.aiLabPauseRequested)return false;
    if(u.aiStagnantTurn!==S.turn){u.aiStagnantTurns=(u.aiStuckTargetId===target.id?(u.aiStagnantTurns||0)+1:1);u.aiStagnantTurn=S.turn;}
    u.aiStuckTargetId=target.id||null;
    if(seen.size<3){
      const alternatives=visibleEnemies(u).filter(t=>t.side!==side&&alive(t)&&!t.fled&&!seen.has(t.id)).sort((a,b)=>aiTargetScore(u,a,false)-aiTargetScore(u,b,false));
      for(const alternative of alternatives.slice(0,3-seen.size)){seen.add(alternative.id);if(aiPivotAndAdvance(u,alternative,seen)){if(!retargeted)u.aiMovementRetargets=(u.aiMovementRetargets||0)+1;u.aiStuckTargetId=null;u.aiStagnantTurns=0;if(S.aiLabDiagnosticsEnabled)S.aiLabDiagnostics.push({turn:S.turn,phase:S.phase,side,kind:"movement-retarget",unit:u.name,fromTarget:target.name||"objective",toTarget:alternative.name,reason:"route-found-but-no-progress"});return true;}}
    }
    say(u.name+" cannot make progress toward "+target.name+" this turn; it will reconsider its target and route next turn.");
  }
  return travelled>0||changedFormation;
}
function aiSiegeLadder(u){
  if(S.battleType!=="siege"||u.side!==side||u.isCharacter||u.isCavalry||u.isSiegeEngine||u.models<1)return false;
  if(S.siegeRole==="attacker"&&!u.wallLevel){
    const stairs=terrain().filter(t=>t.type==="stairs");
    const stair=stairs.sort((a,b)=>dist(u,a)-dist(u,b))[0];
    if(stair){
      const d=dist(u,stair);
      if(d<=2.2){
        const walls=terrain().filter(t=>(t.type==="wall"||t.type==="gate")&&(t.wounds??2)>0);let near=null;
        for(const wall of walls){const ax=wall.x1*BATTLEFIELD_WIDTH_IN,ay=wall.y1*fieldHeightIn(),bx=wall.x2*BATTLEFIELD_WIDTH_IN,by=wall.y2*fieldHeightIn(),dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy||1,p=Math.max(0,Math.min(1,((stair.x*BATTLEFIELD_WIDTH_IN-ax)*dx+(stair.y*fieldHeightIn()-ay)*dy)/l2)),x=(ax+dx*p)/BATTLEFIELD_WIDTH_IN,y=(ay+dy*p)/fieldHeightIn(),dd=Math.hypot((stair.x-x)*BATTLEFIELD_WIDTH_IN,(stair.y-y)*fieldHeightIn());if(!near||dd<near.d)near={wall,x,y,d:dd};}
        if(near){u.x=near.x;u.y=near.y;u.wallLevel=true;u.wallSegment=near.wall;u.cover="hard";u.wallDefence={wall:near.wall,posture:"active",wasSkirmishing:!!u.skirmishing};u.skirmishing=true;u.moveUsed=u.stats.M;u.moved=true;say(u.name+" climbs the inner stairs to the battlements.");return true;}
      }else{
        const route=findRoute(u,stair,2.2);
        if(route&&route.length){
          const frontIn=shape(u).front/PX_PER_IN();let travelled=0;
          for(const point of route){
            const angle=point.dir*Math.PI/4,turn=normalizeTurn(angle-u.facing),turnCost=Math.abs(turn)*frontIn;
            if(u.moveUsed+turnCost>u.stats.M+.001)break;
            if(turnCost>.02&&!canPlace(u,u.x,u.y,angle))break;
            const moveCost=terrainMovementCost(terrain(),u.x,u.y,point.x,point.y,BATTLEFIELD_WIDTH_IN,fieldHeightIn(),BATTLEFIELD_WIDTH_IN,fieldHeightIn());
            if(u.moveUsed+turnCost+moveCost>u.stats.M+.001||!canPlace(u,point.x,point.y,angle))break;
            u.facing=angle;u.moveUsed+=turnCost;u.x=point.x;u.y=point.y;u.moveUsed+=moveCost;u.moved=true;travelled+=moveCost;
          }
          if(travelled>0){say(u.name+" takes a passable route toward "+(stair.label||"the castle stairway")+".");return true;}
        }
        say(u.name+" cannot find a passable route to the castle stairway this turn.");return false;
      }
    }
    return false;
  }
  if(S.siegeRole!=="defender")return false;
  const available=terrain().filter(t=>t.type==="ladder"&&t.wallSegment&&t.usedTurn!==S.turn&&dist(u,t)<=3.5);
  if(available.length){
    const count=Math.min(u.models,available.length),ladder=available[0],foe=units().find(v=>v.side==="player"&&alive(v)&&!v.fled&&v.wallLevel&&dist(v,ladder)<=1);
    available.slice(0,count).forEach(t=>t.usedTurn=S.turn);
    let group=u;
    if(count<u.models){u.models-=count;u.moveUsed=u.stats.M;group={...u,id:u.id+"w"+S.turn+Object.keys(S.units).length,name:u.name+" (wall party)",short:u.short,isWallParty:true,models:count,startModels:count,points:0,damage:0,attachedCharacters:[],attachedTo:null,champion:{enabled:false},championAlive:false,championWounds:0,characterWounds:null,engaged:false,engagedWith:null,engagedWithIds:[],engagementSides:{}};S.units[group.id]=group;}
    group.x=ladder.x;group.y=ladder.y;group.wallLevel=true;group.onLadder=!!foe;group.wallSegment=ladder.wallSegment;group.cover="hard";group.wallDefence={wall:ladder.wallSegment,posture:"active",wasSkirmishing:!!group.skirmishing};group.skirmishing=true;group.moveUsed=group.stats.M;group.moved=true;group.activated=true;
    if(foe){group.engaged=foe.engaged=true;group.engagedWith=foe.id;foe.engagedWith=group.id;group.engagedWithIds=[foe.id];foe.engagedWithIds=[...new Set([...(foe.engagedWithIds||[]),group.id])];say(u.name+" sends "+count+" model(s) up a ladder into combat on the battlements.");}
    else say(u.name+" climbs "+count+" model(s) onto the battlements.");
    return true;
  }
  const walls=terrain().filter(t=>(t.type==="wall"||t.type==="gate")&&(t.wounds??2)>0);
  let near=null;
  for(const wall of walls){const ax=wall.x1*BATTLEFIELD_WIDTH_IN,ay=wall.y1*fieldHeightIn(),bx=wall.x2*BATTLEFIELD_WIDTH_IN,by=wall.y2*fieldHeightIn(),dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy||1,p=Math.max(0,Math.min(1,((u.x*BATTLEFIELD_WIDTH_IN-ax)*dx+(u.y*fieldHeightIn()-ay)*dy)/l2)),x=(ax+dx*p)/BATTLEFIELD_WIDTH_IN,y=(ay+dy*p)/fieldHeightIn(),d=Math.hypot((u.x-x)*BATTLEFIELD_WIDTH_IN,(u.y-y)*fieldHeightIn());if(!near||d<near.d)near={wall,x,y,d};}
  const capacity=Math.floor(u.models/5);
  if(near&&near.d<=3.5&&capacity>(u.laddersDeployed||0)&&u.ladderDeployedTurn!==S.turn){terrain().push({type:"ladder",x:near.x,y:near.y,wallSegment:near.wall,owner:side,usedTurn:0});u.laddersDeployed=(u.laddersDeployed||0)+1;u.ladderDeployedTurn=S.turn;say(u.name+" deploys an assault ladder against the castle "+(near.wall.type==="gate"?"gate":"wall")+".");return true;}
  return false;
}
function aiObjectiveTarget(u){
 if(!S.objectiveMode)return null;
 if(S.objectiveMode==="holdGround")return {x:.5,y:.5};
 if(S.objectiveMode==="captureFlag"){
  if(u.carryingFlagSide)return {x:u.side==="player"?.08:.92,y:.5};
  const enemyFlag=S.flags?.[u.side===side?enemySide:side];
  if(enemyFlag?.carrierId){const carrier=S.units[enemyFlag.carrierId];if(carrier?.side===u.side)return {x:u.side==="player"?.08:.92,y:.5};}
  return enemyFlag?{x:enemyFlag.x,y:enemyFlag.y}:null;
 }
 if(S.objectiveMode==="relics"){
  if(u.carryingRelicId)return {x:u.side==="player"?.22:.78,y:u.y};
  const relics=(S.objectives||[]).filter(o=>o.kind==="relic"&&!o.bankedBy&&!o.carrierId);
  return relics.sort((a,b)=>dist(u,a)-dist(u,b))[0]||{x:u.side==="player"?.22:.78,y:.5};
 }
 return null;
}
function runAiActivationCore(){aiCastSpells();const candidates=units().filter(u=>u.side===side&&eligibleForActivation(u));if(!candidates.length)return false;const wantsRange=aiWantsRange();candidates.sort((a,b)=>{const rank=u=>wantsRange?(u.hasRangedWeapon?0:1):((u.kind==="melee"&&!u.hasRangedWeapon)||u.isCavalry?0:1);if(policy==="experimental"||policy==="experimental2"||policy==="experimental3"){const delta=aiActivationPriority(b)-aiActivationPriority(a);if(delta)return delta;}return rank(a)-rank(b);});const u=candidates[0],actualTargets=visibleEnemies(u).filter(v=>!v.fled&&alive(v)),targets=actualTargets.length?actualTargets:aiLastKnownTargets();if(S.battleType==="siege"&&S.siegeRole==="attacker"&&u.side===side&&u.wallLevel){const rangedForce=units().filter(v=>v.side===side&&v.hasRangedWeapon&&!v.isCannon&&!v.isBoltThrower),livingRanged=rangedForce.filter(v=>alive(v)&&!v.fled).length;if(livingRanged>Math.max(1,Math.ceil(rangedForce.length*.35))){const inRange=u.hasRangedWeapon?actualTargets.filter(t=>gap(u,t)<=(u.range||BOW_RANGE)):[],target=inRange.length?aiBestTarget(u,inRange,false):null;if(target&&!u.shot){if(u.ownsShield){u.rangedMode="bow";u.shield=false;}u.facing=Math.atan2((target.y-u.y)*fieldHeightIn(),(target.x-u.x)*BATTLEFIELD_WIDTH_IN);shoot(u,target,false);}u.activated=true;return true;}}if(aiSiegeLadder(u)){u.activated=true;return true;}if(u.isCannon||u.isBoltThrower||u.isCatapult){if(targets.length&&!u.shot&&u.artilleryWounds>0&&!u.moved){const target=aiBestTarget(u,targets,false);fireCannon?.(u,target.x,target.y,target.isLastKnownContact?null:target);}u.activated=true;return true;}if(targets.length){const inRange=u.hasRangedWeapon?actualTargets.filter(t=>gap(u,t)<=(u.range||BOW_RANGE)):[],combatTarget=inRange.length?aiBestTarget(u,inRange,false):aiBestTarget(u,targets,u.kind==="melee"&&!u.hasRangedWeapon),objectiveTarget=aiObjectiveTarget(u),target=objectiveTarget&&(!combatTarget||dist(u,objectiveTarget)+2<dist(u,combatTarget))?objectiveTarget:combatTarget;if(u.hasRangedWeapon&&inRange.length){if(u.ownsShield){u.rangedMode="bow";u.shield=false;}u.facing=Math.atan2((target.y-u.y)*fieldHeightIn(),(target.x-u.x)*BATTLEFIELD_WIDTH_IN);shoot(u,target,false);}else{if(u.ownsShield){u.rangedMode="shield";u.shield=!!u.ownsShield&&!["greatWeapon","halberd"].includes(u.weapon);}aiPivotAndAdvance(u,target);if(u.hasRangedWeapon){const available=actualTargets.filter(t=>!t.fled&&alive(t)&&gap(u,t)<=(u.range||BOW_RANGE));if(available.length){const shotTarget=aiBestTarget(u,available,false);if(u.ownsShield){u.rangedMode="bow";u.shield=false;}u.facing=Math.atan2((shotTarget.y-u.y)*fieldHeightIn(),(shotTarget.x-u.x)*BATTLEFIELD_WIDTH_IN);shoot(u,shotTarget,false);}}}}u.activated=true;return true;}

function runAiActivation(){
 const before=new Map(units().map(u=>[u.id,{x:u.x,y:u.y,facing:u.facing,models:u.models,shot:!!u.shot,moved:!!u.moved,activated:!!u.activated,engaged:!!u.engaged,charged:!!u.charged,moveUsed:u.moveUsed||0,formationWidth:u.formationWidth||null,shield:!!u.shield,rangedMode:u.rangedMode||null,wounds:u.characterWounds??u.artilleryWounds??u.chariotWounds??null}]));
 const candidates=units().filter(u=>u.side===side&&eligibleForActivation(u));
 const selected=[...candidates].sort((a,b)=>{const wantsRange=armyRangeScore(side)>armyRangeScore(enemySide);const rank=u=>wantsRange?(u.hasRangedWeapon?0:1):((u.kind==="melee"&&!u.hasRangedWeapon)||u.isCavalry?0:1);if(policy==="experimental"||policy==="experimental2"||policy==="experimental3"){const delta=aiActivationPriority(b)-aiActivationPriority(a);if(delta)return delta;}return rank(a)-rank(b);})[0];
 const selectedStart=selected?{x:selected.x,y:selected.y}:null;
 const visible=selected?visibleEnemies(selected).filter(v=>!v.fled&&alive(v)):[];
 const nearest=selected&&visible.length?visible.map(t=>({name:t.name,distance:Number(dist(selected,t).toFixed(2))})).sort((a,b)=>a.distance-b.distance)[0]:null;
 const decisionStarted=aiNow();
 const result=runAiActivationCore();
 if(S.aiBattleLab){
  const elapsed=Math.max(0,aiNow()-decisionStarted),key=side==="player"?"red":"blue",stats=S.aiLabDecisionTiming?.[key];
  if(stats){stats.calls++;stats.totalMs+=elapsed;if(elapsed>stats.maxMs){stats.maxMs=elapsed;stats.maxUnit=selected?.name||"unknown";}}
 }
 if(S.aiLabDiagnosticsEnabled&&selected){
  const after=units().map(u=>({u,b:before.get(u.id)})).filter(x=>x.b);
  const changes=after.filter(({u,b})=>Math.abs(u.x-b.x)>.0001||Math.abs(u.y-b.y)>.0001||Math.abs((u.facing||0)-(b.facing||0))>.0001||u.models!==b.models||!!u.shot!==b.shot||!!u.moved!==b.moved||!!u.activated!==b.activated||!!u.engaged!==b.engaged||!!u.charged!==b.charged||u.moveUsed!==b.moveUsed||u.formationWidth!==b.formationWidth||!!u.shield!==b.shield||u.rangedMode!==b.rangedMode||((u.characterWounds??u.artilleryWounds??u.chariotWounds??null)!==b.wounds));
  const moved=changes.filter(x=>Math.abs(x.u.x-x.b.x)>.0001||Math.abs(x.u.y-x.b.y)>.0001).map(x=>x.u.name);
  const turned=changes.filter(x=>Math.abs((x.u.facing||0)-(x.b.facing||0))>.0001&&!moved.includes(x.u.name)).map(x=>x.u.name);
  const fired=changes.filter(x=>!x.b.shot&&x.u.shot).map(x=>x.u.name);
  const losses=changes.filter(x=>x.u.models<x.b.models).map(x=>x.u.name+": "+x.b.models+"→"+x.u.models);
  S.aiLabDiagnostics.push({turn:S.turn,phase:S.phase,side,kind:"activation",unit:selected.name,unitType:selected.type||selected.kind||null,isCharacter:!!selected.isCharacter,isCavalry:!!selected.isCavalry,isChariot:!!selected.isChariot,eligible:candidates.length,eligibleUnits:candidates.map(u=>({name:u.name,id:u.id,attachedTo:u.attachedTo||null,kind:u.kind||u.type||null})),visibleTargets:visible.length,nearestEnemy:nearest,action:!result?"no-action":moved.length?"move":fired.length?"shoot":losses.length?"casualties/other":turned.length?"turn-only":changes.length?"state-change":"no-visible-change",moved,turned,fired,losses,from:selectedStart?{x:Number(selectedStart.x.toFixed(3)),y:Number(selectedStart.y.toFixed(3))}:null,to:{x:Number(selected.x.toFixed(3)),y:Number(selected.y.toFixed(3)),facing:Number((selected.facing||0).toFixed(3)),moveUsed:Number((selected.moveUsed||0).toFixed(2)),activated:!!selected.activated}});
 }
 return result;
}
function runAiActivations({finishPhase=true}={}){S.activationSide=side;while(runAiActivation()){}if(finishPhase)beginCombatPhase();}
  return { runAiActivation, runAiActivations, side, policy };
}
