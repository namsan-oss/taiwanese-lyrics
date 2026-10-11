import {audioManifest} from './audio-manifest.js';
// Original MP3 bytes are restored without modifying or substituting recordings.
export class WordPlayer{
 constructor(onState=()=>{},options={}){this.onState=onState;this.contextFactory=options.contextFactory||(()=>new (globalThis.AudioContext||globalThis.webkitAudioContext)());this.fetcher=options.fetcher||((...args)=>fetch(...args));this.generation=0;this.source=null;this.controller=null;this.packs=new Map();this.buffers=new Map();}
 stop(){this.generation++;this.controller?.abort();this.controller=null;if(this.source){this.source.onended=null;try{this.source.stop();}catch{}this.source=null;}this.onState({state:'idle'});}
 async play(key,label){
  this.stop();const generation=this.generation;const controller=new AbortController();this.controller=controller;
  const current=()=>generation===this.generation;
  this.onState({state:'loading',label});
  try{
   // Resume during the button gesture, before waiting for the pack download (including iOS).
   this.context??=this.contextFactory();await this.context.resume();if(!current())return;
   const entry=audioManifest[key];if(!entry)throw new Error('missing recording');
   let buffer=this.buffers.get(key);
   if(!buffer){
    const [file,offset,length]=entry;let pack=this.packs.get(file);
    if(!pack){const response=await this.fetcher(new URL(file,import.meta.url),{signal:controller.signal});if(!response.ok)throw new Error('audio download failed');pack=await response.arrayBuffer();if(!current())return;this.packs.set(file,pack);while(this.packs.size>3)this.packs.delete(this.packs.keys().next().value);}
    else {this.packs.delete(file);this.packs.set(file,pack);}
    if(offset+length>pack.byteLength)throw new Error('incomplete audio pack');
    buffer=await this.context.decodeAudioData(pack.slice(offset,offset+length));if(!current())return;
    this.buffers.set(key,buffer);while(this.buffers.size>50)this.buffers.delete(this.buffers.keys().next().value);
   }
   if(!current())return;
   const source=this.context.createBufferSource();source.buffer=buffer;source.connect(this.context.destination);this.source=source;this.controller=null;
   source.onended=()=>{if(!current()||this.source!==source)return;this.source=null;this.onState({state:'idle'});};source.start();this.onState({state:'playing',label});
  }catch(error){if(current()){console.error("Audio playback failed",error);this.controller=null;this.source=null;this.onState({state:'error',label});}}
 }
}
