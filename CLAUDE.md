# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト構成

DjangoバックエンドとReactフロントエンドで構築されたフルスタックアプリケーション：

**バックエンド (Django)**:
- メインのDjangoプロジェクト: `dogTerritoryBattle/` (設定、URL、WSGI/ASGI)
- Djangoアプリ: `dog_territory_battle_game/` (ゲームロジック)
- Django REST FrameworkによるAPI提供
- PostgreSQLデータベース、マイグレーション管理
- テスト駆動開発によるテストコード完備

**フロントエンド (React)**:
- `dog-territory-battle/` ディレクトリに配置
- React 18、React Routerによるナビゲーション
- AxiosでDjangoバックエンドとAPI通信
- プロキシ設定でlocalhost:8000のDjangoサーバーに接続
- Jestによるユニットテスト

## 基本コマンド

### バックエンド (Django)
```bash
# 開発サーバー起動
python manage.py runserver

# マイグレーション実行
python manage.py migrate

# バックエンドテスト実行
python manage.py test dog_territory_battle_game.tests

# 特定のテスト実行
python manage.py test dog_territory_battle_game.tests.test_models

# テストデータ投入
python dog_territory_battle_test_data_20241005.py

# マイグレーションファイル作成
python manage.py makemigrations
```

### フロントエンド (React)
```bash
# フロントエンドディレクトリに移動
cd dog-territory-battle

# 依存関係インストール
npm install

# 開発サーバー起動
npm start

# テスト実行
npm test

# テスト実行（CI用、watch無効）
npm test -- --watchAll=false

# プロダクションビルド
npm build
```

### コード品質
```bash
# Pythonコードフォーマット
black .

# カバレッジ実行
coverage run --source='.' manage.py test dog_territory_battle_game.tests
coverage report
```

## 開発環境セットアップ

1. 仮想環境作成・アクティベート
2. バックエンド依存関係インストール: `pip install -r requirements.txt`
3. フロントエンド依存関係インストール: `cd dog-territory-battle && npm install`
4. PostgreSQLデータベースセットアップ
5. データベース認証情報とDjangoシークレットキーを含む`.env`ファイル作成
6. マイグレーション実行: `python manage.py migrate`
7. テストデータ投入: `python dog_territory_battle_test_data_20241005.py`
8. 両サーバー起動（DjangoバックエンドとReactフロントエンド）

## アーキテクチャの重要なポイント

- Djangoプロジェクトは単一アプリ（`dog_territory_battle_game`）でゲームロジックを管理
- フロントエンドはポート8000で動作するDjangoバックエンドにAPI呼び出しをプロキシ
- データベースモデルは `dog_territory_battle_game/models.py`
- APIシリアライザーは `dog_territory_battle_game/serializers.py`
- テストは `dog_territory_battle_game/tests/` ディレクトリで整理
- CI/CDパイプラインでバックエンドとフロントエンドのテストを並列実行
- settings.pyで設定された特定のPostgreSQLセットアップが必要

## 開発ルール・制約

### コーディング規約
- **Django公式ドキュメント準拠**: Django開発はDjango公式ドキュメントのベストプラクティスに厳密に従う
- **React公式ドキュメント準拠**: React開発はReact公式ドキュメントの推奨パターンに厳密に従う
- **単一責任原則の厳守**: 1つのメソッド・関数は1つの機能のみを持つ（1メソッド = 1機能）
- **関数の分割**: 複数の処理を含む場合は必ず適切な単位で関数を分割する

### セキュリティ制約
- **絶対に以下のファイルを読み取ってはならない**:
  - `.env` ファイル
  - `secrets` を含むファイル名のファイル
  - 認証情報を含む可能性のあるファイル
  - データベース認証情報
  - APIキーやトークンを含むファイル
- これらのファイルへのアクセスが必要な場合は、ユーザーに確認を求める

## 環境変数

`.env`ファイルで設定が必要：
- `DEBUG`: Djangoデバッグモード
- `SECRET_KEY`: Djangoシークレットキー
- `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`: PostgreSQL認証情報
- `DATABASE_HOST`, `DATABASE_PORT`: データベース接続詳細
