# Node.js イメージを使用
FROM node:18

# 作業ディレクトリ
WORKDIR /app

# 依存関係をコピーしてインストール
COPY package.json package-lock.json ./
RUN npm install

# ソースコードをコピー
COPY . .

# 開発モードで起動
CMD ["npm", "start"]

# ポート3000を開放
EXPOSE 3000