export function createCombat({ S, units, alive, dist, meleeAttack, applyDamage, rankBonus, roll, say, diceStack, render, endTurn, finishBattle, reformCombatPairs, pursueAfterBreak, panicNearby, leadership = u => u.stats.Ld }) {
  const linked = u => {
    const ids = Array.isArray(u.engagedWithIds) ? u.engagedWithIds : (u.engagedWith ? [u.engagedWith] : []);
    return [...new Set(ids)].map(id => S.units[id]).filter(v => v && v !== u && alive(v) && v.engaged && !v.fled && !!v.wallLevel===!!u.wallLevel);
  };
  const addLink = (u,v) => {
    u.engagedWithIds = [...new Set([...(u.engagedWithIds || (u.engagedWith ? [u.engagedWith] : [])), v.id])];
    v.engagedWithIds = [...new Set([...(v.engagedWithIds || (v.engagedWith ? [v.engagedWith] : [])), u.id])];
    u.engagedWith = u.engagedWithIds[0] || null;
    v.engagedWith = v.engagedWithIds[0] || null;
    u.engaged = v.engaged = true;
  };
  function groupsOfCombat() {
    const engaged=units().filter(u=>u.engaged&&alive(u)&&!u.fled),seen=new Set(),groups=[];
    engaged.forEach(start=>{if(seen.has(start.id))return;const group=[],stack=[start];seen.add(start.id);while(stack.length){const u=stack.pop();group.push(u);linked(u).forEach(v=>{if(!seen.has(v.id)){seen.add(v.id);stack.push(v);}});}if(group.some(u=>linked(u).length))groups.push(group);});
    return groups;
  }
  function combatantAlive(u) { return !!u && (u.models > 0 || (u.isChariot && u.chariotWounds > 0)) && !u.fled; }
  function combatUnitStrength(u){if(!u)return 0;if(u.isChariot&&u.chariotWounds<=0)return Math.max(0,u.models||0);if(Number.isFinite(u.unitStrength))return u.unitStrength;if(u.isDragon||u.isDragonRider)return 6;if(u.isCavalry)return Math.max(0,u.models)*2;return Math.max(0,u.models||0);}
  function captureFighter(u, host=u, component="rider") {
    const champion = !!(u.champion?.enabled && u.championAlive !== false && u.models > 0);
    const rankWidth=Math.max(1,Math.floor(u.formationWidth||5));
    const eligibleModels = u.isCharacter ? 1 : u.isChariot ? (component==="mount"?1:Math.max(0,u.models)) : Math.min(rankWidth*(u.spears&&!host.charged?(u.spearRanks||2):1),u.models);
    return { models:u.models, damage:u.damage||0, championAlive:u.championAlive, championWounds:u.championWounds, characterWounds:u.characterWounds, eligibleModels, eligibleChampion:champion, skirmishRound:u.skirmishCombatRound===S.combatRound };
  }
  function resolveCombat(){
    S.combatResolved=false;
    const groups=groupsOfCombat();
    if(!groups.length){say("No units are in melee.");endTurn();return;}
    S.combatRound++;
    const tests=[];
    groups.forEach(group=>{
      const startModels=new Map(group.map(u=>[u.id,u.models]));
      const startRanks=new Map(group.map(u=>[u.id,u.skirmishCombatRound===S.combatRound?0:rankBonus(u)]));
      const wounds=new Map(group.map(u=>[u.id,0]));
      group.filter(u=>u.isChariot&&u.charged&&!u.defendedWallCombat&&u.chariotWounds>0&&u.impactResolvedRound!==S.combatRound).forEach(chariot=>{const targets=linked(chariot).filter(v=>v.side!==chariot.side&&alive(v)&&!v.fled);if(!targets.length)return;const target=targets.sort((a,b)=>dist(chariot,a)-dist(chariot,b))[0],hits=roll(1)[0]+Math.max(0,(chariot.chariotImpactHits||1)-1),proxy={...chariot,stats:{...chariot.stats,S:chariot.chariotImpactStrength||4,A:hits},weapon:"handWeapon",meleeWeapons:["handWeapon"],mountStats:null,isChariot:false,isCavalry:false};chariot.impactResolvedRound=S.combatRound;const result=meleeAttack(proxy,target,{attackingModels:1,automaticHits:hits,charging:true,impactHits:true});applyDamage(target,result.wounds,false,result.cascadePlan);wounds.set(chariot.id,(wounds.get(chariot.id)||0)+result.wounds);say("<b>Impact hits — "+chariot.name+"</b>: "+hits+" automatic Strength "+proxy.stats.S+" hit(s) against "+target.name+"; "+result.wounds+" wound(s) after saves.");});
      const attachedCombatants=group.flatMap(host=>(host.attachedCharacters||[]).map(id=>({u:S.units[id],host})).filter(x=>x.u&&alive(x.u)&&!x.u.fled));
      const effectiveI=(u,host=u,component="rider")=>{
        const targetHasBracedSpears=linked(host).some(v=>v.spears&&!v.charged&&!v.defendedWallCombat&&v.side!==host.side);
        const chargeBonus=host.charged&&!host.defendedWallCombat&&!targetHasBracedSpears?10:0;
        // Rider and mount are separate combatants: only the rider uses their
        // weapon and racial Initiative modifiers.
        if(component==="mount")return (u.mountStats?.I??0)+chargeBonus;
        // Always Strikes First contributes +10 Initiative, but does not override
        // the final modified Initiative (for example, a charging enemy can act first).
        return u.stats.I-(u.weapon==="greatWeapon"?10:0)+chargeBonus+(u.alwaysStrikesFirst?10:0);
      };
      const combatants=[];
      group.forEach(host=>{
        if(alive(host)&&!host.fled){if(!host.isChariot||host.models>0)combatants.push({u:host,host,component:"rider"});if(host.mountStats&&(!host.isChariot||host.chariotWounds>0))combatants.push({u:host,host,component:"mount"});}
        (host.attachedCharacters||[]).forEach(id=>{const hero=S.units[id];if(hero&&alive(hero)&&!hero.fled){combatants.push({u:hero,host,component:"rider"});if(hero.mountStats)combatants.push({u:hero,host,component:"mount"});}});
      });
      const keyOf=c=>c.u.id+":"+c.component;
      const snapshots=new Map(combatants.map(c=>[keyOf(c),captureFighter(c.u,c.host,c.component)]));
      const attackedPackets=new Set();
      const levels=[...new Set(combatants.map(c=>effectiveI(c.u,c.host,c.component)))].sort((a,b)=>b-a);
      levels.forEach(initiative=>{
        const shownInitiative=initiative;
        const attackers=combatants.filter(c=>(alive(c.host)||c.host.delayedDeath)&&!c.host.fled&&!(c.u.isGiant&&c.u.fallen&&c.u.fallenTurn===S.turn)&&effectiveI(c.u,c.host,c.component)===initiative);
        // Entitlements and snapshots span every Initiative level. A rider dying
        // before their mount acts must not erase the mount's separate attack.
        const pending=new Map(attackers.map(c=>[keyOf(c),{snapshot:snapshots.get(keyOf(c)),attacked:attackedPackets.has(keyOf(c))}]));
        attackers.forEach(({u,host,component})=>{
          const key=u.id+":"+component,entitlement=pending.get(key);
          if(!entitlement||entitlement.attacked||u.fled||(!alive(host)&&!u.delayedDeath)||(!combatantAlive(u)&&!u.delayedDeath))return;
          const strikeState=u.delayedDeath?(u.delayedDeathSnapshot||entitlement.snapshot):entitlement.snapshot;
          if(!combatantAlive(u)&&!u.delayedDeath)return;
          const targets=linked(host).filter(v=>alive(v)&&!v.fled&&!v.delayedDeath);
          if(!targets.length){
            if(u.delayedDeath&&component==="rider"){u.models=0;u.characterWounds=0;u.delayedDeath=false;u.delayedDeathSnapshot=null;}
            entitlement.attacked=true;attackedPackets.add(key);
            if(u.delayedDeath&&!combatants.some(c=>c.u===u&&!attackedPackets.has(keyOf(c)))){u.models=0;u.damage=0;u.characterWounds=0;u.championAlive=false;u.delayedDeath=false;u.delayedDeathSnapshot=null;say(u.name+' succumbs after its final attack.');}
            return;
          }
          const target=targets.sort((a,b)=>dist(host,a)-dist(host,b))[0];
          const before=new Map(combatants.filter(c=>!attackedPackets.has(keyOf(c))).map(c=>[keyOf(c),{...c,wasAlive:combatantAlive(c.u),snapshot:snapshots.get(keyOf(c))}]));
          const attackerI=effectiveI(u,host,component);
          const targetCombatant=combatants.find(c=>c.u===target&&c.component==="rider");
          const targetI=targetCombatant
            ?effectiveI(targetCombatant.u,targetCombatant.host,targetCombatant.component)
            :effectiveI(target);
          // ASF grants +10 Initiative. Reroll misses only when the rider
          // would still have struck first without that bonus, i.e. the final
          // modified Initiative gap (including ASF) is at least 11.
          const rerollMisses=component==="rider"&&!!u.alwaysStrikesFirst&&attackerI-targetI>=11;
          const attackModels=strikeState.skirmishRound?Math.min(strikeState.eligibleModels,Math.max(1,Math.floor(u.formationWidth||5))):strikeState.eligibleModels;
          const attackContext={attackingModels:attackModels,attackingChampion:strikeState.eligibleChampion,charging:!!host.charged&&!host.defendedWallCombat&&!linked(host).some(v=>v.spears&&!v.charged&&v.side!==host.side),attackComponent:component,rerollMisses,onlySixes:!!(host.failedFearAgainst===target.id&&host.failedFearCombatRound===S.combatRound),targetComponent:target.isDragon?(S.targetComponentByUnit?.[target.id]||"dragon"):undefined};
          let result,specialLog="";
          if(u.isTroll&&u.trollVomitSelected&&component!=="mount"){
            const vomit={...u,weapon:"handWeapon",meleeWeapons:["handWeapon"],ignoreArmourSaves:true,stats:{...u.stats,S:5,A:1}};
            result=meleeAttack(vomit,target,{...attackContext,attacker:vomit,attackingModels:attackModels,attackingChampion:false,automaticHits:attackModels});
            specialLog="<b>Troll Vomit — "+u.name+" attacks "+target.name+"</b>: "+attackModels+" automatic Strength 5 hit(s), no armour saves.";
          }else if(u.isGiant&&component!=="mount"){
            const rollD6=()=>roll(1)[0],bigTarget=!!(target.isGiant||target.isTroll||target.isDragon||target.isChariot||target.stats.W>=3);
            const special=rollD6(),proxy={...u,weapon:"handWeapon",meleeWeapons:["handWeapon"],stats:{...u.stats,S:6,A:1}};
            if(bigTarget&&special>=2&&special<=4){
              const initiativeRoll=rollD6();
              if(initiativeRoll>(target.stats.I||0)){const wounds=roll(2).reduce((n,x)=>n+x,0);result={wounds,attacks:1,hits:1,pools:[],cascadePlan:null};specialLog="<b>Giant Thump With Club</b>: "+target.name+" fails Initiative ("+initiativeRoll+" vs I"+target.stats.I+"); "+wounds+" wounds, no armour saves.";}
              else {result={wounds:0,attacks:1,hits:0,pools:[],cascadePlan:null};specialLog="<b>Giant Thump With Club</b>: "+target.name+" avoids the blow with an Initiative test ("+initiativeRoll+").";}
            }else if(bigTarget&&special>=5){
              result={wounds:1,attacks:1,hits:1,pools:[],cascadePlan:null};target.stunnedUntilRound=S.combatRound+1;specialLog="<b>Giant 'Eadbutt</b>: "+target.name+" suffers one unsaved wound and is dazed.";
            }else if(!bigTarget&&special===3){
              const pick=rollD6();
              if(pick===1||pick===4||pick===5){const lost=Math.min(1,target.models||0);target.models=Math.max(0,target.models-lost);if(target.isCharacter)target.characterWounds=0;result={wounds:0,attacks:1,hits:0,pools:[],cascadePlan:null};specialLog="<b>Giant Pick Up And...</b>: "+target.name+" is picked up and removed from the fight (roll "+pick+").";}
              else {result={wounds:1,attacks:1,hits:1,pools:[],cascadePlan:null};specialLog="<b>Giant Pick Up And...</b>: the victim escapes the worst of it but suffers one unsaved wound (roll "+pick+").";}
            }else if(!bigTarget&&special===1){
              result={wounds:0,attacks:0,hits:0,pools:[],cascadePlan:null};u.giantYellAndBawl=true;specialLog="<b>Giant Yell And Bawl</b>: the Giant bellows instead of making a normal attack. (Combat-resolution effect is simplified.)";
            }else{
              let hits=bigTarget?1:(special===2?roll(2).reduce((n,x)=>n+x,0):rollD6());
              if(!bigTarget&&special===2&&rollD6()===1){
                u.fallen=true;u.fallenTurn=S.turn;applyDamage(u,1,false);
                const nearby=units().filter(v=>v!==u&&alive(v)&&dist(u,v)<=3);
                for(const v of nearby)if(rollD6()>=4)applyDamage(v,1+(rollD6()%3),false);
                result={wounds:0,attacks:0,hits:0,pools:[],cascadePlan:null};specialLog="<b>Giant Fall Over</b>: it falls while attempting to Jump Up And Down, injures itself and may crush nearby models.";
              }else{
                const stomp={...proxy,stats:{...proxy.stats,A:hits}};
                result=meleeAttack(stomp,target,{...attackContext,attacker:stomp,attackingModels:1,attackingChampion:false,automaticHits:hits});
                specialLog="<b>Giant special attack</b>: "+(bigTarget?"Thump With Club":"Swing With Club / Jump Up And Down")+" — "+hits+" automatic Strength 6 hit(s).";
              }
            }
          }else result=meleeAttack(u,target,attackContext);
          say(specialLog||('<b>Melee dice — '+u.name+(component==="mount"?" (mount)":"")+' attacks '+target.name+'</b>'+diceStack(u,result)));
          wounds.set(host.id,(wounds.get(host.id)||0)+result.wounds);
          applyDamage(target,result.wounds,false,result.cascadePlan);
          entitlement.attacked=true;attackedPackets.add(key);
          before.forEach(({u:potential,component:potentialComponent,wasAlive,snapshot})=>{
            const potentialKey=potential.id+":"+potentialComponent;
            if(wasAlive&&!combatantAlive(potential)&&!potential.delayedDeath&&!attackedPackets.has(potentialKey)){
              potential.delayedDeath=true;
              potential.delayedDeathSnapshot=snapshot;
              say(potential.name+' suffers a fatal wound; '+(potential.isCharacter?'they':'up to '+snapshot.eligibleModels+' front-rank fighters')+' will strike before dying at Initiative '+shownInitiative+'.');
            }
          });
          const hasUnresolvedPacket=combatants.some(c=>c.u===u&&!attackedPackets.has(keyOf(c)));
          if(u.delayedDeath&&!hasUnresolvedPacket){u.models=0;u.damage=0;u.characterWounds=0;u.championAlive=false;u.delayedDeath=false;u.delayedDeathSnapshot=null;say(u.name+' succumbs after making its final attack.');}
        });
      });
      const sideUnits={player:group.filter(u=>u.side==="player"&&alive(u)),ai:group.filter(u=>u.side==="ai"&&alive(u))};
      if(!sideUnits.player.length||!sideUnits.ai.length)return;
      const sideScore={player:0,ai:0},detail={player:[],ai:[]};
      ["player","ai"].forEach(side=>{
        const own=group.filter(u=>u.side===side),enemy=group.filter(u=>u.side!==side);
        const woundScore=own.reduce((sum,u)=>sum+(wounds.get(u.id)||0),0);
        const rankScore=Math.max(0,...own.map(u=>{
          const suppressed=enemy.some(v=>["left","right","rear"].includes(u.attackedFromSide)&&u.flankedBy===v.id&&(startModels.get(v.id)||0)>=5);
          return suppressed?0:(startRanks.get(u.id)||0);
        }));
        const flankScore=Math.max(0,...own.map(u=>(startModels.get(u.id)||0)>=5?(u.chargedSide==="rear"?2:["left","right"].includes(u.chargedSide)?1:0):0));
        const ownStrength=own.reduce((sum,u)=>sum+(startModels.get(u.id)||0),0),enemyStrength=enemy.reduce((sum,u)=>sum+(startModels.get(u.id)||0),0);
        const outnumber=ownStrength>enemyStrength?1:0;
        sideScore[side]=woundScore+rankScore+flankScore+outnumber;
        detail[side]=[{label:"wounds",value:woundScore},{label:"best rank bonus",value:rankScore},{label:"flank/rear",value:flankScore},{label:"outnumber",value:outnumber}];
      });
      const diff=sideScore.player-sideScore.ai;
      say("Combat resolution (combined melee): Player "+sideScore.player+" (wounds "+detail.player[0].value+", best ranks "+detail.player[1].value+", flank/rear "+detail.player[2].value+", outnumber "+detail.player[3].value+") vs Opponent "+sideScore.ai+" (wounds "+detail.ai[0].value+", best ranks "+detail.ai[1].value+", flank/rear "+detail.ai[2].value+", outnumber "+detail.ai[3].value+").");
      if(diff!==0){const losingSide=diff>0?"ai":"player";group.filter(u=>u.side===losingSide&&alive(u)&&linked(u).length).forEach(loser=>{if(loser.crumbling||loser.undead){const loss=Math.abs(diff);applyDamage(loser,loss,false);say(loser.name+" crumbles: "+loss+" unsaveable wound(s) from losing combat (Undead cannot break).");if(!alive(loser)){loser.engaged=false;loser.engagedWithIds=[];loser.engagedWith=null;}return;}const fearEnemy=linked(loser).find(v=>v.side!==loser.side&&((v.causesFear||v.causesTerror||v.isDragon||v.isDragonRider))&&combatUnitStrength(v)>combatUnitStrength(loser));if(fearEnemy){tests.push({loser,diff:Math.abs(diff),automaticFear:true});say(loser.name+" is defeated and outnumbered by "+fearEnemy.name+"; Fear breaks the unit automatically.");}else tests.push({loser,diff:Math.abs(diff)});});}
    });
    // Undead crumbling is checked each combat phase while the army's General is dead.
    // The turn guard prevents duplicate checks if combat resolution is re-entered.
    S.undeadGeneralCrumbleTurn=S.undeadGeneralCrumbleTurn||{};
    ["player","ai"].forEach(side=>{
      const undead=units().filter(u=>u.side===side&&(u.undead||u.crumbling));
      if(!undead.length||S.undeadGeneralCrumbleTurn[side]===S.turn)return;
      const general=units().find(u=>u.side===side&&u.isGeneral);
      if(!general||alive(general))return;
      S.undeadGeneralCrumbleTurn[side]=S.turn;
      say("The Undead General is dead. Surviving rank-and-file Undead crumble again!");
      undead.filter(u=>!u.isCharacter&&alive(u)).forEach(u=>{
        const dice=roll(2),total=dice[0]+dice[1],ld=leadership(u),loss=Math.max(0,total-ld);
        say(u.name+" tests against Leadership "+ld+" after the General's death: "+dice.join(" + ")+" = "+total+(loss?"; suffers "+loss+" unsaveable crumbling wound(s).":"; holds together."));
        if(loss){applyDamage(u,loss,false);if(!alive(u)){u.engaged=false;u.engagedWithIds=[];u.engagedWith=null;}}
      });
    });
    if(units().filter(alive).filter(u=>u.side==="player").length===0){finishBattle("Opponent wins the battle!");return;}
    if(units().filter(alive).filter(u=>u.side==="ai").length===0){finishBattle("Player wins the battle!");return;}
    if(tests.length){S.breakTests=tests.sort((a,b)=>b.diff-a.diff);nextBreakTest();}
    else{say("Combat drawn; engaged units hold.");reformCombatPairs?.();S.combatResolved=true;render();}
  }
  function hasStubborn(u){if(u.stubborn)return true;return units().some(source=>source!==u&&source.grantsStubbornAura&&source.side===u.side&&alive(source)&&!source.fled&&dist(u,source)<=12);}
  function nextBreakTest(){while(S.breakTests&&S.breakTests.length){const next=S.breakTests.shift();if(alive(next.loser)&&next.loser.engaged){S.loser=next.loser;S.crDiff=next.diff;if(next.automaticFear){S.autoFearBreak=true;resolveBreak();return true;}S.phase="break";render();return true;}}S.loser=null;return false;}
  function resolveBreak(){
    const u=S.loser;if(!u||!alive(u)){endTurn();return;}
    const automaticFearBreak=!!S.autoFearBreak;S.autoFearBreak=false;
    const dice=automaticFearBreak?null:roll(2),total=dice?dice[0]+dice[1]:null,snakeEyes=!!dice&&dice[0]===1&&dice[1]===1;
    const testLeadership=leadership(u);
    const stubborn=hasStubborn(u),steadfast=!!u.skills?.steadfast,ignoresCombatPenalty=stubborn||steadfast,appliedDiff=ignoresCombatPenalty?0:S.crDiff;
    const holds=!automaticFearBreak&&(snakeEyes||total+appliedDiff<=testLeadership);
    if(automaticFearBreak)say('<b>Automatic break — '+u.name+'</b>: defeated and outnumbered by a Fear-causing enemy; no Break test is taken.');
    else say('<b>Break test — '+u.name+'</b>: 2D6 <span class="dice">'+dice.join(' + ')+' = '+total+'</span>; Leadership '+leadership(u)+(stubborn?' (Stubborn ignores combat-result penalty)':steadfast?' (Steadfast ignores combat-result penalty)':' − combat result '+S.crDiff)+' (modified total '+(total+appliedDiff)+').');
    if(snakeEyes)say('Snake eyes! A double 1 always holds, regardless of the combat result.');
    if(!holds){
      const pursuer=linked(u).find(v=>alive(v)&&!v.fled);
      u.fled=true;u.engaged=false;
      say(u.name+(automaticFearBreak?' is broken by Fear and flees.':' fails its break test and flees.'));
      const waitingPursuit=pursuer?!!pursueAfterBreak?.(pursuer,u):false;if(!pursuer)panicNearby?.(u,"a friendly unit flees from combat");
      (u.engagedWithIds||[]).forEach(id=>{const v=S.units[id];if(v){v.engagedWithIds=(v.engagedWithIds||[]).filter(x=>x!==u.id);v.engagedWith= v.engagedWithIds[0]||null;if(!v.engagedWithIds.length){v.engaged=false;if(v.flyingMount)v.charged=false;}}});
      u.engagedWithIds=[];u.engagementSides={};u.engagedWith=null;
      if(waitingPursuit){S.phase="pursuit";S.combatResolved=true;render();return;}
    }else say(u.name+' holds.');
    if(units().filter(alive).every(v=>v.fled)||units().filter(v=>v.side==="player"&&alive(v)).length===0||units().filter(v=>v.side==="ai"&&alive(v)).length===0){finishBattle(units().some(v=>v.side==="player"&&alive(v)&&!v.fled)?"Player wins the battle!":"Opponent wins the battle!");return;}
    if(nextBreakTest())return;
    if(holds)reformCombatPairs?.();
    S.phase="combat";S.combatResolved=true;render();
  }
  return { resolveCombat, resolveBreak, continueBreakTests: nextBreakTest };
}