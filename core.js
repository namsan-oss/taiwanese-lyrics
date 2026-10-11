import {lexicon} from './lexicon.js';
export const MAX_INPUT=5000;
const root=new Map();
for(const word of Object.keys(lexicon)){let node=root;for(const ch of word){if(!node.has(ch))node.set(ch,new Map());node=node.get(ch);}node.set('',true);}
export function candidates(text){
 const out=[];
 for(const record of lexicon[text]||[]){
  const variants=record.romanization.split('/').filter(Boolean);
  for(const spelling of variants){
   let candidate=out.find(c=>c.spelling===spelling);
   if(!candidate){candidate={spelling,evidence:[],audio:null};out.push(candidate);}
   candidate.evidence.push(record);
   // A single recording for a slash-separated entry cannot safely be assigned to each variant.
   if(variants.length===1&&record.audio&&!candidate.audio)candidate.audio=record.audio;
  }
 }
 return out;
}
export function makeToken(text){const options=candidates(text);return {text,options,selected:options.length?0:null};}
const isHan=c=>/\p{Script=Han}/u.test(c);
export function segmentLine(line){
 const chars=Array.from(line),tokens=[];
 for(let i=0;i<chars.length;){
  let node=root,end=i;
  for(let j=i;j<Math.min(chars.length,i+30);j++){if(!node.has(chars[j]))break;node=node.get(chars[j]);if(node.has(''))end=j+1;}
  if(end>i){tokens.push(makeToken(chars.slice(i,end).join('')));i=end;continue;}
  let j=i+1;
  if(!isHan(chars[i])){const type=/\s/u.test(chars[i])?'space':/[\p{L}\p{N}\p{M}]/u.test(chars[i])?'latin':'punct';while(j<chars.length&&!isHan(chars[j])&&(type==='space'?/\s/u.test(chars[j]):type==='latin'?/[\p{L}\p{N}\p{M}]/u.test(chars[j]):!/\s|[\p{L}\p{N}\p{M}]/u.test(chars[j])))j++;tokens.push({text:chars.slice(i,j).join(''),options:[],selected:null,kind:type});}
  else tokens.push(makeToken(chars[i]));i=j;
 }
 return tokens;
}
export function analyse(text){if(text.length>MAX_INPUT)throw new Error(`入力は${MAX_INPUT}文字までです。`);return text.replace(/\r\n?/g,'\n').split('\n').map(segmentLine);}
export function splitToken(tokens,index){const token=tokens[index];if(token.kind||Array.from(token.text).length<2)return false;tokens.splice(index,1,...Array.from(token.text).map(makeToken));return true;}
export function mergeNext(tokens,index){const a=tokens[index],b=tokens[index+1];if(!a||!b||a.kind||b.kind)return false;tokens.splice(index,2,makeToken(a.text+b.text));return true;}
export function chosen(token){return token.selected===null?null:token.options[token.selected]||null;}
export function lineReading(tokens){return tokens.map(t=>t.kind?t.text:chosen(t)?.spelling||(t.options.length?'〔未選択〕':'〔未収録〕')).join(' ');}
export function choose(token,index){if(!Number.isInteger(index)||index<0||index>=token.options.length)throw new RangeError('候補が存在しません');token.selected=index;}
