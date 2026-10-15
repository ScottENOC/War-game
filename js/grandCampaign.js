const FACTIONS = {
 empire:{name:"Human Realms",summary:"The largest and most populous realm, but not a unified kingdom.",strengths:"Broad territory, fertile river valleys, trade roads and the largest pool of settlements.",politics:"Crownfall and Westmere recognise your court. Goldhaven, Stonebridge and Southwatch answer to rival human lords.",playerCities:["Crownfall","Westmere"]},
 highElves:{name:"High Elves",summary:"An old maritime people whose courts cluster around ancient forests and island harbours.",strengths:"Defensible islands, forest resources, sea access and compact but valuable settlements.",politics:"Aelthir recognises your court. Moonspire and Silvershade retain their own power and may resist your claims.",playerCities:["Aelthir"]},
 dwarfs:{name:"Dwarfs",summary:"An old civilisation of mountain holds linked by passes and deep roads. No lowland settlements.",strengths:"Mountain strongholds, mineral wealth and defensible approaches; every hold is strategically important.",politics:"Ironhold follows your clan. Deepdelve is held by a rival thane with his own army and treasury.",playerCities:["Ironhold"]}
};
const CITIES = [
{id:1,name:"Crownfall",faction:"empire",ruler:"House Valedorn",status:"Player court",terrain:"River confluence; fertile plains",description:"The old human capital sits where two navigable rivers meet. Roads from western farms and central lowlands converge here."},
{id:2,name:"Westmere",faction:"empire",ruler:"House Merrow",status:"Player court",terrain:"Western forest edge and river crossing",description:"A prosperous river town guarding the western approach and timber trade."},
{id:3,name:"Goldhaven",faction:"empire",ruler:"Prince Odran of House Kest",status:"Rival human lord",terrain:"Eastern grain belt",description:"A rich market city whose prince commands much of the eastern farmland and dislikes Crownfall's taxes."},
{id:4,name:"Stonebridge",faction:"empire",ruler:"Duchess Elira Vane",status:"Rival human lord",terrain:"Southern river crossing",description:"A fortified bridge-city controlling the safest crossing into the southern continent. Its duchess bargains as an equal."},
{id:5,name:"Southwatch",faction:"empire",ruler:"Lord-Marshal Caedmon",status:"Rival human lord",terrain:"Southern coast and trade road",description:"A coastal fortress and customs port, rich from sea trade and wary of central authority."},
{id:6,name:"Aelthir",faction:"highElves",ruler:"The Verdant Court",status:"Player court",terrain:"Ancient forest, north-west coast",description:"An old elven city among giant trees beside a sheltered harbour. Its influence reaches the western woodland."},
{id:7,name:"Moonspire",faction:"highElves",ruler:"The Moonlit Princes",status:"Rival elven court",terrain:"Wooded Greyward Isles",description:"A secluded island court guarding wooded isles and a valuable sea lane."},
{id:8,name:"Silvershade",faction:"highElves",ruler:"The Silver Admiralty",status:"Autonomous elven court",terrain:"Eastern island forest and deep harbour",description:"A wealthy harbour-city whose admirals command the eastern island passages."},
{id:9,name:"Ironhold",faction:"dwarfs",ruler:"Clan Barakdur",status:"Player clan",terrain:"High mountains; iron and silver mines",description:"A deep mountain hold behind a narrow pass. Its mines and forges make it strategically valuable."},
{id:10,name:"Deepdelve",faction:"dwarfs",ruler:"Clan Kazrinn",status:"Rival thane",terrain:"Eastern mountain range; deep ore",description:"A fortified hold on the eastern range. Its thane recognises the high council but keeps his own army and treasury."}
];
let selectedFaction="empire",selectedCity=1;
const byId=id=>document.getElementById(id);
function renderCity(){
 const city=CITIES.find(c=>c.id===selectedCity);if(!city)return;
 byId("grand-city-detail").innerHTML='<div class="grand-city-heading"><span class="grand-city-dot '+city.faction+'"></span><div><h3>'+city.name+'</h3><small>'+FACTIONS[city.faction].name+'</small></div></div><p>'+city.description+'</p><div class="grand-stat"><b>Ruler</b><span>'+city.ruler+'</span></div><div class="grand-stat"><b>Political status</b><span>'+city.status+'</span></div><div class="grand-stat"><b>Location</b><span>'+city.terrain+'</span></div>';
 byId("grand-world-map").querySelectorAll(".grand-city").forEach(m=>{const active=Number(m.dataset.city)===city.id;m.classList.toggle("selected",active);m.setAttribute("aria-pressed",String(active));});
}
function renderFaction(){
 const f=FACTIONS[selectedFaction];
 byId("grand-faction-choices").querySelectorAll("[data-faction]").forEach(b=>{const active=b.dataset.faction===selectedFaction;b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active));});
 byId("grand-faction-detail").innerHTML='<div class="grand-faction-kicker">YOUR PEOPLE</div><h3>'+f.name+'</h3><p>'+f.summary+'</p><div class="grand-stat"><b>Starting cities</b><span>'+CITIES.filter(c=>c.faction===selectedFaction).length+'</span></div><div class="grand-stat"><b>Directly aligned</b><span>'+f.playerCities.length+' '+(f.playerCities.length===1?'city':'cities')+'</span></div><p><b>Strategic character:</b> '+f.strengths+'</p><p><b>Internal politics:</b> '+f.politics+'</p><p class="subtle">These are established peoples, not village-start factions. The player leads one court or clan while other same-faction rulers retain their cities, armies and ambitions.</p>';
 byId("grand-campaign-begin").disabled=false;byId("grand-campaign-begin").textContent="Choose "+f.name+" →";renderCity();
}
export function startGrandCampaign(){
 const screen=byId("grand-campaign-screen"),menu=byId("mainmenu");if(!screen||!menu)return;
 document.addEventListener("click",event=>{const target=event.target instanceof Element?event.target.closest('[data-mode="grand"]'):null;if(!target)return;event.preventDefault();event.stopPropagation();screen.hidden=false;menu.hidden=true;renderFaction();},true);
 byId("grand-campaign-back").addEventListener("click",()=>{screen.hidden=true;menu.hidden=false;});
 byId("grand-faction-choices").querySelectorAll("[data-faction]").forEach(b=>b.addEventListener("click",()=>{selectedFaction=b.dataset.faction;renderFaction();}));
 byId("grand-world-map").querySelectorAll(".grand-city").forEach(m=>{const select=()=>{selectedCity=Number(m.dataset.city);renderCity();};m.addEventListener("click",select);m.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();select();}});});
 byId("grand-campaign-begin").addEventListener("click",()=>{const f=FACTIONS[selectedFaction],state={schemaVersion:1,mapId:"shattered-realms-v1",faction:selectedFaction,selectedCity,startingCities:f.playerCities};try{localStorage.setItem("warGameGrandCampaignStart",JSON.stringify(state));}catch{}byId("grand-faction-detail").insertAdjacentHTML("beforeend",'<p class="grand-saved-note" role="status">Starting realm recorded on this device. The map is fixed. Next comes the campaign turn system, AI rulers, armies, diplomacy and settlement actions.</p>');byId("grand-campaign-begin").textContent="Realm selected ✓";});
}
