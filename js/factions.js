export const FACTIONS = {
  empire: { name:"Empire", units:{
    swordsmen:{name:"Empire Swordsmen",short:"Swordsmen",kind:"melee",models:20,stats:{M:4,WS:4,BS:3,S:3,T:3,W:1,I:3,A:1,Ld:7}},
    archers:{name:"Empire Archers",short:"Archers",kind:"archer",models:10,stats:{M:4,WS:3,BS:3,S:3,T:3,W:1,I:3,A:1,Ld:7}},
    captain:{name:"Empire Captain",short:"Captain",kind:"hero",models:1,points:50,stats:{M:4,WS:5,BS:5,S:4,T:4,W:2,I:5,A:2,Ld:8}},
    lord:{name:"Empire General",short:"General",kind:"hero",models:1,points:80,stats:{M:4,WS:5,BS:5,S:4,T:4,W:3,I:5,A:3,Ld:9}},
    cavalry:{name:"Empire Cavalry",short:"Cavalry",kind:"cavalry",models:5,points:16,stats:{M:8,WS:3,BS:3,S:3,T:3,W:1,I:3,A:1,Ld:7},mountStats:{A:1,WS:3,I:3,S:3}}
  }},
  opposing:{name:"Opposing Host",units:{
    swordsmen:{name:"Opposing Swordsmen",short:"Swordsmen",kind:"melee",models:20,stats:{M:4,WS:4,BS:3,S:3,T:3,W:1,I:3,A:1,Ld:7}},
    archers:{name:"Opposing Archers",short:"Archers",kind:"archer",models:10,stats:{M:4,WS:3,BS:3,S:3,T:3,W:1,I:3,A:1,Ld:7}},
    captain:{name:"Opposing Captain",short:"Captain",kind:"hero",models:1,points:50,stats:{M:4,WS:5,BS:5,S:4,T:4,W:2,I:5,A:2,Ld:8}},
    lord:{name:"Opposing General",short:"General",kind:"hero",models:1,points:80,stats:{M:4,WS:5,BS:5,S:4,T:4,W:3,I:5,A:3,Ld:9}},
    cavalry:{name:"Opposing Cavalry",short:"Cavalry",kind:"cavalry",models:5,points:16,stats:{M:8,WS:3,BS:3,S:3,T:3,W:1,I:3,A:1,Ld:7},mountStats:{A:1,WS:3,I:3,S:3}}
  }}
};