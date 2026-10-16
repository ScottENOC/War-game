import { terrainMovementCost } from "./terrain.js";
export function createAI({ S, units, alive, eligibleForActivation, enemies, dist, BATTLEFIELD_WIDTH_IN, fieldHeightIn, shape, PX_PER_IN, canPlace, say, shoot, fireCannon, BOW_RANGE, beginCombatPhase, terrain = () => [] }) {
  function armyRangeScore(side){const force=units().filter(u=>u.side===side&&alive(u));return force.length?force.filter(u=>u.hasRangedWeapon).length/force.length:0;}
function aiWantsRange(){return armyRangeScore("ai")>armyRangeScore("player");}
function aiTargetScore(u,t,preferRanged){const dx=(t.x-u.x)*BATTLEFIELD_WIDTH_IN,dy=(t.y-u.y)*fieldHeightIn(),d=Math.hypot(dx,dy),bearing=Math.atan2(dy,dx),delta=Math.atan2(Math.sin(bearing-u.facing),Math.cos(bearing-u.facing)),frontPenalty=Math.abs(delta)>Math.PI/2?7:Math.abs(delta)*1.5,rangedBonus=preferRanged&&(t.kind==="archer"||t.hasRangedWeapon)?3:0;return d+frontPenalty-rangedBonus;}
function aiBestTarget(u,targets,preferRanged){return targets.slice().sort((a,b)=>aiTargetScore(u,a,preferRanged)-aiTargetScore(u,b,preferRanged))[0]||null;}
function normalizeTurn(a){while(a>Math.PI)a-=Math.PI*2;while(a< -Math.PI)a+=Math.PI*2;return a;}
function findRoute(u,target,desiredGap){
  const step=.035,frontIn=shape(u).front/PX_PER_IN(),minX=Math.ceil((-.0-u.x)/step),maxX=Math.floor((1-u.x)/step),minY=Math.ceil((-.0-u.y)/step),maxY=Math.floor((1-u.y)/step),dirs=Array.from({length:8},(_,i)=>i*Math.PI/4);
  const position=(ix,iy)=>({x:u.x+ix*step,y:u.y+iy*step}),key=(ix,iy,d)=>ix+","+iy+","+d;
  const startDir=((Math.round((normalizeTurn(u.facing)+Math.PI*2)%(Math.PI*2)/(Math.PI/4)))%8),start={ix:0,iy:0,dir:startDir,g:0,f:Math.max(0,dist(u,target)-desiredGap),parent:null},best=new Map([[key(0,0,startDir),0]]);
  if(dist(u,target)<=desiredGap+.15)return [];
  const heap=[];const push=n=>{heap.push(n);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p].f<=heap[i].f)break;heap[i]=heap[p];i=p;}heap[i]=n;};const pop=()=>{const root=heap[0],last=heap.pop();if(heap.length){let i=0;while(true){let l=i*2+1,r=l+1;if(l>=heap.length)break;let m=r<heap.length&&heap[r].f<heap[l].f?r:l;if(heap[m].f>=last.f)break;heap[i]=heap[m];i=m;}heap[i]=last;}return root;};push(start);
  let found=null,expanded=0;
  while(heap.length&&expanded<3200){
    const node=pop(),k=key(node.ix,node.iy,node.dir);if(node.g>(best.get(k)??Infinity)+1e-6)continue;expanded++;
    const p=position(node.ix,node.iy);
    if((node.ix!==0||node.iy!==0)&&dist(p,target)<=desiredGap+.18){found=node;break;}
    const currentAngle=node.parent?dirs[node.dir]:u.facing;
    for(let d=0;d<8;d++){
      const nx=node.ix+Math.round(Math.cos(dirs[d])),ny=node.iy+Math.round(Math.sin(dirs[d]));
      if(nx<minX||nx>maxX||ny<minY||ny>maxY)continue;
      const q=position(nx,ny),turn=normalizeTurn(dirs[d]-currentAngle),turnCost=Math.abs(turn)*frontIn;
      if(turnCost>.02&&!canPlace(u,p.x,p.y,dirs[d]))continue;
      if(!canPlace(u,q.x,q.y,dirs[d]))continue;
      const moveCost=terrainMovementCost(terrain(),p.x,p.y,q.x,q.y,BATTLEFIELD_WIDTH_IN,fieldHeightIn(),BATTLEFIELD_WIDTH_IN,fieldHeightIn());
      const g=node.g+turnCost+moveCost,nk=key(nx,ny,d);if(g>=(best.get(nk)??Infinity)-1e-6)continue;
      best.set(nk,g);const h=Math.max(0,dist(q,target)-desiredGap);
      push({ix:nx,iy:ny,dir:d,g,f:g+h,parent:node});
    }
  }
  if(!found)return null;
  const path=[];for(let n=found;n&&n.parent;n=n.parent)path.push({ ...position(n.ix,n.iy),dir:n.dir });return path.reverse();
}
function aiPivotAndAdvance(u,target){
  const gap=dist(u,target),melee=(u.kind==="melee"&&!u.hasRangedWeapon)||(u.isCavalry&&!u.hasRangedWeapon)||(u.isCharacter&&!u.hasRangedWeapon),desiredGap=melee?1.2:Math.max(0,(u.range||BOW_RANGE)-.5),budget=Math.max(0,u.stats.M-u.moveUsed);
  if(gap<=desiredGap+.15)return false;
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
    const desired=Math.atan2((target.y-u.y)*fieldHeightIn(),(target.x-u.x)*BATTLEFIELD_WIDTH_IN),frontIn=shape(u).front/PX_PER_IN(),turns=[desired,desired-Math.PI/4,desired+Math.PI/4,desired-Math.PI/2,desired+Math.PI/2,desired+Math.PI],choices=turns.map(a=>({a,c:Math.abs(normalizeTurn(a-u.facing))*frontIn})).filter(v=>v.c<=Math.max(0,u.stats.M-u.moveUsed)+.001&&canPlace(u,u.x,u.y,v.a)).sort((a,b)=>Math.abs(normalizeTurn(a.a-desired))-Math.abs(normalizeTurn(b.a-desired)));
    if(choices.length){u.facing=choices[0].a;u.moveUsed+=choices[0].c;u.moved=true;say(u.name+" turns to free itself from the obstruction; it will try a different approach next turn.");return true;}
    say(u.name+" cannot find a passable route to "+target.name+" this turn.");return false;
  }
  if(!route.length)return changedFormation;
  const frontIn=shape(u).front/PX_PER_IN();let travelled=0;
  for(const point of route){
    const angle=point.dir*Math.PI/4,turn=normalizeTurn(angle-u.facing),turnCost=Math.abs(turn)*frontIn;
    if(u.moveUsed+turnCost>u.stats.M+.001)break;
    if(turnCost>.02&&!canPlace(u,u.x,u.y,angle))break;
    const moveCost=terrainMovementCost(terrain(),u.x,u.y,point.x,point.y,BATTLEFIELD_WIDTH_IN,fieldHeightIn(),BATTLEFIELD_WIDTH_IN,fieldHeightIn());
    if(u.moveUsed+turnCost+moveCost>u.stats.M+.001||!canPlace(u,point.x,point.y,angle))break;
    u.facing=angle;u.moveUsed+=turnCost;u.x=point.x;u.y=point.y;u.moveUsed+=moveCost;u.moved=true;travelled+=moveCost;
  }
  if(travelled>0)say(u.name+" advances "+travelled.toFixed(1)+'" along a passable route toward '+target.name+".");
  else if(!changedFormation)say(u.name+" cannot make progress toward "+target.name+" this turn; it will reconsider its formation and route next turn.");
  return travelled>0||changedFormation;
}
function aiSiegeLadder(u){
  if(S.battleType!=="siege"||u.side!=="ai"||u.isCharacter||u.isCavalry||u.isSiegeEngine||u.models<1)return false;
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
  if(near&&near.d<=3.5&&capacity>(u.laddersDeployed||0)&&u.ladderDeployedTurn!==S.turn){terrain().push({type:"ladder",x:near.x,y:near.y,wallSegment:near.wall,owner:"ai",usedTurn:0});u.laddersDeployed=(u.laddersDeployed||0)+1;u.ladderDeployedTurn=S.turn;say(u.name+" deploys an assault ladder against the castle "+(near.wall.type==="gate"?"gate":"wall")+".");return true;}
  return false;
}
function runAiActivation(){const candidates=units().filter(u=>u.side==="ai"&&eligibleForActivation(u));if(!candidates.length)return false;const wantsRange=aiWantsRange();candidates.sort((a,b)=>{const rank=u=>wantsRange?(u.hasRangedWeapon?0:1):((u.kind==="melee"&&!u.hasRangedWeapon)||u.isCavalry?0:1);return rank(a)-rank(b);});const u=candidates[0],targets=enemies(u).filter(v=>!v.fled&&alive(v));if(S.battleType==="siege"&&S.siegeRole==="attacker"&&u.side==="ai"&&u.wallLevel){const rangedForce=units().filter(v=>v.side==="ai"&&v.hasRangedWeapon&&!v.isCannon&&!v.isBoltThrower),livingRanged=rangedForce.filter(v=>alive(v)&&!v.fled).length;if(livingRanged>Math.max(1,Math.ceil(rangedForce.length*.35))){const inRange=u.hasRangedWeapon?targets.filter(t=>dist(u,t)<=(u.range||BOW_RANGE)):[],target=inRange.length?aiBestTarget(u,inRange,false):null;if(target&&!u.shot){if(u.ownsShield){u.rangedMode="bow";u.shield=false;}u.facing=Math.atan2((target.y-u.y)*fieldHeightIn(),(target.x-u.x)*BATTLEFIELD_WIDTH_IN);shoot(u,target,false);}u.activated=true;return true;}}if(aiSiegeLadder(u)){u.activated=true;return true;}if(u.isCannon||u.isBoltThrower){if(targets.length&&!u.shot&&u.artilleryWounds>0&&!u.moved){const target=aiBestTarget(u,targets,false);fireCannon?.(u,target.x,target.y,target);}u.activated=true;return true;}if(targets.length){const inRange=u.hasRangedWeapon?targets.filter(t=>dist(u,t)<=(u.range||BOW_RANGE)):[],target=inRange.length?aiBestTarget(u,inRange,false):aiBestTarget(u,targets,u.kind==="melee"&&!u.hasRangedWeapon);if(u.hasRangedWeapon&&inRange.length){if(u.ownsShield){u.rangedMode="bow";u.shield=false;}u.facing=Math.atan2((target.y-u.y)*fieldHeightIn(),(target.x-u.x)*BATTLEFIELD_WIDTH_IN);shoot(u,target,false);}else{if(u.ownsShield){u.rangedMode="shield";u.shield=!!u.ownsShield&&!["greatWeapon","halberd"].includes(u.weapon);}aiPivotAndAdvance(u,target);if(u.hasRangedWeapon){const available=targets.filter(t=>!t.fled&&alive(t)&&dist(u,t)<=(u.range||BOW_RANGE));if(available.length){const shotTarget=aiBestTarget(u,available,false);if(u.ownsShield){u.rangedMode="bow";u.shield=false;}u.facing=Math.atan2((shotTarget.y-u.y)*fieldHeightIn(),(shotTarget.x-u.x)*BATTLEFIELD_WIDTH_IN);shoot(u,shotTarget,false);}}}}u.activated=true;return true;}
function runAiActivations(){S.activationSide="ai";while(runAiActivation()){}beginCombatPhase();}
  return { runAiActivation, runAiActivations };
}
