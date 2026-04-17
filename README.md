# SH드림타워 운영형 포털 (React + API + 관리자 업로드)

## 구성
- client: React(Vite) 프론트엔드
- server: Express API + 엑셀 업로드 반영
- 이미지: SHDREAMTOWER.png 사용

## 1) 사전 준비
- Node.js 20 이상 설치

## 2) 서버 실행
1. server 폴더로 이동
2. npm install
3. npm run dev

기본 주소: http://localhost:4100

## 3) 프론트엔드 실행
1. client 폴더로 이동
2. npm install
3. .env.example을 복사해 .env 생성(선택)
4. npm run dev

기본 주소: http://localhost:5173

## 4) API
- GET /api/health
- GET /api/floors
- GET /api/floors/:floorCode/tenants
- GET /api/tenants?keyword=검색어
- GET /api/tenants/:id
- POST /api/admin/tenants
- POST /api/admin/tenants/import (multipart form-data, file)

## 5) 업로드 템플릿
- server/data/tenant_import_template.csv
- 컬럼: floorCode, unit, name 필수

## 6) 주요 파일
- client/src/App.jsx
- client/public/SHDREAMTOWER.png
- server/src/index.js
- server/data/tenants.json

## 7) GitHub Pages 배포
- 워크플로 파일: .github/workflows/deploy-pages.yml
- main 브랜치에 push하면 자동 배포

필수 설정
1. GitHub 저장소 Settings > Pages > Source: GitHub Actions
2. (선택) 저장소 Settings > Secrets and variables > Actions > Variables
	- VITE_API_BASE_URL: 운영 API 주소
	- VITE_ADMIN_PASSWORD: 관리자 비밀번호(특수기호 포함 8자리)

배포 URL
- 사용자/조직 페이지: https://<owner>.github.io/
- 프로젝트 페이지: https://<owner>.github.io/<repo>/
