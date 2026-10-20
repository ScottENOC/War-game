import { terrainElevationAt } from "./terrain.js";

export function createVision({ S, units, alive, dist, terrain = () => [], W, H, shape, BATTLEFIELD_WIDTH_IN = 48, fieldHeightIn = () => 36 }) {
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const normalise=a=>{while(a>Math.PI)a-=Math.PI*2;while(a< -Math.PI)a+=Math.PI*2;return a;};
  const height=u=>Number(u?.heightIn)||((u?.isDragon||u?.isGiant||u?.isTroll||u?.isMonster)?4:(u?.isCavalry||u?.mounted||u?.flyingMount)?2.5:1.7);
  function armourPenalty(u){
    const host=u?.attachedTo?S.units[u.attachedTo]:null, candidates=[u,host,...(u?.attachedCharacters||[]).map(id=>S.units[id])].filter(Boolean);
    if(candidates.some(v=>v.heavyArmour||v.armour==="heavy"||v.armour==="full"||v.armour==="plate"||v.armour==="heavyArmour"))return 40;
    if(candidates.some(v=>v.lightArmour||v.armour==="light"||v.armour==="lightArmour"))return 20;
    return 0;
  }
  function fieldOfView(u){return Math.max(90,220-armourPenalty(u));}
  function engagedOrTouching(a,b){if(a?.engaged||b?.engaged)return true;const linked=!!(a?.engagedWithIds||[]).includes(b?.id)||a?.engagedWith===b?.id||!!(b?.engagedWithIds||[]).includes(a?.id)||b?.engagedWith===a?.id;if(linked)return true;const qa=shape(a),qb=shape(b),dx=(b.x-a.x)*W(),dy=(b.y-a.y)*H(),fa=a.facing||0,fb=b.facing||0,axes=[[Math.cos(fa),Math.sin(fa)],[-Math.sin(fa),Math.cos(fa)],[Math.cos(fb),Math.sin(fb)],[-Math.sin(fb),Math.cos(fb)]];return axes.every(([ax,ay])=>{const separation=Math.abs(dx*ax+dy*ay),ra=qa.depth/2*Math.abs(ax*Math.cos(fa)+ay*Math.sin(fa))+qa.front/2*Math.abs(-ax*Math.sin(fa)+ay*Math.cos(fa)),rb=qb.depth/2*Math.abs(ax*Math.cos(fb)+ay*Math.sin(fb))+qb.front/2*Math.abs(-ax*Math.sin(fb)+ay*Math.cos(fb));return separation<=ra+rb+1;});}
  function segmentsCross(a,b,c,d){const rx=b.x-a.x,ry=b.y-a.y,sx=d.x-c.x,sy=d.y-c.y,den=rx*sy-ry*sx;if(Math.abs(den)<.0001)return false;const t=((c.x-a.x)*sy-(c.y-a.y)*sx)/den,u=((c.x-a.x)*ry-(c.y-a.y)*rx)/den;return t>.025&&t<.975&&u>=0&&u<=1;}
  function wallBlocks(ox,oy,tx,ty){if(!terrain().length)return false;const a={x:ox,y:oy},b={x:tx,y:ty};return terrain().some(t=>{if(!["wall","gate"].includes(t.type)||(t.wounds??2)<=0)return false;return segmentsCross(a,b,{x:t.x1*W(),y:t.y1*H()},{x:t.x2*W(),y:t.y2*H()});});}
  function lineOfSight(observer,target){
    const ox=observer.x*W(),oy=observer.y*H(),tx=target.x*W(),ty=target.y*H(),dx=tx-ox,dy=ty-oy,len2=dx*dx+dy*dy||1,steps=Math.max(8,Math.ceil(Math.hypot(dx,dy)/(W()/BATTLEFIELD_WIDTH_IN*.45)));if(wallBlocks(ox,oy,tx,ty))return false;
    const startGround=terrainElevationAt(terrain(),ox,oy,W(),H()),endGround=terrainElevationAt(terrain(),tx,ty,W(),H());
    const startZ=startGround+height(observer)*.75+(observer.flyingMount&&!observer.engaged?12:0),endZ=endGround+height(target)*.75+(target.flyingMount&&!target.engaged?12:0);
    for(let i=1;i<steps;i++){const t=i/steps,x=ox+dx*t,y=oy+dy*t,ground=terrainElevationAt(terrain(),x,y,W(),H()),ray=startZ+(endZ-startZ)*t;if(ground>ray+.08)return false;}
    for(const blocker of units()){
      if(blocker===observer||blocker===target||blocker.attachedTo||!alive(blocker)||blocker.fled||blocker.deployed===false)continue;
      const bx=blocker.x*W(),by=blocker.y*H(),t=clamp(((bx-ox)*dx+(by-oy)*dy)/len2,0,1);
      if(t<.025||t>.975)continue;
      const cx=ox+dx*t,cy=oy+dy*t,q=shape(blocker),radius=Math.max(q.front,q.depth)*.43;
      if(Math.hypot(bx-cx,by-cy)>radius)continue;
      const ray=startZ+(endZ-startZ)*t,top=terrainElevationAt(terrain(),bx,by,W(),H())+height(blocker)+(blocker.flyingMount&&!blocker.engaged?12:0);
      if(top>ray+.08)return false;
    }
    return true;
  }
  function canObserverSee(observer,target){
    if(!observer||!target||!alive(observer)||!alive(target)||observer.fled||target.fled||observer.deployed===false||target.deployed===false)return false;
    if(engagedOrTouching(observer,target))return true;
    const dx=(target.x-observer.x)*W(),dy=(target.y-observer.y)*H(),bearing=Math.atan2(dy,dx),delta=normalise(bearing-(observer.facing||0));
    if(Math.abs(delta)>fieldOfView(observer)*Math.PI/360)return false;
    return lineOfSight(observer,target);
  }
  function isUnitVisible(target,viewerSide){
    if(!target||target.side===viewerSide||!alive(target)||target.fled||target.deployed===false)return true;
    if(S.phase==="deployment")return false;
    if(target.revealedUntilMovementPhase!=null&&target.revealedUntilMovementPhase===S.movementPhaseId)return true;
    return units().some(observer=>observer.side===viewerSide&&alive(observer)&&!observer.fled&&!observer.attachedTo&&observer.deployed!==false&&canObserverSee(observer,target));
  }
  function updateAiMemory(){
    S.aiLastKnown=S.aiLastKnown||{};
    for(const target of units().filter(u=>u.side==="player"&&alive(u)&&!u.fled&&!u.attachedTo&&u.deployed!==false)){
      if(isUnitVisible(target,"ai"))S.aiLastKnown[target.id]={id:target.id,name:target.name,x:target.x,y:target.y,facing:target.facing||0,turn:S.turn,seenMovementPhase:S.movementPhaseId};
    }
    for(const [id,last] of Object.entries(S.aiLastKnown))if(!S.units[id]||!alive(S.units[id])||S.units[id].fled)delete S.aiLastKnown[id];
  }
  function visibleEnemies(unit){
    if(!unit)return [];
    if(unit.side==="ai")updateAiMemory();
    return units().filter(target=>target.side!==unit.side&&alive(target)&&!target.fled&&!target.attachedTo&&isUnitVisible(target,unit.side));
  }
  function aiLastKnownTargets(){
    updateAiMemory();
    return Object.values(S.aiLastKnown||{}).filter(last=>{const actual=S.units[last.id];return actual&&alive(actual)&&!actual.fled&&!isUnitVisible(actual,"ai");}).map(last=>{
      // Last-known contacts are deliberately stale, approximate movement goals, never real targets.
      const age=Math.max(0,(S.movementPhaseId||0)-(last.seenMovementPhase||0)),drift=Math.min(2.5,.35+age*.35),seed=String(last.id).split("").reduce((n,c)=>n+c.charCodeAt(0),0),angle=((seed+(S.turn||1)*37)%360)*Math.PI/180;
      return {id:"last-known-"+last.id,realUnitId:last.id,name:"Last known contact",short:"Contact",x:clamp(last.x+Math.cos(angle)*drift/BATTLEFIELD_WIDTH_IN,0,1),y:clamp(last.y+Math.sin(angle)*drift/fieldHeightIn(),0,1),side:"player",isLastKnownContact:true,models:0,stats:{M:0},facing:last.facing||0};
    });
  }
  function revealUnit(u){if(!u)return;u.revealedUntilMovementPhase=S.movementPhaseId||0;}
  function beginMovementPhase(){
    S.movementPhaseId=(S.movementPhaseId||0)+1;
    for(const u of units())if(u.revealedUntilMovementPhase!=null&&u.revealedUntilMovementPhase<S.movementPhaseId)delete u.revealedUntilMovementPhase;
    updateAiMemory();
  }
  return { isUnitVisible, canObserverSee, visibleEnemies, aiLastKnownTargets, revealUnit, beginMovementPhase, fieldOfView, lineOfSight, updateAiMemory };
}
