# GitHub Pages セットアップ

このファイルは「GitHub」という名前のフォルダではありません。
GitHub Actions の設定は、サイトのルートにある **`.github/workflows/pages.yml`** に入っています。

## フォルダ構成

```text
PARASOL MEMO
├── .github/
│   └── workflows/
│       └── pages.yml          ← GitHub Pagesを自動公開する設定
├── _layouts/
├── _posts/
├── _works/
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
├── about/
├── journal/
├── .pages.yml                 ← Pages CMSの設定
├── _config.yml                ← Jekyllの設定
├── index.html                 ← トップページ
└── README.md
```

### `.github` が見えない場合

`.github` は「ドットで始まる隠しフォルダ」です。Finderなどの設定によっては見えないことがあります。

**サイトを動かすために `.github` を名前変更したり、作り直したりしないでください。**

GitHubにアップロードしたあと、リポジトリのファイル一覧で `.github` が見えない場合は、GitHubの検索欄で `pages.yml` を検索してください。

正しい場所は、

```text
.github/workflows/pages.yml
```

です。

## GitHubへのアップロード

1. ZIPを解凍する
2. 解凍したフォルダの「中身」をGitHubリポジトリの一番上にアップロードする
3. `index.html` と `.github` が同じ階層にあることを確認
4. `Commit changes`
5. GitHubの `Actions` を開く
6. `Build and deploy Jekyll site` が表示されることを確認

## Pages設定

GitHubリポジトリの

**Settings → Pages → Build and deployment → Source**

を **GitHub Actions** にします。

このサイトは `main` ブランチへの push、またはActions画面からの手動実行でデプロイされます。

## 手動実行

Actions → **Build and deploy Jekyll site** → **Run workflow**

から手動で実行できます。

---
