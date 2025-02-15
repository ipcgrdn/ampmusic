FROM node:18-alpine

WORKDIR /app

# 루트 레벨 package.json 복사
COPY package*.json ./
COPY turbo.json ./

# 클라이언트 앱 package.json 복사
COPY apps/client/package*.json ./apps/client/

# 공유 패키지가 있다면 복사
COPY packages/ ./packages/

# 의존성 설치
RUN npm install

# 클라이언트 소스 코드 복사
COPY apps/client ./apps/client

# 빌드
RUN npm run build --workspace=apps/client

WORKDIR /app/apps/client

EXPOSE 3000

CMD ["npm", "start"]
