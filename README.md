# SH드림타워 운영형 포털 (React + API + 관리자 업로드)

## 구성
- client: React(Vite) 프론트엔드
- server: Express API + 엑셀 업로드 반영
- 이미지: SHDREAMTOWER.png 사용

## 1) 사전 준비
- Node.js 22.12 이상 설치

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

배포 URL
- 사용자/조직 페이지: https://<owner>.github.io/
- 프로젝트 페이지: https://<owner>.github.io/<repo>/

## 보안 운영 (2026-10-22)
- 공개 Pages는 조회용 정적 사이트입니다. 관리자 API는 별도 서버에서 실행해야 합니다.
- 이전 화면 비밀번호와 세션 플래그는 폐기했습니다. 과거 비밀번호를 다른 서비스에서 재사용했다면 해당 서비스에서도 교체하세요.
- 관리자 기능은 서버의 `ADMIN_TOKEN_SHA256`이 없으면 503으로 차단됩니다.
- 운영자가 비밀 관리 도구에서 임의의 32바이트 이상 URL-safe 토큰을 생성하고 SHA-256(hex)을 서버 환경변수에 설정하세요. 원문 토큰은 관리자에게만 전달하고 저장소·VITE 변수·로그에 넣지 마세요.
- 토큰은 매 요청의 Authorization Bearer 헤더로 검증되며 브라우저 영구 저장소/쿠키에는 저장하지 않습니다. 로그아웃·새로고침 시 다시 인증합니다.
- `ALLOWED_ORIGINS`에 허용할 정확한 프론트엔드 origin을 쉼표로 지정하세요. 예: `https://roknnaoms-hub.github.io`. 이는 인증을 대체하지 않습니다.
- 서버 기본 바인딩은 `127.0.0.1`입니다. 운영 시 HTTPS 역방향 프록시 뒤에 두고 외부에서 API 포트에 직접 접속할 수 없게 하세요. HTTPS 주소만 `VITE_API_BASE_URL`에 설정합니다.
- 업로드는 인증 후 최대 2MB, 파일 1개, 2,000행으로 제한됩니다. 파서는 별도 Worker에서 시간/메모리 제한을 적용하며 업로드 파일을 디스크에 남기지 않습니다.
- `server`: `npm ci`, `npm test`. `client`: `npm ci`, `npm run build`.
- SheetJS는 npm의 오래된 배포 대신 공식 CDN 0.20.3을 lockfile 무결성 값과 함께 사용합니다. 공식 보안 공지의 후속 버전을 확인하세요.

