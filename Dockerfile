# Pythonの公式イメージを使用
FROM python:3.10

# 作業ディレクトリを指定
WORKDIR /dogTerritoryBattle

# 必要なファイルをコピー
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ソースコードをコピー
COPY . .

# ポートを開放
EXPOSE 8000

# サーバーを起動
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]