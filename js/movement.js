export function createMovement({ W, H, PX_PER_IN, MODEL_BASE_IN, BATTLEFIELD_WIDTH_IN, fieldHeightIn, units, alive }) {
  const dist=(a,b)=>Math.hypot((a.x-b.x)*BATTLEFIELD_WIDTH_IN,(a.y-b.y)*fieldHeightIn());
  function shape(u){const files=5,ranks=Math.max(1,Math.ceil(u.models/files)),base=MODEL_BASE_IN*PX_PER_IN();return {files,ranks,base,front:files*base,depth:ranks*base};}
function corners(u,x=u.x,y=u.y,f=u.facing){const q=shape(u),fx=Math.cos(f),fy=Math.sin(f),lx=-fy,ly=fx,cx=x*W(),cy=y*H(),front=q.front/2,depth=q.depth/2;return [{x:cx-fx*depth-lx*front,y:cy-fy*depth-ly*front},{x:cx+fx*depth-lx*front,y:cy+fy*depth-ly*front},{x:cx+fx*depth+lx*front,y:cy+fy*depth+ly*front},{x:cx-fx*depth+lx*front,y:cy-fy*depth+ly*front}];}
function overlap(a,b){for(const poly of [a,b])for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],ax=-(q.y-p.y),ay=q.x-p.x,A=a.map(v=>v.x*ax+v.y*ay),B=b.map(v=>v.x*ax+v.y*ay);if(Math.max(...A)<Math.min(...B)+.01||Math.max(...B)<Math.min(...A)+.01)return false;}return true;}
function canPlace(u,x,y,f){const poly=corners(u,x,y,f),w=W(),h=H();if(poly.some(p=>p.x<1||p.y<1||p.x>w-1||p.y>h-1))return false;return !units().some(v=>v!==u&&alive(v)&&v.deployed!==false&&overlap(poly,corners(v)));}
  return { dist, shape, corners, overlap, canPlace };
}
