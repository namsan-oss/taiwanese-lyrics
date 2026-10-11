import {analyse,splitToken,mergeNext,chosen,choose,lineReading} from './core.js';
import {lookupMeanings} from './meaning-core.js';
import {WordPlayer} from './audio.js';
const $=id=>document.getElementById(id);let lines=[],active=null;
const player=new WordPlayer(state=>{$('audio-status').textContent=state.state==='loading'?`${state.label}：音声を読み込んでいます。`:state.state==='playing'?`${state.label}：再生中です。`:state.state==='error'?'音声を再生できませんでした。もう一度試してください。':'単語の音声で練習できます。';$('stop-audio').disabled=!['loading','playing'].includes(state.state);});
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function playButton(audio,label){const b=el('button',audio?'発音を聞く':'個別音声なし');b.type='button';b.disabled=!audio;b.setAttribute('aria-label',audio?`${label}の発音を聞く`:`${label}は個別音声なし`);if(audio)b.addEventListener('click',()=>player.play(audio,label));return b;}
function sharedRecordings(token){
 const groups=new Map();token.options.flatMap(c=>c.evidence).forEach(r=>{if(r.audio&&r.romanization.includes('/'))groups.set(r.id,r);});return [...groups.values()];
}
function inlineReadings(token,l,t){
 const list=el('div',undefined,'inline-readings');list.setAttribute('role','group');list.setAttribute('aria-label',`${token.text}の読み候補`);
 token.options.forEach((candidate,index)=>{
  const row=el('div',undefined,'inline-choice'),radio=el('input');radio.type='radio';radio.name=`inline-word-${l}-${t}`;radio.id=`inline-choice-${l}-${t}-${index}`;radio.checked=token.selected===index;radio.setAttribute('aria-label',`${token.text}の読み：${candidate.spelling}`);
  radio.addEventListener('change',()=>{player.stop();choose(token,index);render();$(radio.id)?.focus({preventScroll:true});});
  const label=el('label',candidate.spelling,'reading');label.htmlFor=radio.id;row.append(radio,label);if(candidate.audio)row.append(playButton(candidate.audio,`${token.text}：${candidate.spelling}`));list.append(row);
 });
 const records=sharedRecordings(token);for(const record of records){const b=el('button','辞書の録音を聞く','shared-play');b.type='button';b.setAttribute('aria-label',`${token.text}の辞書の録音を聞く：${record.romanization}`);b.addEventListener('click',()=>player.play(record.audio,`${token.text}：辞書の録音（${record.romanization}）`));list.append(b);}
 if(records.length)list.append(el('small','複数の読みを含む辞書項目の録音です。','shared-note'));
 else if(!token.options.some(c=>c.audio))list.append(el('small','音声なし','shared-note'));
 return list;
}
function meaningView(token){
 const box=el('div',undefined,'word-meaning'),records=lookupMeanings(token.text,chosen(token)?.spelling);
 if(!records.length){box.append(el('small','意味未収録','hint'));return box;}
 const japanese=[...new Set(records.map(r=>r.japanese).filter(Boolean))];
 if(japanese.length){box.append(el('p',japanese.join(' ／ '),'meaning-ja'),el('small','AI翻訳（試作）','meaning-label'));}
 else box.append(el('small','日本語訳未収録','hint'));
 const details=el('details');details.append(el('summary','英語の意味・出典'));
 records.forEach(r=>{details.append(el('p',r.english));const a=el('a',`Maryknoll台英辞典 #${r.id}：${r.reading} ／ ${r.chinese}`);a.href='https://github.com/ChhoeTaigi/ChhoeTaigiDatabase#3-1976-maryknoll台英辭典';a.target='_blank';a.rel='noreferrer';details.append(a);});
 details.append(el('small','辞書に記載された中国語の対応語と台湾語の読みを照合した参考情報です。歌詞の文脈に合う意味とは限りません。'));box.append(details);return box;
}
function editor(token,l,t){
 const box=el('section',undefined,'word-editor');box.setAttribute('aria-label',`${token.text}の出典と区切り`);box.append(el('h3',`${token.text} の出典と区切り`,'editor-title'));
 if(!token.options.length)box.append(el('p','この表記は辞書にありません。区切りを変更するか、原曲や辞典で確認してください。','hint'));
 token.options.forEach(candidate=>{
  const details=el('details');details.append(el('summary','辞書の表記・出典'));
  candidate.evidence.forEach(record=>{const a=el('a',`${record.word} — ${record.romanization}（${record.kind}）`);a.href=`https://sutian.moe.edu.tw/zh-hant/su/${encodeURIComponent(record.id)}/`;a.target='_blank';a.rel='noreferrer';const p=el('p');p.append(a);details.append(p);});box.append(details);
 });
 const actions=el('div',undefined,'editor-actions'),split=el('button','一文字ずつに分割'),merge=el('button','次の語と結合'),close=el('button','閉じる');split.disabled=Array.from(token.text).length<2;merge.disabled=!lines[l][t+1]||!!lines[l][t+1].kind;
 split.addEventListener('click',()=>{player.stop();splitToken(lines[l],t);active=[l,t];render();});merge.addEventListener('click',()=>{player.stop();mergeNext(lines[l],t);active=[l,t];render();});close.addEventListener('click',()=>{active=null;render();});actions.append(split,merge,close);box.append(actions);return box;
}
function render(){
 $('lines').replaceChildren();let unknown=0;
 lines.forEach((tokens,l)=>{
  if(!tokens.length){$('lines').append(el('div',undefined,'blank-line'));return;}
  const article=el('article',undefined,'line'),head=el('div',undefined,'line-header');head.append(el('span',`${l+1}行目`,'line-number'),el('h3',tokens.map(t=>t.text).join(''),'original'));article.append(head);const group=el('div',undefined,'tokens');
  tokens.forEach((token,t)=>{
   if(token.kind){if(token.kind==='latin')group.append(el('div',token.text,'literal-row'));return;}
   if(!token.options.length)unknown++;
   const card=el('div',undefined,'token'),button=el('button',undefined,'token-main');button.type='button';button.setAttribute('aria-label',`単語の読み候補：${token.text}`);button.setAttribute('aria-expanded',String(active?.[0]===l&&active?.[1]===t));button.append(el('span',token.text,'word'));
   const selected=chosen(token);button.addEventListener('click',()=>{active=active?.[0]===l&&active?.[1]===t?null:[l,t];render();});card.append(button);
   if(token.options.length>1)card.append(inlineReadings(token,l,t));else{const single=el('div',undefined,'single-reading');single.append(el('span',selected?.spelling||'未収録',`reading ${!token.options.length?'unknown':''}`),playButton(selected?.audio,`${token.text}：${selected?.spelling||'未収録'}`));card.append(single);}card.append(meaningView(token));if(active?.[0]===l&&active?.[1]===t)card.append(editor(token,l,t));group.append(card);
  });article.append(group);
  const reading=el('p',lineReading(tokens),'line-reading');reading.lang='nan-Latn';reading.setAttribute('aria-label',`${l+1}行目の選択した読み`);article.append(reading);$('lines').append(article);
 });$('selection-status').textContent=unknown?`${unknown}箇所は辞書に未収録です。`:'';
}
function submit(){player.stop();const text=$('lyrics').value;if(!text.trim()){$('input-error').textContent='歌詞または練習したい台湾語の文章を入力してください。';$('lyrics').focus();return;}try{lines=analyse(text);active=null;$('input-error').textContent='';$('results').hidden=false;$('empty').hidden=true;render();}catch(e){$('input-error').textContent=e.message;}}
$('lyrics-form').addEventListener('submit',e=>{e.preventDefault();submit();});
$('sample').addEventListener('click',()=>{$('lyrics').value='朋友，咱來唱歌。\n我想欲學台語。';submit();});
$('clear').addEventListener('click',()=>{player.stop();$('lyrics').value='';lines=[];active=null;$('lines').replaceChildren();$('results').hidden=true;$('empty').hidden=false;$('input-error').textContent='';$('lyrics').focus();});
$('lyrics').addEventListener('input',()=>{player.stop();$('results').hidden=true;$('empty').hidden=false;$('input-error').textContent='';});$('stop-audio').addEventListener('click',()=>player.stop());window.addEventListener('pagehide',()=>player.stop());
