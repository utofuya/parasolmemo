# PARASOL MEMO — 完全版スターター

フィルム写真の個人的アーカイブサイトです。

- 白背景
- PARASOL MEMOロゴ
- リアルタイム時計・日付
- 重なり合うランダムな写真ウィンドウ
- 写真 / GIF
- 写真クリック・タップで詳細ページ
- 写真ごとに自由に書ける Details
- Journal（トップとは別ページ）
- ABOUT
- スマホ対応
- GitHub Pages 無料公開
- Pages CMSでコードを書かずに写真・GIF・文章を更新

## 最初に読むファイル

初心者の方は **`GITHUB_SETUP.md`** を読んでください。

## 大事なポイント

GitHubは「ファイル」ではありません。Webサービスです。

このサイトをGitHub Pagesで自動公開するための設定ファイルは、

```text
.github/workflows/pages.yml
```

です。

`.github` はドットで始まる隠しフォルダなので、パソコンのファイル一覧で見えないことがあります。
**名前を `github` に変更しないでください。**

## GitHub Pages

1. ZIPを解凍
2. 解凍したフォルダの「中身」をPublicなGitHub repositoryのルートへアップロード
3. `.github/workflows/pages.yml` が存在することを確認
4. `Settings → Pages → Source → GitHub Actions`
5. `Actions → Build and deploy Jekyll site`
6. 緑色のチェックが付くまで待つ

ワークフローは `main` ブランチへのpush、またはActions画面からの手動実行で起動します。

## Pages CMS

`.pages.yml` はリポジトリのルートにあります。

Pages CMSでGitHubログイン後、このrepositoryを接続すると、

- Photographs
- Journal

をブラウザから編集できます。

写真のDetailsは固定のFILM / CAMERA / PLACE / DATEではなく、写真ごとに自由に記述できます。

## ロゴ

`assets/images/parasol-memo-logo.png`

がトップ左上の時計の上に表示されます。

## サンプル写真

`_works/2026-01-01-example.md` は動作確認用です。
サイト公開後にPages CMSから削除または置き換えてください。
