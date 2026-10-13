export function createRules({ roll }) {
  function rankBonus(u){return Math.min(3,Math.max(0,Math.floor(u.models/5)-1));}
function hitTarget(attacker,defender){const a=attacker.stats.WS,d=defender.stats.WS;if(a>=d*2)return 3;if(a>d)return 3;if(a===d)return 4;if(a*2<=d)return 5;return 4;}
function woundTarget(s,t){if(s>=t*2)return 2;if(s>t)return 3;if(s===t)return 4;if(s*2<=t)return 6;return 5;}
function saveTarget(defender,strength){const raw=defender.stats.save;if(raw==="-"||raw==null)return null;const t=parseInt(raw,10);return Number.isFinite(t)?t+Math.max(0,strength-3):null;}
function applyDamage(u,wounds,shooting){const before=u.models,total=(u.damage||0)+wounds,killed=Math.floor(total/u.stats.W);u.models=Math.max(0,u.models-killed);u.damage=u.models?total%u.stats.W:0;if(shooting)u.shootCasualties+=before-u.models;return before-u.models;}
function meleeAttack(u,target){const attacks=Math.min(5,u.models)*u.stats.A,hitNeed=hitTarget(u,target),woundNeed=woundTarget(u.stats.S,target.stats.T),saveNeed=saveTarget(target,u.stats.S),hitRolls=roll(attacks),hits=hitRolls.filter(x=>x>=hitNeed).length,woundRolls=roll(hits),woundsBeforeSave=woundRolls.filter(x=>x>=woundNeed).length,saveRolls=saveNeed===null?[]:roll(woundsBeforeSave),saved=saveNeed===null?0:saveRolls.filter(x=>x>=saveNeed).length;return {attacks,hitNeed,hitRolls,hits,woundNeed,woundRolls,woundsBeforeSave,saveNeed,saveRolls,saved,wounds:Math.max(0,woundsBeforeSave-saved)};}
  return { rankBonus, hitTarget, woundTarget, saveTarget, applyDamage, meleeAttack };
}
