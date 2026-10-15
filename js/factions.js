export const FACTIONS = {
  empire: { name:"Empire", units:{
    swordsmen:{name:"Empire Swordsmen",short:"Swordsmen",kind:"melee",models:20,stats:{M:4,WS:4,BS:3,S:3,T:3,W:1,I:3,A:1,Ld:7}},
    archers:{name:"Empire Archers",short:"Infantry",kind:"archer",models:10,stats:{M:4,WS:4,BS:3,S:3,T:3,W:1,I:3,A:1,Ld:7},range:24},
    captain:{name:"Empire Captain",short:"Captain",kind:"hero",models:1,points:50,stats:{M:4,WS:5,BS:5,S:4,T:4,W:2,I:5,A:2,Ld:8}},
    lord:{name:"Empire General",short:"General",kind:"hero",models:1,points:80,stats:{M:4,WS:5,BS:5,S:4,T:4,W:3,I:5,A:3,Ld:9}},
    legendaryLord:{name:"Lord-Marshal Edric Voss",short:"Edric Voss",kind:"hero",models:1,points:160,namedCharacter:true,ignoreArmourSaves:true,defaultHeavyArmour:true,defaultShield:true,stats:{M:4,WS:6,BS:5,S:5,T:5,W:4,I:6,A:4,Ld:10}},
    rifleman:{name:"Matthias Keller, Imperial Marksman",short:"Keller",kind:"hero",models:1,points:65,namedCharacter:true,stats:{M:4,WS:4,BS:5,S:3,T:3,W:2,I:4,A:1,Ld:8}},
    captainWeiss:{name:"Captain Marta Weiss",short:"Marta Weiss",kind:"hero",models:1,points:70,namedCharacter:true,rallyingCall:true,stats:{M:4,WS:5,BS:4,S:4,T:4,W:3,I:4,A:2,Ld:8}},
    cavalry:{name:"Empire Cavalry",short:"Cavalry",kind:"cavalry",models:5,points:16,stats:{M:8,WS:3,BS:3,S:3,T:3,W:1,I:3,A:1,Ld:7},mountStats:{A:1,WS:3,I:3,S:3},range:24},
    cannon:{name:"Empire Cannon",short:"Cannon",kind:"artillery",models:3,points:80,stats:{M:0,WS:3,BS:3,S:3,T:3,W:1,I:3,A:1,Ld:7}}
  }},
  highElves: { name:"High Elves", units:{
    swordsmen:{name:"High Elf Spearmen",short:"Spearmen",kind:"melee",models:20,points:12,stats:{M:5,WS:5,BS:4,S:3,T:3,W:1,I:4,A:1,Ld:8},alwaysStrikesFirst:true},
    archers:{name:"High Elf Archers",short:"Infantry",kind:"archer",models:10,points:15,stats:{M:5,WS:5,BS:4,S:3,T:3,W:1,I:4,A:1,Ld:8},alwaysStrikesFirst:true,range:30},
    captain:{name:"High Elf Hero",short:"Hero",kind:"hero",models:1,points:75,stats:{M:5,WS:6,BS:6,S:4,T:4,W:2,I:6,A:2,Ld:9},alwaysStrikesFirst:true},
    lord:{name:"High Elf Lord",short:"Lord",kind:"hero",models:1,points:120,stats:{M:5,WS:6,BS:6,S:4,T:4,W:3,I:6,A:3,Ld:10},alwaysStrikesFirst:true},
    pegasusChampion:{name:"Aelthir, the Dawnwing",short:"Dawnwing",kind:"hero",models:1,points:110,namedCharacter:true,alwaysStrikesFirst:true,stats:{M:5,WS:6,BS:6,S:5,T:4,W:2,I:6,A:3,Ld:9}},
    shadowElf:{name:"Lethariel Starweaver",short:"Lethariel",kind:"hero",models:1,points:165,namedCharacter:true,gender:"female",canDeployAnywhere:true,coverHitPenaltyBonus:true,grantsSkirmish:true,dualWield:true,magicBow:true,defaultHeavyArmour:true,stats:{M:5,WS:7,BS:7,S:4,T:3,W:3,I:7,A:3,Ld:10},alwaysStrikesFirst:true},
    cavalry:{name:"High Elf Cavalry",short:"Cavalry",kind:"cavalry",models:5,points:24,stats:{M:9,WS:4,BS:4,S:3,T:3,W:1,I:4,A:1,Ld:8},mountStats:{A:1,WS:3,I:3,S:3},alwaysStrikesFirst:true,range:24},
    boltThrower:{name:"High Elf Bolt Thrower",short:"Bolt Thrower",kind:"artillery",models:2,points:60,stats:{M:0,WS:3,BS:4,S:3,T:3,W:1,I:4,A:1,Ld:8},range:48},
    youngDragon:{name:"Young Dragon",short:"Young Dragon",kind:"monster",models:1,points:140,isDragon:true,breathStrength:3,intrinsicArmourSave:5,stats:{M:8,WS:4,BS:0,S:5,T:5,W:4,I:4,A:3,Ld:6}},
    dragon:{name:"Dragon",short:"Dragon",kind:"monster",models:1,points:220,isDragon:true,breathStrength:4,intrinsicArmourSave:4,stats:{M:8,WS:5,BS:0,S:6,T:6,W:6,I:5,A:4,Ld:7}},
    ancientDragon:{name:"Ancient Dragon",short:"Ancient Dragon",kind:"monster",models:1,points:320,isDragon:true,breathStrength:5,intrinsicArmourSave:3,stats:{M:8,WS:6,BS:0,S:7,T:7,W:8,I:6,A:5,Ld:8}}
  }},
  opposing: { name:"Opposing Host", units:{
    swordsmen:{name:"Opposing Swordsmen",short:"Swordsmen",kind:"melee",models:20,stats:{M:4,WS:4,BS:3,S:3,T:3,W:1,I:3,A:1,Ld:7}},
    archers:{name:"Opposing Archers",short:"Infantry",kind:"archer",models:10,stats:{M:4,WS:4,BS:3,S:3,T:3,W:1,I:3,A:1,Ld:7},range:24},
    captain:{name:"Opposing Captain",short:"Captain",kind:"hero",models:1,points:50,stats:{M:4,WS:5,BS:5,S:4,T:4,W:2,I:5,A:2,Ld:8}},
    lord:{name:"Opposing General",short:"General",kind:"hero",models:1,points:80,stats:{M:4,WS:5,BS:5,S:4,T:4,W:3,I:5,A:3,Ld:9}},
    cavalry:{name:"Opposing Cavalry",short:"Cavalry",kind:"cavalry",models:5,points:16,stats:{M:8,WS:3,BS:3,S:3,T:3,W:1,I:3,A:1,Ld:7},mountStats:{A:1,WS:3,I:3,S:3},range:24}
  }}
};