// pages/index.js
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout/Layout';
import Hero from '../components/Hero/Hero'; // ヒーローセクションをインポート
import Birthday from '../components/Birthday/Birthday';
import OnAir from '../components/OnAir/OnAir';
import Schedule from '../components/Schedule/Schedule';
import Works from '../components/Works/Works';
import VideoSection from '../components/Video/VideoSection';
import Links from '../components/Links/Links';

export default function Home() {
  // データ状態
  const [birthdays, setBirthdays] = useState([]);
  const [onAirContent, setOnAirContent] = useState([]);
  const [schedules, setSchedules] = useState([]);
  // 賢プロダクション公式サイトの情報に基づくモックデータ（全件）
  const [works, setWorks] = useState({
    anime: [
      { id: "a1", title: "カードファイト!! ヴァンガード", role: "櫂トシキ 役", isMain: true, year: "2011年～" },
      { id: "a2", title: "アイドリッシュセブン", role: "十龍之介 役", isMain: true, year: "2015年～" },
      { id: "a3", title: "新米オッサン冒険者、最強パーティに死ぬほど鍛えられて無敵になる。", role: "リック・グラディアートル 役", isMain: true, year: "2023年～" },
      { id: "a4", title: "デリコズ・ナーサリー", role: "ディーノ・クラシコ 役", isMain: true, year: "2023年～" },
      { id: "a5", title: "魔入りました！入間くん", role: "サブノック・サブロ 役", isMain: false, year: "2019年～" },
      { id: "a6", title: "WAVE!!〜サーフィンやっぺ!!〜", role: "厳名コウスケ 役", isMain: false, year: "2020年" },
      { id: "a7", title: "憂国のモリアーティ", role: "アルバート・ジェームズ・モリアーティ 役", isMain: false, year: "2020年～" },
      { id: "a8", title: "キャプテン翼", role: "日向小次郎 役", isMain: false, year: "2018年～" },
      { id: "a9", title: "ジョジョの奇妙な冒険", role: "シーザー・ツェペリ 役", isMain: false, year: "2012年" },
      { id: "a10", title: "火ノ丸相撲", role: "國崎千比路 役", isMain: false, year: "2018年～" },
      { id: "a11", title: "Unnamed Memory", role: "アルス 役", isMain: true, year: "2024年～" },
      { id: "a12", title: "FARMAGIA", role: "アンザー/ザナス 役", isMain: false, year: "2024年～" },
      { id: "a13", title: "め組の大吾 救国のオレンジ", role: "椿拓人 役", isMain: false, year: "2016年" },
      { id: "a14", title: "ポーション頼みで生き延びます！", role: "地球の管理者 役", isMain: false, year: "2023年" },
      { id: "a15", title: "マジカパーティ", role: "ワンナイト 役", isMain: false, year: "2022年" },
      { id: "a16", title: "千銃士", role: "ドライゼ 役", isMain: false, year: "2018年" },
      { id: "a17", title: "Butlers 〜千年百年物語〜", role: "羽早川翔 役", isMain: false, year: "2018年" },
      { id: "a18", title: "ナナマル サンバツ", role: "笹島学人 役", isMain: false, year: "2017年" },
      { id: "a19", title: "妖怪ウォッチ", role: "ゾン・ビー・チョッパー 役", isMain: false, year: "2014年～" },
      { id: "a20", title: "A3!", role: "高遠丞 役", isMain: false, year: "2020年～" },
      { id: "a21", title: "禍つヴァールハイト -ZUERST-", role: "ザイツ 役", isMain: false, year: "2022年～" },
      { id: "a22", title: "ハイキュー!!", role: "鎌先靖志 役", isMain: false, year: "2014年～" },
      { id: "a23", title: "ガンダム Gのレコンギスタ", role: "マスク/ルイン・リー 役", isMain: false, year: "2014年～" },
      { id: "a24", title: "D.Gray-man HALLOW", role: "神田ユウ 役", isMain: false, year: "2016年" },
      { id: "a25", title: "義風堂々!! 兼続と慶次", role: "前田慶次 役", isMain: false, year: "2018年" },
      { id: "a26", title: "ガンダムビルドファイターズ", role: "ユウキ・タツヤ 役", isMain: false, year: "2013年～" },
      { id: "a27", title: "ガンダムビルドファイターズトライ", role: "三代目メイジン・カワグチ 役", isMain: false, year: "2014年～" },
      { id: "a28", title: "はじめの一歩", role: "牧野文人 役", isMain: false, year: "2013年～" },
      { id: "a29", title: "ロボカーポリー", role: "ポリー 役", isMain: true, year: "2011年～" },
      { id: "a30", title: "PSYCHO－PASS2", role: "喜汰沢旭 役", isMain: false, year: "2014年" },
      { id: "a31", title: "ドキドキ！プリキュア", role: "二階堂 役", isMain: false, year: "2013年～" },
      { id: "a32", title: "ポケットモンスター ベストウィッシュ", role: "クレイ 役", isMain: false, year: "2010年～" },
      { id: "a33", title: "ちはやふる", role: "名倉孝 役", isMain: false, year: "2011年～" },
      { id: "a34", title: "異世界の聖機師物語", role: "ダグマイア 役", isMain: false, year: "2009年" },
      { id: "a35", title: "サザエさん", role: "平田 役", isMain: false, year: "2008年～" },
      { id: "a36", title: "二十面相の娘", role: "ヒデ 役", isMain: false, year: "2008年" },
      { id: "a37", title: "名探偵コナン", role: "左近夕介 役", isMain: false, year: "2006年～" },
      { id: "a38", title: "アルカナ・ファミリア", role: "", isMain: false, year: "2012年" },
      { id: "a39", title: "かんなぎ", role: "", isMain: false, year: "2008年" },
      { id: "a40", title: "とらドラ！", role: "", isMain: false, year: "2008年～" },
      { id: "a41", title: "TYTANIA-タイタニア-", role: "", isMain: false, year: "2008年～" },
      { id: "a42", title: "夜桜四重奏", role: "", isMain: false, year: "2008年" },
      { id: "a43", title: "鉄腕バーディー DECODE", role: "", isMain: false, year: "2008年" },
      { id: "a44", title: "ゴルゴ13", role: "", isMain: false, year: "2008年～" },
      { id: "a45", title: "隠の王", role: "", isMain: false, year: "2008年" },
      { id: "a46", title: "モノクローム・ファクター", role: "", isMain: false, year: "2008年" },
      { id: "a47", title: "風のスティグマ", role: "", isMain: false, year: "2007年" },
      { id: "a48", title: "CLANNAD‐クラナド‐", role: "", isMain: false, year: "2007年～" },
      { id: "a49", title: "ブルードロップ", role: "", isMain: false, year: "2008年" },
      { id: "a50", title: "しゅごキャラ！", role: "", isMain: false, year: "2007年～" },
      { id: "a51", title: "Yes！プリキュア5 鏡の国のミラクル大冒険! (劇場版)", role: "", isMain: false, year: "2007年" }
    ],
    game: [
      { id: "g1", title: "テイルズ オブ アライズ", role: "アルフェン 役", isMain: true, year: "2021年～" },
      { id: "g2", title: "アサシン クリード ローグ", role: "シェイ・パトリック・コーマック 役", isMain: true, year: "2014年～" },
      { id: "g3", title: "アガレスト戦記2", role: "ヴァイス 役", isMain: true, year: "2010年" },
      { id: "g4", title: "アイドリッシュセブン", role: "十龍之介 役", isMain: true, year: "2015年～" },
      { id: "g5", title: "アンジェリーク ルミナライズ", role: "シュリ 役", isMain: false, year: "2015年" },
      { id: "g6", title: "Rise of the Ronin", role: "伊庭八郎 役", isMain: false, year: "2024年" },
      { id: "g7", title: "スターオーシャン 6 THE DIVINE FORCE", role: "テオ・クレムラート 役", isMain: false, year: "2022年" },
      { id: "g8", title: "刀剣乱舞", role: "燭台切光忠/江雪左文字 役", isMain: false, year: "2015年～" },
      { id: "g9", title: "カデンツァ フェルマータ アコルト：フォルテシモ", role: "ユリウス＝シャリオヴァルト 役", isMain: false, year: "2019年" }
    ],
    dub: {
      movie: [
        { id: "dm1", title: "ジェントルメン", role: "レイ 役（チャーリー・ハナム）", isMain: false, year: "2020年" },
        { id: "dm2", title: "Marvel パニッシャー", role: "ビリー・ルッソ 役（ベン・バーンズ）", isMain: false, year: "2017年～" },
        { id: "dm3", title: "アザーズ-捕食者-", role: "ゲイツ 役（リッチ・マクドナルド）", isMain: true, year: "2009年" },
        { id: "dm4", title: "マジック・マイク", role: "アダム 役（アレックス・ペティファー）", isMain: false, year: "2012年" },
        { id: "dm5", title: "蜜の味～テイスト・オブ・マネー～", role: "チュ・ヨンジャク 役（キム・ガンウ）", isMain: true, year: "2012年" },
        { id: "dm6", title: "最後の晩餐", role: "マオマオ 役（ジアン・ジンフー）", isMain: false, year: "2012年" },
        { id: "dm7", title: "ちりも積もればロマンス", role: "ヤン・グァンウ 役（イ・サンヨプ）", isMain: false, year: "2016年" },
        { id: "dm8", title: "キック・アス", role: "デイヴ・リズースキー/キック・アス 役（アーロン・ジョンソン）", isMain: true, year: "2010年" },
        { id: "dm9", title: "スカイランナー", role: "ニック 役（ケリー・ブラッツ）", isMain: true, year: "2011年" },
        { id: "dm10", title: "ボディ・ハント", role: "ライアン 役（マックス・シェリオット）", isMain: false, year: "2011年" },
        { id: "dm11", title: "Dr.パルナサスの鏡", role: "アントン 役（アンドリュー・ガーフィールド）", isMain: false, year: "2009年" },
        { id: "dm12", title: "しあわせの雨傘", role: "ローラン 役（ジェレミー・レニエ）", isMain: false, year: "2013年" },
        { id: "dm13", title: "わらの犬", role: "デイヴィッド・サムナー 役（ジェームズ・マースデン）", isMain: true, year: "2011年" },
        { id: "dm14", title: "ロープ", role: "フィリップ・モーガン 役（ファーリー・グレンジャー）", isMain: false, year: "2014年" },
        { id: "dm15", title: "ハリー・ポッターと死の秘宝 PERT1・2", role: "ビル・ウィーズリー 役", isMain: false, year: "2010年～2011年" },
        { id: "dm16", title: "インモータルズ -神々の戦い-", role: "リサンドラー 役", isMain: false, year: "2011年" },
        { id: "dm17", title: "母なる証明", role: "ジンテ 役", isMain: false, year: "2009年" },
        { id: "dm18", title: "ワルキューレ", role: "ヘルバー 役", isMain: false, year: "2008年" },
        { id: "dm19", title: "ビハインド・エネミーライン 女たちの戦場", role: "ウィラード 役", isMain: false, year: "2014年" },
        { id: "dm20", title: "ニュートン/トワイライト・サーガ", role: "エンブリー 役", isMain: false, year: "2013年" },
        { id: "dm21", title: "FRINGE/フリンジ", role: "リンカーン 役", isMain: false, year: "2008年～" },
        { id: "dm22", title: "ブギーマン3", role: "ベン 役", isMain: false, year: "2008年" },
        { id: "dm23", title: "ドゥームズデイ", role: "スターリング 役", isMain: false, year: "2008年" },
        { id: "dm24", title: "ノウイング", role: "スペンサー 役", isMain: false, year: "2009年" },
        { id: "dm25", title: "メッセージ そして、愛が残る", role: "ジェレミー 役", isMain: false, year: "2009年" },
        { id: "dm26", title: "ストリート・レーサー", role: "ミシカ・モコフ 役", isMain: false, year: "2008年" },
        { id: "dm27", title: "ブーリン家の姉妹", role: "ピーター 役", isMain: false, year: "2008年" },
        { id: "dm28", title: "U‐900", role: "ヒーリー 役", isMain: false, year: "2008年" },
        { id: "dm29", title: "エクトプラズム 怨霊の棲む家", role: "ジョナ 役", isMain: false, year: "2009年" },
        { id: "dm30", title: "アンストッパブル", role: "スコット 役", isMain: false, year: "2010年" },
        { id: "dm31", title: "隣の家の少女", role: "エディ 役", isMain: false, year: "2007年" },
        { id: "dm32", title: "ストーカー", role: "ホイップ 役", isMain: false, year: "2013年" },
        { id: "dm33", title: "マーシャルの奇跡", role: "クリス 役", isMain: false, year: "2010年" },
        { id: "dm34", title: "男と女の不都合な真実", role: "リック 役", isMain: false, year: "2014年" },
        { id: "dm35", title: "いのちの戦場 アルジェリア1959", role: "ルフラン 役", isMain: false, year: "2010年" },
        { id: "dm36", title: "バウンティ・ハンター", role: "サム 役", isMain: false, year: "2010年" },
        { id: "dm37", title: "スーパーバッド 童貞ウォーズ", role: "ジェシー 役", isMain: false, year: "2007年" },
        { id: "dm38", title: "クレイジーズ", role: "スコッティ 役", isMain: false, year: "2010年" },
        { id: "dm39", title: "フルスピード 悪魔のフル・チューン", role: "車販売員 役", isMain: false, year: "2007年" },
        { id: "dm40", title: "ダレン・シャン", role: "友人１ 役", isMain: false, year: "2009年" },
        { id: "dm41", title: "PUSH 光と闇の能力者", role: "ポップ・ボーイ２ 役", isMain: false, year: "2009年" },
        { id: "dm42", title: "ウィジャ ビギニング ～呪い襲い殺す～", role: "マイキー 役", isMain: false, year: "2014年" },
        { id: "dm43", title: "教授のおかしな妄想殺人", role: "ロイ 役", isMain: false, year: "2014年" }
      ],
      drama: [
        { id: "dd1", title: "SEAL Team/シール・チーム", role: "クレイ・スペンサー 役(マックス・シエリオット)", isMain: true, year: "2017年～" },
        { id: "dd2", title: "トラウマコード", role: "ヤン・ジェウォン 役（チュ・ヨンウ）", isMain: true, year: "2020年～" },
        { id: "dd3", title: "DOC(ドック) あすへのカルテ", role: "ロレンツォ・ラッザリーニ 役（ジャンマルコ・サウリーノ）", isMain: true, year: "2021年～" },
        { id: "dd4", title: "コード・ブラック 生と死の間で", role: "マリオ・サヴェッティ 役（ベンジャミン・ホリングスワース）", isMain: true, year: "2015年～" },
        { id: "dd5", title: "キング～Two Hearts", role: "イ・ジェハ 役（イ・スンギ）", isMain: true, year: "2011年" },
        { id: "dd6", title: "華麗なる遺産", role: "ソヌ・ファン 役（イ・スンギ）", isMain: true, year: "2009年" },
        { id: "dd7", title: "僕の彼女は九尾狐＜クミホ＞", role: "チャ・テウン 役（イ・スンギ）", isMain: true, year: "2010年" },
        { id: "dd8", title: "私も花！", role: "ソ・ジェヒ 役（ユン・シユン）", isMain: false, year: "2011年" },
        { id: "dd9", title: "製パン王 キムタック", role: "キムタック 役（ユン・シユン）", isMain: true, year: "2010年" },
        { id: "dd10", title: "となりの美男＜イケメン＞", role: "エンリケ・クム 役（ユン・シユン）", isMain: false, year: "2013年" },
        { id: "dd11", title: "太陽を抱く月", role: "ホ・ヨム 役（ソン・ジェヒ）", isMain: false, year: "2012年" },
        { id: "dd12", title: "ホジュン～伝説の心医～", role: "イ・ジョンミン 役（ソン・ジェヒ）", isMain: false, year: "2013年" },
        { id: "dd13", title: "美男〈イケメン〉ラーメン店", role: "チャ・チス 役（チョン・イル）", isMain: true, year: "2011年" },
        { id: "dd14", title: "夜警日誌", role: "イ・リン 役（チョン・イル）", isMain: true, year: "2014年" },
        { id: "dd15", title: "私の期限は49日", role: "スケジューラー 役（チョン・イル）", isMain: false, year: "2011年" },
        { id: "dd16", title: "善徳女王", role: "アルチョン 役（イ・スンヒョ）", isMain: false, year: "2009年" },
        { id: "dd17", title: "武神", role: "高宗 役（イ・スンヒョ）", isMain: false, year: "2012年" },
        { id: "dd18", title: "花ざかりの君たちへ", role: "カン・テジュン 役（チェ・ミノ）", isMain: false, year: "2012年" },
        { id: "dd19", title: "アーロンストーン", role: "チャーリー・ランダーズ 役（ケリー・ブラッツ）", isMain: true, year: "2009年" },
        { id: "dd20", title: "サニーwithチャンス", role: "ジェームズ 役（ケリー・ブラッツ）", isMain: false, year: "2009年" },
        { id: "dd21", title: "マイノリティ・リポート", role: "ダッシュ・パーカー 役（スターク・サンズ）", isMain: true, year: "2015年" },
        { id: "dd22", title: "オレのことスキでしょ。", role: "イ・スミョン 役（チャン・ソウォン）", isMain: false, year: "2013年" },
        { id: "dd23", title: "ダウントン・アビー ～貴族とメイドと相続人～", role: "マシュー・クローリー 役（ダン・スティーヴンス）", isMain: false, year: "2010年～" },
        { id: "dd24", title: "ザ・ホワイトハウス", role: "チャーリー・ヤング 役", isMain: false, year: "2006年～" },
        { id: "dd25", title: "SMALLVILLE/ヤングスーパーマン", role: "ジミー・オルセン 役", isMain: false, year: "2001年～" },
        { id: "dd26", title: "少林寺伝奇", role: "恵忍 役", isMain: false, year: "2006年" },
        { id: "dd27", title: "トンイ", role: "英祖 役", isMain: false, year: "2010年" },
        { id: "dd28", title: "パスタ～恋が出来るまで～", role: "ネモ 役", isMain: false, year: "2010年" },
        { id: "dd29", title: "検事プリンセス", role: "イ・ウヒョン 役", isMain: false, year: "2010年" },
        { id: "dd30", title: "霜花店 運命、その愛", role: "スンギ 役（シム・ジホ）", isMain: false, year: "2011年" },
        { id: "dd31", title: "マッドメン", role: "マッケンドリック 役", isMain: false, year: "2007年～" },
        { id: "dd32", title: "DEXTER/デクスター", role: "ジョーダン 役", isMain: false, year: "2006年～" },
        { id: "dd33", title: "おとぼけスティーブンス一家", role: "トラビス 役", isMain: false, year: "2000年～" },
        { id: "dd34", title: "ドレイク＆ジョシュ", role: "シドニー 役", isMain: false, year: "2004年～" },
        { id: "dd35", title: "ユーリカ～事件です！カーター保安官～", role: "ディラン 役", isMain: false, year: "2006年～" },
        { id: "dd36", title: "FBI 失踪者を追え！", role: "マット 役", isMain: false, year: "2002年～" },
        { id: "dd37", title: "スターの恋人", role: "ヒュンジュン 役", isMain: false, year: "2008年～" },
        { id: "dd38", title: "スーパーナチュラル Season3", role: "キャル 役", isMain: false, year: "2007年～" }
      ],
      anime: [
        { id: "da1", title: "LEGO®スーパー・ヒーローズ： フラッシュ", role: "フラッシュ 役（ジェームズ･アーノルド･テイラー）", isMain: true, year: "2018年" },
        { id: "da2", title: "トランスフォーマー サイバーバース", role: "ホットロッド 役", isMain: false, year: "2018年～" },
        { id: "da3", title: "クズ悪役の自己救済システム", role: "岳 清源 役", isMain: false, year: "2023年～" },
        { id: "da4", title: "バットマン:ブレイブ&ボールド", role: "2代目フラッシュ 役", isMain: false, year: "2008年～" }
      ]
    },
    other: {
      special: [
        { id: "s1", title: "機界戦隊ゼンカイジャー", role: "ブルーン/ゼンカイブルーン 役", isMain: true, year: "2021年～2023年" },
        { id: "s2", title: "セイバー+ゼンカイジャー スーパーヒーロー戦記", role: "ブルーン 役", isMain: false, year: "2021年" },
        { id: "s3", title: "ことだま屋本舗EXステージ『クロボーズ』", role: "織田信長 役", isMain: false, year: "2016年" },
        { id: "s4", title: "ことだま屋本舗「EXステージ×コミックファイア」『新米オッサン冒険者、最強パーティに死ぬほど鍛えられて無敵になる。』", role: "リック 役", isMain: true, year: "2021年" },
        { id: "s5", title: "オリジナル朗読劇密室デスマッチ「マスクド・アイスクリーム」", role: "花巻只志 役", isMain: false, year: "2021年" },
        { id: "s6", title: "劇団ヘロヘロQカムパニー「立て！マジンガーZ!!」", role: "日替わりゲスト", isMain: false, year: "2022年" }
      ],
      drama: [
        { id: "dr1", title: "セカイ系バラエティ 僕声シーズン2", role: "岩ノ森章二郎 役", isMain: false, year: "2018年" }
      ],
      radio: [
        { id: "r1", title: "羽多野渉・佐藤拓也のScat Babys Show!!", role: "", isMain: true, year: "2016年～" },
        { id: "r2", title: "佐藤拓也の「やれます!」", role: "", isMain: true, year: "2015年～2018年" },
        { id: "r3", title: "マジカルデイズ the RADIO Parade", role: "", isMain: false, year: "2016年" },
        { id: "r4", title: "ラジオファイト!! ヴァンガード", role: "", isMain: false, year: "2018年～2019年" },
        { id: "r5", title: "キャプテン翼 日向小次郎の強引なラジオ!", role: "", isMain: true, year: "2019年" },
        { id: "r6", title: "JOESTAR RADIO", role: "", isMain: false, year: "2020年" },
        { id: "r7", title: "中澤まさとも・佐藤拓也の胸キュンラボ from 100シーンの恋＋", role: "", isMain: true, year: "2021年～" },
        { id: "r8", title: "声優と夜あそび", role: "金曜パーソナリティ", isMain: false, year: "2018年" },
        { id: "r9", title: "佐藤拓也のちょっとやってみて!!", role: "", isMain: true, year: "2019年～" },
        { id: "r10", title: "佐藤拓也&堀江瞬 アニメみたいに!", role: "", isMain: true, year: "2021年～" }
      ],
      voice: [
        { id: "v1", title: "ボイスオーバー: ジェイミーオリバー トップシェフを探せ", role: "アーロン 役", isMain: false, year: "2015年～" },
        { id: "v2", title: "ボイスオーバー: レーガン暗殺未遂", role: "", isMain: false, year: "2010年～" },
        { id: "v3", title: "ボイスオーバー: ipod革命", role: "", isMain: false, year: "2010年～" },
        { id: "v4", title: "ボイスオーバー: Future Weapons", role: "", isMain: false, year: "2012年～" },
        { id: "v5", title: "ボイスオーバー: ノルマンディ", role: "", isMain: false, year: "2014年～" },
        { id: "v6", title: "ボイスオーバー: ビデオゲームの歴史", role: "", isMain: false, year: "2013年～" },
        { id: "v7", title: "ボイスオーバー: エベレスト", role: "", isMain: false, year: "2015年～" },
        { id: "v8", title: "ボイスオーバー: ブリリアント・アイデア", role: "", isMain: false, year: "2014年～" }
      ],
      comic: [
        { id: "c1", title: "ボイスコミック: 悪魔で候", role: "早見裕 役", isMain: false, year: "2010年～" },
        { id: "c2", title: "ボイスコミック: 霊媒師いずな", role: "", isMain: false, year: "2008年～" },
        { id: "c3", title: "ボイスコミック: 悪魔とラブソング", role: "", isMain: false, year: "2010年～" }
      ]
    }
  });
  const [videos, setVideos] = useState([]);

  // UI状態
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState({
    birthdays: false,
    onAir: false,
    schedules: false,
    works: true, // モックデータを使用するので、すでにロード済みとする
    videos: false
  });

  const router = useRouter();
  const homeRef = useRef(null);
  const sectionsRef = useRef({});

  // セクション参照を登録する関数
  const registerSectionRef = (id, ref) => {
    if (ref) {
      sectionsRef.current[id] = ref;
    }
  };

  // ハッシュに基づいてスクロール位置を調整する関数
  const scrollToHashSection = () => {
    if (!router.isReady || loading) return;

    const hash = window.location.hash;
    if (!hash) return;

    const sectionId = hash.substring(1); // #を削除

    // 少し遅延を与えて要素が完全に描画された後に実行
    setTimeout(() => {
      let element;

      // まず参照から要素を探す
      if (sectionsRef.current[sectionId]) {
        element = sectionsRef.current[sectionId];
      } else {
        // 参照がなければIDから探す
        element = document.getElementById(sectionId);
        if (!element) {
          // classからも探してみる
          const elements = document.getElementsByClassName(`${sectionId}-section`);
          if (elements.length > 0) {
            element = elements[0];
          }
        }
      }

      if (element) {
        // ヘッダーの高さを取得
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 80;

        // スクロール位置を計算
        const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementTop - (headerHeight + 20); // ヘッダー + 余白

        // スクロール実行
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // 念のため位置を再調整（画像読み込みなどでレイアウトシフトが発生する可能性があるため）
        setTimeout(() => {
          const newElementTop = element.getBoundingClientRect().top;
          if (Math.abs(newElementTop) > 20) { // 若干のずれは許容
            const newOffset = window.pageYOffset + newElementTop - (headerHeight + 20);
            window.scrollTo({
              top: newOffset,
              behavior: 'smooth'
            });
          }
        }, 700);
      }
    }, 500);
  };

  // ルート変更完了時に実行
  useEffect(() => {
    if (router.isReady && !loading) {
      scrollToHashSection();
    }
  }, [router.isReady, loading, router.asPath]);

  // データのフェッチを実行
  useEffect(() => {
    const fetchDataWithTimeout = async (url, dataType, timeout = 5000) => {
      try {
        // タイムアウト処理を追加
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`${dataType}データの取得に失敗しました: ${response.status}`);

        const data = await response.json();
        return { success: true, data };
      } catch (err) {
        console.error(`${dataType}データの取得エラー:`, err);
        return { success: false, error: err.message };
      }
    };

    // works以外のデータを並列に取得
    const fetchOtherData = async () => {
      // 日付パラメータの準備
      const today = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(today.getDate() + 30);
      const fromParam = today.toISOString().split('T')[0];
      const toParam = thirtyDaysLater.toISOString().split('T')[0];

      try {
        const [birthdaysResult, onAirResult, schedulesResult, videosResult] = await Promise.allSettled([
          fetchDataWithTimeout('/api/birthdays', 'birthdays'),
          fetchDataWithTimeout('/api/on-air', 'onAir'),
          fetchDataWithTimeout(`/api/schedules?from=${fromParam}&to=${toParam}`, 'schedules'),
          fetchDataWithTimeout('/api/videos', 'videos')
        ]);

        // 結果を処理
        if (birthdaysResult.value?.success) {
          setBirthdays(birthdaysResult.value.data);
        }
        setDataLoaded(prev => ({ ...prev, birthdays: true }));

        if (onAirResult.value?.success) {
          setOnAirContent(onAirResult.value.data);
        }
        setDataLoaded(prev => ({ ...prev, onAir: true }));

        if (schedulesResult.value?.success) {
          setSchedules(schedulesResult.value.data);
        }
        setDataLoaded(prev => ({ ...prev, schedules: true }));

        if (videosResult.value?.success) {
          setVideos(videosResult.value.data);
        }
        setDataLoaded(prev => ({ ...prev, videos: true }));
      } catch (error) {
        console.error('データ取得中のエラー:', error);
        // エラーが発生した場合でも、ローディングを終了
        setLoading(false);
      }
    };

    fetchOtherData();
  }, []);

  // 全データがロードされたかチェック
  useEffect(() => {
    if (dataLoaded.birthdays && dataLoaded.onAir && dataLoaded.schedules && dataLoaded.works && dataLoaded.videos) {
      // 全データがロードされたらローディングを終了
      setLoading(false);
    }
  }, [dataLoaded]);

  // 各セクションの表示判定用
  const hasData = {
    birthdays: birthdays && birthdays.length > 0,
    onAir: onAirContent && (onAirContent.anime?.length > 0 || onAirContent.radio?.length > 0 || onAirContent.web?.length > 0),
    schedules: schedules && schedules.schedules && schedules.schedules.length > 0,
    works: works && (works.anime?.length > 0 || works.game?.length > 0),
    videos: videos && videos.length > 0
  };

  return (
    <Layout title="佐藤拓也ファンサイト - 声優・佐藤拓也さんの出演作品、スケジュール情報など">
      <div ref={homeRef}>
        {loading ? (
          <div className="loading-container">
            <div className="audio-wave">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p className="loading-text">LOADING...</p>
          </div>
        ) : (
          <>
            {/* ヒーローセクション（最初に表示） */}
            <Hero />

            {/* 誕生日キャラクター */}
            {hasData.birthdays && <Birthday characters={birthdays} />}

            {/* 放送中コンテンツ */}
            <OnAir content={onAirContent} />

            {/* スケジュール */}
            <div id="schedule" ref={(ref) => registerSectionRef('schedule', ref)}>
              <Schedule schedules={schedules} />
            </div>

            {/* 作品 */}
            <div id="works" ref={(ref) => registerSectionRef('works', ref)}>
              <Works works={works} />
            </div>

            {/* 動画 */}
            <VideoSection videos={videos} />

            {/* リンク - 静的データなので常に表示 */}
            <div id="links" ref={(ref) => registerSectionRef('links', ref)}>
              <Links />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}