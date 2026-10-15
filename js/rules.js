export function createRules({ roll, units = () => [] }) {
  function rankBonus(u) { const width=Math.max(1,Math.floor(u.formationWidth||5)); if(width<4)return 0; const full=Math.floor(u.models/width),remainder=u.models%width; return Math.min(3,Math.max(0,full-1)+(remainder>=4?1:0)); }
  function hitTarget(attacker,defender) { if(attacker>defender)return 3;if(defender>attacker*2)return 5;return 4; }
  function woundTarget(strength,toughness) { if(strength<=0||toughness<=0)return null;if(strength>=toughness*2)return 2;if(strength>toughness)return 3;if(strength===toughness)return 4;if(strength*2>toughness)return 5;if(strength*2===toughness)return 6;return null; }
  function saveTarget(defender,strength,armourPiercing=0) {
    const type=defender.armour||(defender.lightArmour?"light":"none");
    const base=defender.intrinsicArmourSave|| (type==="fullPlate"?4:type==="heavy"?5:type==="light"?6:(defender.shield?7:0));
    if(!base)return null;
    return base+Math.max(0,strength-3)+Math.max(0,armourPiercing)-(defender.shield?1:0)-(defender.mountStats?1:0)-(defender.barding?1:0);
  }
  function shieldFacesAttacker(defender,attacker) {
    if(attacker?.friendlyFireShot)return false;
    if(!defender.shield||!attacker||!Number.isFinite(defender.x)||!Number.isFinite(attacker.x))return false;
    if(defender.skirmishing||(defender.attachedTo&&units().some(u=>u.id===defender.attachedTo&&u.skirmishing)))return true;
    const facingUnit=defender.attachedTo?units().find(u=>u.id===defender.attachedTo)||defender:defender;
    const bearing=Math.atan2(attacker.y-facingUnit.y,attacker.x-facingUnit.x);
    let delta=bearing-(facingUnit.facing||0);
    while(delta>Math.PI)delta-=Math.PI*2;
    while(delta< -Math.PI)delta+=Math.PI*2;
    return Math.abs(delta)<=Math.PI/4;
  }
  function applyDamage(u,wounds,shooting,cascadePlan=null) {
    const before=u.models;
    if(cascadePlan) {
      u.models=Math.max(0,u.models-(cascadePlan.rankFileLost||0));
      u.damage=cascadePlan.rankFileDamage||0;
      if(cascadePlan.championKilled&&u.championAlive!==false){u.championAlive=false;u.championWounds=0;u.models=Math.max(0,u.models-1);}
      for(const item of cascadePlan.characterDamage||[]){if(item.hero){item.hero.characterWounds=Math.max(0,item.remaining);if(item.hero.characterWounds<=0)item.hero.models=0;}}
      if(shooting)u.shootCasualties+=(before-u.models);
      return before-u.models;
    }
    const total=(u.damage||0)+wounds,killed=Math.floor(total/Math.max(1,u.stats.W));
    u.models=Math.max(0,u.models-killed);u.damage=u.models?total%Math.max(1,u.stats.W):0;
    if(shooting)u.shootCasualties+=before-u.models;
    return before-u.models;
  }
  function modelPools(u,mode,context={}) {
    const attackModels=Number.isFinite(context.attackingModels)?Math.max(0,context.attackingModels):u.models;
    const hasChampion=context.attackingChampion!==undefined?!!context.attackingChampion:!!(u.champion&&u.champion.enabled&&u.championAlive!==false&&u.models>0);
    const normalModels=Math.max(0,attackModels-(hasChampion?1:0));
    const rankWidth=Math.max(1,Math.floor(u.formationWidth||5));
    const frontRank=Math.min(rankWidth*(mode==="melee"&&u.spears?(u.spearRanks||2):1),attackModels);
    const normalCount=mode==="melee"?Math.max(0,Math.min(frontRank-(hasChampion?1:0),normalModels)):normalModels;
    const profiles=[];
    const add=(count,stats,label)=>{if(!count)return;const key=mode==="melee"?[stats.WS,stats.S,stats.A].join("/"):[stats.BS,stats.S].join("/");let pool=profiles.find(p=>p.key===key);if(!pool){pool={key,stats,count:0,labels:[]};profiles.push(pool);}pool.count+=count;if(!pool.labels.includes(label))pool.labels.push(label);};
    if(context.attackComponent!=="mount")add(normalCount,mode==="shooting"&&u.hasRangedWeapon?{...u.stats,S:u.rangedStrength||u.stats.S}:{...u.stats},"Rider");
    if(u.mountStats&&mode==="melee"&&context.attackComponent!=="rider")add(attackModels,{...u.mountStats},"Mount");
    if(context.attackComponent!=="mount"&&hasChampion){const overrides=u.champion.stats||{},s={...u.stats,...overrides};if(mode==="melee"&&overrides.A==null)s.A=u.stats.A+((u.champion?.bonus||(u.kind==="archer"||u.hasRangedWeapon?"BS":"A"))==="A"?1:0);if(mode==="shooting"&&overrides.BS==null)s.BS=u.stats.BS+((u.champion?.bonus||(u.kind==="archer"||u.hasRangedWeapon?"BS":"A"))==="BS"?1:0);if(mode==="shooting"&&u.hasRangedWeapon)s.S=u.rangedStrength||u.stats.S;add(1,s,"Champion");}
    return profiles;
  }
  function newVirtual(target) {
    const championAlive=!!(target.champion?.enabled&&target.championAlive!==false&&target.models>0);
    const heroRefs=Object.fromEntries(units().map(h=>[h.id,h]));
    const characters={};
    (target.attachedCharacters||[]).forEach(id=>{const h=heroRefs[id];if(h&&h.models>0)characters[id]=h.characterWounds??h.stats.W;});
    if(target.isCharacter)characters[target.id]=target.characterWounds??target.stats.W;
    return {rankFiles:target.isCharacter?0:Math.max(0,target.models-(championAlive?1:0)),rankFileDamage:target.damage||0,championAlive,championWounds:target.championWounds??target.champion?.stats?.W??target.stats.W,characters,heroRefs,rankFileLost:0,championKilled:false,characterDamage:[]};
  }
  function targetTiers(target,v,attacker,targetComponent=null) {
    const shield=shieldFacesAttacker(target,attacker);
    if(target.isCharacter)return target.delayedDeath?[]:[{kind:"character",id:target.id,hero:target,label:target.name,stats:target.stats,remaining:v.characters[target.id]??0,armour:target.armour,intrinsicArmourSave:target.intrinsicArmourSave,shield,wardSave:target.wardSave,wardSaveFrontOnly:target.wardSaveFrontOnly}];
    const tiers=[];
    if(!target.delayedDeath&&v.rankFiles>0)tiers.push({kind:target.isDragon?"dragon":"rankFile",id:target.id,label:target.name,stats:target.stats,remaining:v.rankFiles,armour:target.armour,intrinsicArmourSave:target.intrinsicArmourSave,shield,wardSave:target.wardSave,wardSaveFrontOnly:target.wardSaveFrontOnly});
    if(!target.delayedDeath&&v.championAlive)tiers.push({kind:"champion",label:"Champion",stats:{...target.stats,...(target.champion?.stats||{})},remaining:v.championWounds,armour:target.armour,shield,wardSave:target.wardSave,wardSaveFrontOnly:target.wardSaveFrontOnly});
    for(const id of (target.attachedCharacters||[])){const hero=v.heroRefs[id];if(hero&&!hero.delayedDeath&&hero.models>0&&v.characters[id]>0)tiers.push({kind:"character",id,hero,label:hero.name,stats:hero.stats,remaining:v.characters[id],armour:hero.armour,intrinsicArmourSave:hero.intrinsicArmourSave,shield:shieldFacesAttacker(hero,attacker),wardSave:hero.wardSave,wardSaveFrontOnly:hero.wardSaveFrontOnly});}
    if(target.isDragon&&targetComponent==="rider"){const i=tiers.findIndex(t=>t.kind==="character");if(i<0)return [];if(i>0)tiers.unshift(tiers.splice(i,1)[0]);}
    if(target.isDragon&&targetComponent==="dragon"&&!tiers.some(t=>t.kind==="dragon"))return [];
    return tiers;
  }
  function rollPool(attackerPool,target,mode,context,v) {
    const attackCount=attackerPool.count*(context.attacksPerModel??(mode==="melee"?attackerPool.stats.A:(context.attacker?.rangedUsesUserStats?attackerPool.stats.A:1))),groups=new Map();
    const groupFor=tier=>{const key=tier.kind+":"+tier.id;let g=groups.get(key);if(!g){g={label:attackerPool.labels.join(" / "),targetLabel:tier.label,attacks:0,hitNeed:7,hitRolls:[],hitPasses:[],hitRerolls:[],hitRerollPasses:[],hitFollowUps:[],hitFollowUpPasses:[],hits:0,woundNeed:null,woundRolls:[],woundsBeforeSave:0,saveNeed:null,saveRolls:[],saved:0,wardNeed:null,wardRolls:[],wardSaved:0,wounds:0,WS:attackerPool.stats.WS,S:attackerPool.stats.S,A:attackerPool.stats.A,BS:attackerPool.stats.BS};groups.set(key,g);}return g;};
    for(let i=0;i<attackCount;i++){
      const tiers=targetTiers(target,v,context.attacker,context.targetComponent);if(!tiers.length)break;
      let tier=tiers[0],g=groupFor(tier);g.attacks++;
      const logKeys=["hitRolls","hitPasses","hitRerolls","hitRerollPasses","hitFollowUps","hitFollowUpPasses"],logStarts=Object.fromEntries(logKeys.map(key=>[key,g[key].length]));
      let hitNeed;
      if(mode==="melee")hitNeed=hitTarget(attackerPool.stats.WS,tier.stats.WS);
      else {
        const bs=Math.min(attackerPool.stats.BS,context.attacker?.bsCap||99);
        const longRangePenalty=context.longRange?(context.longRangePenalty||1):0;
        const movePenalty=context.moved?1:0;
        const overPenalty=Math.max(0,context.overUnitPenalty||0);
        const reducible=longRangePenalty+movePenalty+overPenalty;
        const elfReduction=context.elvenArchery?Math.min(2,reducible):0;
        const coverPenalty=(context.cover==="soft"?1:context.cover==="hard"?2:0)+(context.cover?(context.coverHitPenaltyBonus||0):0);
        const mods=-(longRangePenalty+movePenalty+overPenalty-elfReduction)-(context.wallPenalty||0)-(context.standShoot?1:0)-(context.targetCharging?1:0)-((context.singleCharacter||context.skirmisher)?1:0)-(context.targetInMelee&&!context.overUnitPenalty?1:0)-coverPenalty+(context.largeTarget?1:0);
        hitNeed=7-bs-mods;
      }
      g.hitNeed=hitNeed;const forcedHit=mode==="shooting"&&i<(context.forcedHits||0);const hit=forcedHit?null:roll(1)[0];if(hit!==null)g.hitRolls.push(hit);
      let hitPass=forcedHit,follow=null;
      if(!forcedHit){if(mode==="melee")hitPass=context.onlySixes?hit===6:hit!==1&&(hit===6||hit>=hitNeed);
      else if(hit!==1){if(hitNeed<=6)hitPass=hit>=hitNeed;else if(hitNeed<10&&hit===6){follow=roll(1)[0];hitPass=follow>=hitNeed-3;}}}
      if(follow!==null){g.hitFollowUps.push(follow);g.hitFollowUpPasses.push(hitPass);}
      g.hitPasses.push(hitPass);
      const rerollNaturalOne=!forcedHit&&hit===1&&((mode==="melee"&&context.rerollOnesMelee)||(mode==="shooting"&&context.rerollOnesShooting));
      if(rerollNaturalOne){const reroll=roll(1)[0];let pass=mode==="melee"?(context.onlySixes?reroll===6:reroll!==1&&(reroll===6||reroll>=hitNeed)):(reroll!==1&&(hitNeed<=6?reroll>=hitNeed:(hitNeed<10&&reroll===6&&roll(1)[0]>=hitNeed-3)));g.hitRerolls.push(reroll);g.hitRerollPasses.push(pass);if(pass)hitPass=true;}
      if(!hitPass&&mode==="melee"&&context.rerollMisses){const reroll=roll(1)[0],rerollPass=context.onlySixes?reroll===6:reroll!==1&&(reroll===6||reroll>=hitNeed);g.hitRerolls.push(reroll);g.hitRerollPasses.push(rerollPass);if(rerollPass)hitPass=true;}
      if(!hitPass)continue;
      if(mode==="shooting"&&target.isDragon&&tiers.length>1&&roll(1)[0]<=2){
        const oldGroup=g;tier=tiers[1];g=groupFor(tier);oldGroup.attacks--;g.attacks++;
        for(const key of logKeys)g[key].push(...oldGroup[key].splice(logStarts[key]));
        g.hitNeed=hitNeed;
      }
      g.hits++;
      const woundNeed=woundTarget(attackerPool.stats.S,tier.stats.T);g.woundNeed=woundNeed;if(woundNeed===null)continue;
      const wr=roll(1)[0];g.woundRolls.push(wr);if(wr<woundNeed)continue;g.woundsBeforeSave++;
      const saveNeed=mode==="melee"&&context.attackComponent!=="mount"&&context.attacker?.ignoreArmourSaves?null:saveTarget(tier,attackerPool.stats.S,mode==="shooting"?(context.armourPiercing||0):0);g.saveNeed=saveNeed;let saved=false;
      if(saveNeed!==null&&saveNeed<=6){const sr=roll(1)[0];g.saveRolls.push(sr);saved=sr!==1&&sr>=saveNeed;}
      if(!saved&&tier.wardSave&&(!tier.wardSaveFrontOnly||tier.shield)){const wn=parseInt(tier.wardSave,10);g.wardNeed=wn;if(Number.isFinite(wn)){const wrd=roll(1)[0];g.wardRolls.push(wrd);if(wrd!==1&&wrd>=wn){g.wardSaved++;saved=true;}}}
      if(saved){g.saved++;continue;}g.wounds++;
      if(tier.kind==="rankFile"||tier.kind==="dragon"){v.rankFileDamage++;if(v.rankFileDamage>=Math.max(1,tier.stats.W)){v.rankFileDamage=0;v.rankFiles--;v.rankFileLost++;}}
      else if(tier.kind==="champion"){v.championWounds--;if(v.championWounds<=0){v.championAlive=false;v.championKilled=true;}}
      else {v.characters[tier.id]--;const old=v.characterDamage.find(x=>x.id===tier.id);if(old){old.remaining=v.characters[tier.id];old.wounds++;}else v.characterDamage.push({id:tier.id,hero:tier.hero,remaining:v.characters[tier.id],wounds:1});}
    }
    return [...groups.values()];
  }
  function attack(u,target,mode,context={}) {
    const v=newVirtual(target),pools=[];
    const charging=!!context.charging, isRider=context.attackComponent!=="mount";
    const dualBonus=mode==="melee"&&u.dualWield&&isRider?1:0;
    const weapons=u.meleeWeapons||[u.weapon||"handWeapon"];
    const hasMagicSword=mode==="melee"&&isRider&&(u.weapon==="magicSword"||weapons.includes("magicSword"));
    const lesserWeapon=weapons.find(w=>w!=="magicSword"&&["handWeapon","offhandWeapon"].includes(w));
    const plans=hasMagicSword&&lesserWeapon
      ?[{weapon:lesserWeapon,attacksPerModel:1},{weapon:"magicSword",attacksPerModel:u.stats.A+dualBonus}]
      :[{weapon:u.weapon||"handWeapon",attacksPerModel:null}];
    for(const plan of plans){
      const weapon=plan.weapon;
      const strengthBonus=context.attackComponent==="mount"?0:(weapon==="greatWeapon"?2:weapon==="halberd"?1:(charging&&weapon==="lance"?2:charging&&weapon==="spear"?1:0));
      const magicSword=weapon==="magicSword"&&isRider;
      const attacker={...u,weapon,stats:{...u.stats,WS:u.stats.WS+(charging&&u.magicalLance&&weapon==="lance"?1:0),S:u.stats.S+strengthBonus+(magicSword?1:0),A:u.stats.A+(magicSword?1:0)+dualBonus}};
      const attackContext={...context,attacker,attacksPerModel:plan.attacksPerModel,rerollOnesMelee:!!u.skills?.rerollOnesMelee,rerollOnesShooting:!!u.skills?.rerollOnesShooting};
      for(const attackerPool of modelPools(attacker,mode,attackContext))pools.push(...rollPool(attackerPool,target,mode,attackContext,v));
    }
    const sum=k=>pools.reduce((n,p)=>n+(p[k]||0),0);
    return {attacks:sum("attacks"),hitNeed:pools[0]?.hitNeed??7,hitRolls:pools.flatMap(p=>p.hitRolls),hitPasses:pools.flatMap(p=>p.hitPasses),hitFollowUps:pools.flatMap(p=>p.hitFollowUps),hitFollowUpPasses:pools.flatMap(p=>p.hitFollowUpPasses),hits:sum("hits"),woundNeed:pools[0]?.woundNeed??null,woundRolls:pools.flatMap(p=>p.woundRolls),woundsBeforeSave:sum("woundsBeforeSave"),saveNeed:pools.every(p=>p.saveNeed==null)?null:pools[0]?.saveNeed,saveRolls:pools.flatMap(p=>p.saveRolls),saved:sum("saved"),wardSaved:sum("wardSaved"),wounds:sum("wounds"),pools,cascadePlan:{rankFileLost:v.rankFileLost,rankFileDamage:v.rankFileDamage,championKilled:v.championKilled,characterDamage:v.characterDamage}};
  }
  function meleeAttack(u,target,context={}) { return attack(u,target,"melee",context); }
  function shootingAttack(u,target,context={}) { return attack(u,target,"shooting",context); }
  return {rankBonus,hitTarget,woundTarget,saveTarget,applyDamage,meleeAttack,shootingAttack};
}
