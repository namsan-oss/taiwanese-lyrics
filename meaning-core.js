import {meanings} from './meanings.js';
export function lookupMeanings(word,reading){if(!reading)return [];const key=reading.replace(/【[^】]*】/g,'').normalize('NFC').trim();return meanings[word]?.[key]||[];}
