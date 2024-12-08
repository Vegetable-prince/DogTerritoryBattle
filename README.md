DogTerritoryBattle


DogTerritoryBattle は、Django と React.js を活用したアプリケーションです。本プロジェクトでは、バックエンドとフロントエンドのテスト駆動開発（TDD）を採用し、PostgreSQL を使用しています。


使用技術
	•	バックエンド: Django, Django REST Framework (DRF)
	•	フロントエンド: React.js
	•	データベース: PostgreSQL


テスト:
	•	Django: バックエンドテスト
	•	React.js: フロントエンドテスト (Jest など)


インストール手順
	1.	仮想環境の準備（推奨）

  python -m venv env
  source env/bin/activate  # Linux/Mac
  env\Scripts\activate     # Windows

  
  2.	プロジェクトルートに移動して依存関係をインストール
  
  cd DogTerritoryBattle/dogTerritoryBattle
  pip install -r requirements.txt


  3.	フロントエンドディレクトリに移動し、npm でパッケージをインストールします
  
  cd dog-territory-battle
  npm install


  4.	データベースの準備
  •	PostgreSQL をセットアップしてください。
  •	デフォルトでは settings.py の 80 行目に記載されているデータベース設定が使用されます。
  •	他のデータベースを使用する場合、動作に影響が出る可能性があるため注意してください。


  5.	.env ファイルの作成
  プロジェクトのルート (DogTerritoryBattle/dogTerritoryBattle) に .env ファイルを作成し、以下の環境変数を記述します：
  
  DEBUG=True
  SECRET_KEY=<Your-Secret-Key>
  DATABASE_NAME=<Your-Database-Name>
  DATABASE_USER=<Your-Database-User>
  DATABASE_PASSWORD=<Your-Database-Password>
  DATABASE_HOST=<Your-Database-Host>
  DATABASE_PORT=<Your-Database-Port>


  注:
  	•	SECRET_KEY はpython -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"コマンドで生成できます。
  	•	このキーが設定されていないとアプリケーションは動作しません。


  6.	以下のスクリプトを実行してテストデータを挿入します
  
  python dog_territory_battle_test_data_20241005.py


  7.	サーバーの起動
  •	バックエンドサーバー:
  DogTerritoryBattle/dogTerritoryBattle で以下を実行

  python manage.py runserver


  •	フロントエンドサーバー:
  別のターミナルで dog-territory-battle ディレクトリに移動し、以下を実行

  npm start


  自動的にブラウザでアプリケーションが開きます。

