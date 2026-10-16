const FIELDS = ["x","y","facing","moveUsed","moved","formationWidth","skirmishing","wallLevel","wallSegment","wallDefence","cover","onLadder"];
export function captureMovementState(u){const s={};for(const k of FIELDS)s[k]=u[k];if(u.wallDefence&&typeof u.wallDefence==="object")s.wallDefence={...u.wallDefence};return s;}
function restore(u,s){for(const k of FIELDS){if(s[k]===undefined)delete u[k];else u[k]=s[k];}if(s.wallDefence&&typeof s.wallDefence==="object")u.wallDefence={...s.wallDefence};}
function sameNumber(a,b){return Math.abs((Number(a)||0)-(Number(b)||0))<0.00001;}
function sameGeometry(a,b){return sameNumber(a.x,b.x)&&sameNumber(a.y,b.y)&&sameNumber(a.facing,b.facing)&&a.formationWidth===b.formationWidth&&a.skirmishing===b.skirmishing&&a.wallLevel===b.wallLevel&&a.wallSegment===b.wallSegment&&a.cover===b.cover&&a.onLadder===b.onLadder;}
export function commitMovementAction(S,u,before,label="move"){if(!u||!before)return false;const after=captureMovementState(u);if(sameGeometry(before,after)&&sameNumber(before.moveUsed,after.moveUsed))return false;S.movementUndoByUnit=S.movementUndoByUnit||{};let entry=S.movementUndoByUnit[u.id];if(!entry||entry.turn!==S.turn||entry.phase!==S.phase)entry=S.movementUndoByUnit[u.id]={turn:S.turn,phase:S.phase,stack:[]};const prior=entry.stack[entry.stack.length-1];if(prior&&sameGeometry(before,prior.after)&&sameGeometry(after,prior.before)){entry.stack.pop();restore(u,prior.before);return "reversed";}entry.stack.push({before,after,label});if(entry.stack.length>80)entry.stack.shift();return "recorded";}
export function hasMovementUndo(S,u){const e=u&&S.movementUndoByUnit?.[u.id];return !!e&&e.turn===S.turn&&e.phase===S.phase&&e.stack.length>0;}
export function undoMovementAction(S,u){if(!hasMovementUndo(S,u))return false;const e=S.movementUndoByUnit[u.id],last=e.stack.pop();restore(u,last.before);return true;}

export function canReverseTurn(S,u,direction){const e=u&&S.movementUndoByUnit?.[u.id],p=e&&e.turn===S.turn&&e.phase===S.phase?e.stack[e.stack.length-1]:null;if(!p)return false;const opposite=direction==="left"?"turn-right":"turn-left";if(p.label!==opposite)return false;const current=captureMovementState(u),candidate={...current,facing:current.facing+(direction==="left"?-Math.PI/4:Math.PI/4)};return sameGeometry(current,p.after)&&sameGeometry(candidate,p.before);}

export function getLastMovementAction(S,u){const e=u&&S.movementUndoByUnit?.[u.id];return e&&e.turn===S.turn&&e.phase===S.phase?e.stack[e.stack.length-1]||null:null;}
export function sameMovementGeometry(a,b){return sameGeometry(a,b);}
export function restoreMovementState(u,s){if(u&&s)restore(u,s);}
