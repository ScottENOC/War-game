export function createShooting({ S, units, alive, dist, BOW_RANGE, roll, woundTarget, saveTarget, applyDamage, say, diceStack, $, shootingAttack, panicNearby, shape, corners, W, H }) {
  function showAttack(label, u, target, result, kind) {
    const extras=[];
    if(result.longRange)extras.push("long range (−"+(result.longRangePenalty||1)+")");
    if(result.moved)extras.push(result.elvenArchery?"moved (Elven Archery applies)":"moved (−1)");
    if(result.standShoot)extras.push("stand & shoot (−1)");
    if(result.targetCharging)extras.push("target charging (−1)");
    if(result.overUnitPenalty)extras.push("firing over friendly unit (−"+result.overUnitPenalty+")");
    if(result.hitModifier)extras.push("hit modifier "+(result.hitModifier>0?"+":"")+result.hitModifier);
    const extra=kind==="shoot"&&extras.length?" · "+extras.join(", "):"";
    const distText=Number.isFinite(result.distance)?" · "+result.distance.toFixed(1)+'"':"";
    const stack=diceStack(u,result);
    say("<b>"+label+": "+u.name+" → "+target.name+"</b><div class=\"rollsummary\">"+result.attacks+(kind==="shoot"?" shots":" attacks")+distText+extra+"</div>"+stack);
    $("rollcontent").innerHTML=stack;$("rollview").classList.add("show");
  }
  function panicTest(target) {
    if(target.panicTested)return;
    const threshold=Math.ceil(target.startModels*.25);
    if(target.shootCasualties<threshold||!alive(target))return;
    target.panicTested=true;
    const dice=roll(2),total=dice[0]+dice[1],snakeEyes=dice[0]===1&&dice[1]===1;
    say("<b>Panic test — "+target.name+"</b>: shooting casualties "+target.shootCasualties+"/"+target.startModels+" (25% threshold "+threshold+"). 2D6 <span class=\"dice\">"+dice.join(" + ")+" = "+total+"</span>; need "+target.stats.Ld+" or less.");
    if(snakeEyes)say("Snake eyes! A double 1 always passes the morale test.");
    if(!snakeEyes&&total>target.stats.Ld){target.fled=true;target.engaged=false;say(target.name+" fails its unmodified Leadership test and flees.");}
  }
  function modelCentres(u, maxRanks=Infinity) {
    if(!u||u.models<=0)return [{x:u.x*W(),y:u.y*H(),champion:false}];
    const q=shape(u),count=Math.min(u.models,q.files*Math.max(1,Math.min(q.ranks,maxRanks)));
    const points=[];
    for(let i=0;i<count;i++){
      const rank=Math.floor(i/q.files),file=i%q.files;
      if(rank>=maxRanks)continue;
      const localX=q.depth/2-(rank+.5)*q.baseDepth,localY=-q.front/2+(file+.5)*q.baseWidth;
      const c=Math.cos(u.facing||0),sn=Math.sin(u.facing||0);
      points.push({x:u.x*W()+localX*c-localY*sn,y:u.y*H()+localX*sn+localY*c,champion:!!(u.champion&&u.champion.enabled&&u.championAlive!==false&&rank===0&&file===Math.floor(q.files/2))});
    }
    return points;
  }
  function orient(a,b,c){return (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);}
  function onSegment(a,b,p){return p.x>=Math.min(a.x,b.x)-.01&&p.x<=Math.max(a.x,b.x)+.01&&p.y>=Math.min(a.y,b.y)-.01&&p.y<=Math.max(a.y,b.y)+.01;}
  function segmentsIntersect(a,b,c,d){
    const o1=orient(a,b,c),o2=orient(a,b,d),o3=orient(c,d,a),o4=orient(c,d,b);
    if(((o1>0&&o2<0)||(o1<0&&o2>0))&&((o3>0&&o4<0)||(o3<0&&o4>0)))return true;
    return (Math.abs(o1)<.01&&onSegment(a,b,c))||(Math.abs(o2)<.01&&onSegment(a,b,d))||(Math.abs(o3)<.01&&onSegment(c,d,a))||(Math.abs(o4)<.01&&onSegment(c,d,b));
  }
  function lineCrossesUnit(a,b,u){
    const poly=u?u._losPolygon:null;
    if(!poly)return false;
    for(let i=0;i<poly.length;i++)if(segmentsIntersect(a,b,poly[i],poly[(i+1)%poly.length]))return true;
    return false;
  }
  function unitFootprint(u) {
    const q=shape(u);
    if(u.models>0)return corners(u);
    const x=u.x*W(),y=u.y*H(),c=Math.cos(u.facing||0),sn=Math.sin(u.facing||0),hw=q.baseDepth/2,hh=q.baseWidth/2;
    return [[-hw,-hh],[hw,-hh],[hw,hh],[-hw,hh]].map(([lx,ly])=>({x:x+lx*c-ly*sn,y:y+lx*sn+ly*c}));
  }
  function getShotVisibility(u,target,rankLimit) {
    const shooters=modelCentres(u,rankLimit),targets=modelCentres(target);
    const blockers=units().filter(v=>v!==u&&v.id!==u.attachedTo&&v!==target&&!v.attachedTo&&alive(v)&&!v.fled&&v.deployed!==false);
    // Unit footprints are oriented rectangles, computed from the same formation geometry used by movement.
    blockers.forEach(v=>{v._losPolygon=unitFootprint(v);});
    const candidates=blockers.map(v=>({u:v}));
    const visible=[];
    let anyOver=false,visibleChampion=false;
    for(const shooter of shooters){
      let best=null;
      for(const aim of targets){
        let over=0,blocked=false;
        for(const block of candidates){
          // Corners are supplied by the movement system on each unit for this visibility check.
          const poly=block.u._losPolygon;
          if(!poly)continue;
          if(lineCrossesUnit(shooter,aim,block.u)){
            if(block.u.side!==u.side||!Number.isFinite(u.overUnitPenalty)){blocked=true;break;}
            over++;
          }
        }
        if(!blocked&&(!best||over<best.over))best={over};
        if(best&&best.over===0)break;
      }
      if(best){visible.push(shooter);if(shooter.champion)visibleChampion=true;if(best.over>0)anyOver=true;}
    }
    return {visibleModels:visible.length,visibleChampion,overUnitPenalty:anyOver?(u.overUnitPenalty||0):0};
  }
  function shoot(u,target,standShoot) {
    const host=u.attachedTo?S.units[u.attachedTo]:null;
    if(!alive(u)||!alive(target)||!u.hasRangedWeapon||u.shot||u.engaged||host?.engaged||target.engaged)return false;
    const distance=dist(u,target),range=u.range||BOW_RANGE;
    if(distance>range||(standShoot&&distance<=4))return false;
    // Build the actual rectangular unit footprints used for obstruction checks.
    const all=units().filter(v=>!v.attachedTo&&alive(v)&&v.deployed!==false);
    for(const v of all)v._losPolygon=unitFootprint(v);
    const rankLimit=Math.max(1,u.ranksToShoot||1);
    const visibility=getShotVisibility(u,target,rankLimit);
    all.forEach(v=>{delete v._losPolygon;delete v._losCorners;});
    if(!visibility.visibleModels){say(u.name+" cannot shoot "+target.name+": no eligible models have line of sight.");return false;}
    const context={
      longRange:distance>range/2,moved:!!u.moved,elvenArchery:!!u.elvenArchery,standShoot,distance,
      targetCharging:!!target.charged,largeTarget:!!target.largeTarget,
      singleCharacter:!!target.isCharacter||!!target.singleCharacter||(target.models<=0&&(target.attachedCharacters||[]).some(id=>S.units[id]&&S.units[id].models>0)),
      skirmisher:!!target.skirmisher,cover:target.cover==="soft"||target.cover==="hard"?target.cover:null,
      overUnitPenalty:visibility.overUnitPenalty,longRangePenalty:u.rangedWeapon==="firearm"?2:1,
      armourPiercing:u.armourPiercing||0,attackingModels:visibility.visibleModels,attackingChampion:visibility.visibleChampion
    };
    const result=shootingAttack(u,target,context);Object.assign(result,context);
    result.hitModifier=result.pools.length?result.pools[0].hitModifier:0;
    u.shot=true;showAttack(standShoot?"Stand and shoot":"Shooting",u,target,result,"shoot");
    const killed=applyDamage(target,result.wounds,true,result.cascadePlan);
    say(target.name+" loses "+killed+" model"+(killed===1?"":"s")+" to shooting.");
    if(!alive(target))panicNearby?.(target,"a friendly unit is destroyed by shooting");
    if(!standShoot)panicTest(target);
    return true;
  }
  return {shoot};
}
