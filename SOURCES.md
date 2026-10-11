# 台湾語の歌詞で発音練習：出典と利用条件
更新日：2026-10-11

## 辞書・録音
台湾教育部『臺灣台語常用詞辭典』
https://sutian.moe.edu.tw/zh-hant/
関連資料・公式ダウンロード：https://sutian.moe.edu.tw/zh-hant/siongkuantsuguan/
文字資料：https://sutian.moe.edu.tw/media/senn/ods/kautian.ods
詞目MP3：https://sutian.moe.edu.tw/media/senn/sutiau-mp3.zip
著作権表示：https://sutian.moe.edu.tw/zh-hant/piantsip/pankhuan-singbing/
ライセンス：CC BY-ND 3.0 Taiwan（姓名標示・禁止改作）
https://creativecommons.org/licenses/by-nd/3.0/tw/

辞書の著作権は台湾教育部に帰属。録音の制作情報は辞書の音檔說明を参照。
https://sutian.moe.edu.tw/zh-hant/piantsip/imtong-suatbing/
播音：王秀容、林月娥、林良儒、林淑期。
審聽：許嘉勇、黃文俊、劉明新、盧廣誠。

## この試作での取り扱い
・取得した公式ODSと音声ZIPをsources/に保存。
・lexicon.jsは検索のための技術的な形式変換・索引。漢字、ローマ字、項目種別、分類、項目番号は資料の原文を保持。
・検索キーのみ、漢字欄に付属する【替】などの注記を外す。表示する出典では原表記を維持する。
・公式の異用字表に記載された別表記も検索キーとして利用。辞書にない異用字対応は推定しない。
・複数の読みは元のローマ字欄を候補検索のために区切る。出典欄では元のローマ字欄全体も表示。
・辞書原文の翻訳、読みの創作・修正はしない。
・MP3はZIPから取り出した元ファイルを変更せず単語ごとに再生。切り出し、音高変更、歌詞への音声同期、名前全体のような音声結合はしない。
・スラッシュで複数の読みを含む一つの辞書項目の録音は、各候補に個別音声として割り当てない。必要なら元の項目の録音として別表示する。
・「又唸作」「合音唸作」「俗唸作」の候補に、主音読の録音を流用しない。
・音声未収録はその旨を表示し、別の声調・読みで代用しない。

## 入力する歌詞
アプリには五月天その他の既存曲の歌詞、原曲の録音、歌手の音声を同梱していない。
練習例はこの試作用の短い文章であり、曲の歌詞ではない。
利用者が貼り付けた文章はブラウザ内だけで処理し、保存や外部API送信をしない。
アプリから原曲の正確な発音を自動判定する機能はない。

## コード
index.html、style.css、app.js、core.js、audio.jsはMIT License（LICENSE-CODE.txt）。
辞書資料と音声は上記CC BY-ND 3.0 TWの条件を維持し、アプリのコードのMITライセンスを適用しない。

## 意味の参考情報（2026-10-11追加）
The Maryknoll Taiwanese-English Dictionary（Maryknoll Language Service Center）、ChhoeTaigi公開データ。
配布元：https://github.com/ChhoeTaigi/ChhoeTaigiDatabase#3-1976-maryknoll台英辭典
CSV：https://raw.githubusercontent.com/ChhoeTaigi/ChhoeTaigiDatabase/master/ChhoeTaigiDatabase/ChhoeTaigi_MaryknollTaiengSutian.csv
ライセンス：CC BY-NC-SA 3.0 TW https://creativecommons.org/licenses/by-nc-sa/3.0/tw/
英語原文・読み・中国語対応語を保持し、同じ中国語対応語と台羅表記が一致する場合のみ別資料として参照。Unicode正規化と文白読みのラベル除去のみ照合時に行う。読みだけの一致、漢字だけの一致では結び付けない。中国語対応語は台湾語の漢字見出しと同一とは限らず、照合結果は参考情報。
日本語訳50件はCodexによるAI翻訳・要約（試作）。全件人手校閲済みではない。翻訳・索引データは同じCC BY-NC-SA 3.0 TWで提供し、MITのアプリコードや教育部のCC BY-ND音声・辞書データとは区別する。非商用条件あり。原曲の文脈に合う意味を保証しない。
意味未収録・日本語訳未収録を区別し、選択した読みを変更したときだけ対応する意味も切り替える。歌詞を翻訳サービスやAIへ送信しない。
再生成：scripts/build-meanings.py。元CSV、翻訳記録はsources/、取得データSHA-256はscripts/meaning-stats.json。

## 配信用の音声梱包
22,298個のMP3を37個のaudio-*.binへ格納。audio-manifest.jsの位置・長さで元のMP3バイト列を復元し、Web Audio APIで単語録音を再生。元録音の変更・再圧縮・切り貼りはしない。全範囲を元MP3とバイト単位で照合済み。初回再生時に必要な約8MB以下のパックを取得。最大3パック・50個のデコード済み録音をメモリ上のみキャッシュ。
