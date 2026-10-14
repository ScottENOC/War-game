const STORAGE_KEY="warGameNarrativeCampaignV1";
const statChoices=[
 {key:"S",label:"+1 Strength",description:"Hits harder and improves armour-save modifiers."},
 {key:"T",label:"+1 Toughness",description:"Makes the unit harder to wound."},
 {key:"MI",label:"+1 Movement and Initiative",description:"Moves farther and strikes earlier."},
 {key:"WS",label:"+1 Weapon Skill",description:"Improves melee accuracy and unlocks Melee Mastery."},
 {key:"BS",label:"+1 Ballistic Skill",description:"Improves shooting accuracy and unlocks Marksman."},
 {key:"Ld",label:"+1 Leadership",description:"Improves morale and unlocks Steadfast."}
];
const warMachineChoices=[
 {key:"BS",label:"+1 Ballistic Skill (crew)",description:"The crew gain +1 BS, improving both multi-shot accuracy and single-shot scatter."},
 {key:"range",label:"+6 inches range",description:"Adds 6 inches to both firing modes."},
 {key:"moveAndFire",label:"Move and Fire",description:"The bolt thrower may move up to 3 inches and fire in the same activation. Multi-shot suffers the normal −1 moving penalty; single-shot scatter increases by 1°."}
];
const skillChoices=[
 {key:"rerollOnesMelee",label:"Melee Mastery",requires:"WS",description:"Reroll natural 1s when making melee hit rolls."},
 {key:"rerollOnesShooting",label:"Marksman",requires:"BS",description:"Reroll natural 1s when making shooting hit rolls."},
 {key:"steadfast",label:"Steadfast",requires:"Ld",description:"Ignore combat-result penalties on break tests."}
];
const fresh=()=>({
 active:true,level:1,complete:false,
 army:[
  {id:"swords",type:"swordsmen",models:20,weapon:"handWeapon",champion:false,campaignStats:{},skills:{},name:"Human Swordsmen"},
  {id:"hero",type:"captain",models:1,weapon:"handWeapon",champion:false,campaignStats:{},skills:{},name:"Human Hero"},
  {id:"archers",type:"archers",models:20,weapon:"bow",champion:false,campaignStats:{},skills:{},name:"Human Archers"}
 ],
 history:[]
});
export function createNarrativeCampaign({ $, onStartBattle, onReturnMenu }) {
 let campaign=null;
 const el=id=>$(id);
 const read=()=>{try{const x=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");return x&&Array.isArray(x.army)?x:null;}catch{return null;}};
 const save=()=>localStorage.setItem(STORAGE_KEY,JSON.stringify(campaign));
 function hide(){el("campaign-screen").hidden=true;}
 function show(){el("mainmenu").hidden=true;el("mode-screen").hidden=true;el("collection-screen").hidden=true;el("armybuilder").hidden=true;el("game").hidden=true;el("campaign-screen").hidden=false;el("campaign-start").hidden=true;el("campaign-continue").hidden=true;el("campaign-upgrades").hidden=true;}
 function open(){campaign=read();if(!campaign||campaign.complete)campaign=fresh();show();renderOverview();}
 function renderOverview(){
  el("campaign-title").textContent=campaign.complete?"Campaign Complete":"The Horned Rat War";
  el("campaign-description").textContent=campaign.complete?"Victory! Your force has completed all three missions. Start a new run to replay the prototype.":"Mission "+campaign.level+" of 3 · Win each battle to level up every unit.";
  el("campaign-content").innerHTML='<div class="campaign-mission"><strong>Mission '+campaign.level+' · The Roadblock</strong><p>Defeat 20 human swordsmen. Your force: 20 human swordsmen, a human hero and 20 human archers.</p><div class="campaign-roster">'+campaign.army.map(u=>'<div><b>'+u.name+'</b><span>'+summary(u)+'</span></div>').join("")+'</div></div>';
  el("campaign-upgrades").hidden=true;el("campaign-start").hidden=false;el("campaign-start").textContent=campaign.complete?"Start New Campaign":"Fight Mission "+campaign.level;el("campaign-continue").hidden=true;
 }
 function summary(u){
  const s=u.campaignStats||{},bits=[];
  for(const key of ["S","T","WS","BS","Ld"])if(s[key])bits.push("+"+s[key]+" "+key);
  if(s.range)bits.push("+"+s.range+"″ range");
  if(s.moveAndFire)bits.push("Move and Fire");
  if(s.MI)bits.push("+"+s.MI+" M/I");
  for(const [k,v] of Object.entries(u.skills||{}))if(v)bits.push(({rerollOnesMelee:"Melee Mastery",rerollOnesShooting:"Marksman",steadfast:"Steadfast"})[k]||k);
  return bits.length?bits.join(" · "):"Untrained";
 }
 function start(){
  if(campaign.complete)campaign=fresh();
  campaign.active=true;save();hide();
  const army=campaign.army.map(u=>({...u,campaignStats:{...(u.campaignStats||{})},skills:{...(u.skills||{})},weapon:u.type==="archers"?"bow":"handWeapon",champion:false}));
  onStartBattle(army,{type:"swordsmen",models:20,weapon:"handWeapon",champion:false});
 }
 function onBattleFinished(won){
  show();
  if(!won){el("campaign-title").textContent="Mission Failed";el("campaign-description").textContent="Your force was defeated. Retry this mission with the same upgrades.";el("campaign-content").innerHTML='<p>The campaign remains on mission '+campaign.level+'. No level-up was awarded.</p>';el("campaign-start").hidden=false;el("campaign-start").textContent="Retry Mission "+campaign.level;el("campaign-continue").hidden=true;return;}
  campaign.history.push({level:campaign.level,result:"victory"});
  campaign.pendingUpgrade=true;save();renderUpgradeChoices();
 }
 function availableFor(unit){
  const stats=unit.campaignStats||{},skills=unit.skills||{};
  if(unit.type==="cannon"||unit.type==="boltThrower")return warMachineChoices.filter(x=>x.key==="BS"?(stats.BS||0)<99:x.key==="range"?(stats.range||0)<18:unit.type==="boltThrower"&&!stats.moveAndFire);
  return [...statChoices,...skillChoices.filter(x=>(stats[x.requires]||0)>0&&!skills[x.key])];
 }
 function renderUpgradeChoices(){
  el("campaign-title").textContent="Mission "+campaign.level+" won";
  el("campaign-description").textContent="Every unit gains one level. Choose exactly one upgrade for each unit before proceeding.";
  const host=el("campaign-upgrades");host.hidden=false;host.replaceChildren();el("campaign-content").innerHTML='<div class="campaign-mission"><strong>Battle report</strong><p>Your force prevailed. Units recover to full strength for this prototype; their chosen improvements persist.</p></div>';
  campaign.army.forEach(unit=>{
   const card=document.createElement("section");card.className="campaign-upgrade-card";
   const h=document.createElement("h2");h.textContent=unit.name;card.append(h);
   const current=document.createElement("p");current.className="campaign-current";current.textContent="Current: "+summary(unit);card.append(current);
   const group=document.createElement("div");group.className="campaign-choice-list";const choices=availableFor(unit);
   choices.forEach(choice=>{
    const label=document.createElement("label");label.className="campaign-choice";
    const radio=document.createElement("input");radio.type="radio";radio.name="upgrade-"+unit.id;radio.value=choice.key;
    const copy=document.createElement("span");copy.innerHTML="<b>"+choice.label+"</b><small>"+choice.description+"</small>";
    label.append(radio,copy);group.append(label);
   });
   card.append(group);host.append(card);
  });
  el("campaign-start").hidden=true;el("campaign-continue").hidden=false;el("campaign-continue").textContent=campaign.level===3?"Complete Campaign":"Apply upgrades & continue";
 }
 function continueCampaign(){
  const selections=[];
  for(const unit of campaign.army){
   const chosen=hostChoice(unit.id);
   if(!chosen){el("campaign-description").textContent="Choose one upgrade for each of the three units before continuing.";return;}
   selections.push([unit,chosen]);
  }
  selections.forEach(([unit,key])=>{
   unit.campaignStats=unit.campaignStats||{};unit.skills=unit.skills||{};
   if(key==="MI")unit.campaignStats.MI=(unit.campaignStats.MI||0)+1;
   else if(skillChoices.some(x=>x.key===key))unit.skills[key]=true;
   else unit.campaignStats[key]=(unit.campaignStats[key]||0)+1;
  });
  campaign.pendingUpgrade=false;
  if(campaign.level>=3){campaign.complete=true;campaign.active=false;save();el("campaign-title").textContent="Campaign Complete";el("campaign-description").textContent="Three victories. Your force has earned its final level-up.";el("campaign-content").innerHTML='<div class="campaign-mission"><strong>Victory!</strong><p>All three missions are complete. Start a new campaign to try a different progression path.</p><div class="campaign-roster">'+campaign.army.map(u=>'<div><b>'+u.name+'</b><span>'+summary(u)+'</span></div>').join("")+'</div></div>';el("campaign-upgrades").hidden=true;el("campaign-start").hidden=false;el("campaign-start").textContent="Start New Campaign";el("campaign-continue").hidden=true;save();return;}
  campaign.level++;save();renderOverview();el("campaign-start").textContent="Fight Mission "+campaign.level;el("campaign-start").hidden=false;el("campaign-continue").hidden=true;
 }
 function hostChoice(id){const radio=document.querySelector('input[name="upgrade-'+id+'"]:checked');return radio?.value||null;}
 el("campaign-start").addEventListener("click",start);
 el("campaign-continue").addEventListener("click",continueCampaign);
 el("campaign-menu").addEventListener("click",()=>{hide();onReturnMenu();});
 return {open,hide,onBattleFinished};
}
