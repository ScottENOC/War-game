export function pointSegmentDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,l2=dx*dx+dy*dy;if(!l2)return Math.hypot(p.x-a.x,p.y-a.y);const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l2));return Math.hypot(p.x-(a.x+t*dx),p.y-(a.y+t*dy));}
export function segmentsIntersect(a,b,c,d){const cross=(p,q,r)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x),on=(p,q,r)=>r.x>=Math.min(p.x,q.x)-.01&&r.x<=Math.max(p.x,q.x)+.01&&r.y>=Math.min(p.y,q.y)-.01&&r.y<=Math.max(p.y,q.y)+.01;const x1=cross(a,b,c),x2=cross(a,b,d),x3=cross(c,d,a),x4=cross(c,d,b);return ((x1>0&&x2<0)||(x1<0&&x2>0))&&((x3>0&&x4<0)||(x3<0&&x4>0))||(Math.abs(x1)<.01&&on(a,b,c))||(Math.abs(x2)<.01&&on(a,b,d))||(Math.abs(x3)<.01&&on(c,d,a))||(Math.abs(x4)<.01&&on(c,d,b));}
export function generatedElevation(feature,x,y){const seed=Number(feature?.seed)||1,phaseA=(seed%997)/997*Math.PI*2,phaseB=(Math.floor(seed/7)%991)/991*Math.PI*2,phaseC=(Math.floor(seed/13)%983)/983*Math.PI*2;return 2.05+1.05*Math.sin((x*1.35+phaseA)*Math.PI*2)*Math.cos((y*1.1+phaseB)*Math.PI*2)+.68*Math.sin((x*2.15+y*1.65+phaseC)*Math.PI*2)+.34*Math.cos((x*3.2-y*2.7+phaseB)*Math.PI*2);}
export function terrainIsWater(terrain,x,y,W,H){const px=x/W,py=y/H;for(const o of terrain||[]){if(o.type==="lake"&&(((px-o.x)/(o.rx||.03))**2+((py-o.y)/(o.ry||.03))**2<=1))return true;if(o.type==="river"&&pointSegmentDistance({x,y},{x:o.x1*W,y:o.y1*H},{x:o.x2*W,y:o.y2*H})<=(o.widthIn||1.5)*W/48/2)return true;}const auto=(terrain||[]).find(o=>o.type==="autoTerrain");return !!auto&&generatedElevation(auto,px,py)<.48;}
export function terrainMovementCost(terrain,x1,y1,x2,y2,W,H,battlefieldWidthIn,fieldHeightIn){const dx=(x2-x1)*battlefieldWidthIn,dy=(y2-y1)*fieldHeightIn,length=Math.hypot(dx,dy);if(!length)return 0;const samples=Math.max(12,Math.ceil(length*5));let water=0;for(let i=1;i<=samples;i++){const t=i/samples,x=(x1+(x2-x1)*t)*W,y=(y1+(y2-y1)*t)*H;if(terrainIsWater(terrain,x,y,W,H))water++;}return length*(1+water/samples);}
export function terrainElevationAt(terrain,x,y,W,H){const auto=(terrain||[]).find(f=>f.type==="autoTerrain");return auto?generatedElevation(auto,x/W,y/H):0;}
export function generateSkirmishTerrain(seed=Date.now(),battleType="skirmish"){
  const terrainSeed=Number(seed)||1,terrain=[{type:"autoTerrain",seed:terrainSeed}];
  if(battleType==="siege"){
    const left=.29,right=.71,top=.22,bottom=.78,gateHalf=.055;
    const wall=(x1,y1,x2,y2,side)=>({type:"wall",x1,y1,x2,y2,side,widthIn:60/25.4,heightIn:5,toughness:10,wounds:10,maxWounds:10,siegeOnly:true,castle:true});
    const gate=(x1,y1,x2,y2,side)=>({type:"gate",x1,y1,x2,y2,side,widthIn:60/25.4,heightIn:4,toughness:8,wounds:6,maxWounds:6,siegeOnly:true,castle:true});
    terrain.push(wall(left,top,right,top,"north"));
    terrain.push(wall(right,top,right,bottom,"east"));
    terrain.push(wall(right,bottom,left,bottom,"south"));
    terrain.push(wall(left,bottom,left,.5+gateHalf,"west-south"),gate(left,.5+gateHalf,left,.5-gateHalf,"west-gate"),wall(left,.5-gateHalf,left,top,"west-north"));
    terrain.push({type:"stairs",x:.34,y:.36,inside:true,label:"North-west stairway"},{type:"stairs",x:.66,y:.64,inside:true,label:"South-east stairway"});
    terrain.push({type:"siegeCastle",left,right,top,bottom});
    return terrain;
  }
  let state=(terrainSeed>>>0)||1;
  const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  const wallCount=3+Math.floor(random()*2);
  for(let i=0;i<wallCount;i++){
    const cx=.31+random()*.38,cy=.16+random()*.68,angle=(random()-.5)*Math.PI*.72,length=.105+random()*.075;
    const dx=Math.cos(angle)*length/2,dy=Math.sin(angle)*length/2;
    terrain.push({type:"wall",x1:Math.max(.12,cx-dx),y1:Math.max(.08,cy-dy),x2:Math.min(.88,cx+dx),y2:Math.min(.92,cy+dy),widthIn:.38,heightIn:1.5,toughness:7,wounds:2,maxWounds:2,siegeOnly:true,generated:true});
  }
  return terrain;
}
export function terrainRangeModifier(terrain,shooter,target,W,H){const a=terrainElevationAt(terrain,shooter.x*W,shooter.y*H,W,H)+(shooter.wallLevel?2:0),b=terrainElevationAt(terrain,target.x*W,target.y*H,W,H)+(target.wallLevel?2:0);return Math.max(-4,Math.min(4,Math.round((a-b)*10)/10));}
export function terrainShotEffect(terrain,shooter,target,weapon,W,H,battlefieldWidthIn,fieldHeightIn,arcHeightIn=0,shooterAltitudeIn=0,targetAltitudeIn=0){const a={x:shooter.x*W,y:shooter.y*H},b={x:target.x*W,y:target.y*H},start=terrainElevationAt(terrain,a.x,a.y,W,H)+(shooter.heightIn||1.7)*.75+shooterAltitudeIn,end=terrainElevationAt(terrain,b.x,b.y,W,H)+(target.heightIn||1.7)*.75+targetAltitudeIn;const lineClear=arc=>{const steps=Math.max(40,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/8));for(let i=1;i<steps;i++){const p=i/steps,x=a.x+(b.x-a.x)*p,y=a.y+(b.y-a.y)*p,z=start+(end-start)*p+arc*Math.sin(Math.PI*p);if(z<=terrainElevationAt(terrain,x,y,W,H)+.02)return false;}for(const wall of (terrain||[]).filter(f=>(f.type==="wall"||f.type==="gate")&&(f.wounds??2)>0&&!(shooter.wallLevel&&shooter.wallSegment===f)&&!(target.wallLevel&&target.wallSegment===f))){if((shooter.wallDefence?.wall===wall&&shooter.wallDefence.posture==="active")||(target.wallDefence?.wall===wall))continue;const c={x:wall.x1*W,y:wall.y1*H},d={x:wall.x2*W,y:wall.y2*H};if(!segmentsIntersect(a,b,c,d))continue;const dx=b.x-a.x,dy=b.y-a.y,den=dx*(d.y-c.y)-dy*(d.x-c.x);if(Math.abs(den)<.001)continue;const p=((c.x-a.x)*(d.y-c.y)-(c.y-a.y)*(d.x-c.x))/den,z=start+(end-start)*p+arc*Math.sin(Math.PI*p);if(z<terrainElevationAt(terrain,a.x+dx*p,a.y+dy*p,W,H)+(wall.heightIn||1.5))return false;}return true;};const directClear=lineClear(0);if(directClear)return {penalty:0,blocked:false,directClear:true,arcUsed:false};const arcClear=(weapon==="bow"||weapon==="crossbow")&&arcHeightIn>0&&lineClear(arcHeightIn);return {penalty:arcClear?(weapon==="crossbow"?2:1):0,blocked:!arcClear,directClear:false,arcUsed:!!arcClear};}