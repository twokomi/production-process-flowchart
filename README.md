# 생산 공정 플로우차트 애플리케이션

## 프로젝트 개요
- **이름**: Production Process Flow Chart (CS WIND)
- **목적**: 생산 공정 작업자가 각 단계별 판단 기준을 쉽게 조회할 수 있는 디지털화된 모바일 웹 애플리케이션
- **주요 기능**:
  - **57개 전체 공정 단계** 시각화
  - 인터랙티브 공정 단계 카드 뷰 (흐름별 정렬)
  - 각 단계별 상세 판단 기준(Criteria) 조회
  - 합격/불합격 조건 표시
  - 관련 문서 자료 (작업지침서, 품질기준서, 참고자료) 조회
  - 모바일 최적화 반응형 UI
  - 단계별 화살표로 공정 흐름 시각화

## URLs
- **샌드박스 개발**: https://3000-iiy9r61g9y1paopb06t9t-a402f90a.sandbox.novita.ai
- **로컬 개발**: http://localhost:3000
- **GitHub**: (배포 후 추가 예정)
- **Production**: (Cloudflare Pages 배포 후 추가 예정)

## 현재 완료된 기능

### ✅ 데이터베이스 및 백엔드
- D1 데이터베이스 스키마 설계 및 구현
- RESTful API 백엔드 (Hono 프레임워크)
- 공정 단계 CRUD API
- 판단 기준 및 문서 관리 API
- 플로우 연결 정보 API

### ✅ 프론트엔드 UI
- **전체 공정 단계 시각화**: PDF 기반 57개 단계 표시
- **흐름별 정렬**: position_x, position_y 기반 공정 흐름 순서 표시
- **인터랙티브 카드**: 터치/클릭으로 상세 정보 조회
- **시각적 흐름 표시**: 단계 간 화살표로 공정 연결 표시
- **모바일 반응형 디자인**: 모든 디바이스에 최적화
- **모달 기반 상세 뷰**: 판단 기준 및 문서 조회

### ✅ 공정 단계 (57개)
PDF 플로우차트를 기반으로 구현된 전체 공정:

**초기 단계 (1-6)**
1. START → Preliminary Project Review → Material Sourcing → Material Receiving and Storage → Incoming Inspection

**플레이트 가공 (7-24)**
- Plate Movement and Blasting
- Plate Cutting → Door Segment Rolling → Door Segment Milling → Door Segment Fit-Up
- Plate Beveling → Plate Rolling → Longitudinal Welding
- Flange-to-Can Fit-Up & SAW → Growline Fit-Up & Tack Welding

**용접 공정 (25-37)**
- Circular Welding → Bracket Welding → Flange Correction
- NDT Inspection → Flange Dimension Inspection
- CTQ Quality Inspection → BT Release / WT Start

**세척 및 코팅 (38-48)**
- Wash Bay / Pre-Grit Blast → Grit Blast Bay
- Thermal Spray Coating → Epoxy Coating → Polyurethane Coating

**설치 및 완료 (49-57)**
- Mechanical & Electrical Installation → Firewall Inspection
- Packing & Storage → Loading and Shipping → FINISH

## 기능별 URI 요약

### API 엔드포인트
```
GET  /api/steps              - 모든 공정 단계 조회 (57개)
GET  /api/steps/:id          - 특정 단계 상세 정보 및 판단 기준
GET  /api/criteria/:id       - 특정 판단 기준 및 관련 문서
GET  /api/connections        - 공정 단계 간 연결 정보
POST /api/steps              - 새 공정 단계 생성
POST /api/criteria           - 새 판단 기준 생성
POST /api/documents          - 새 문서 추가
PUT  /api/steps/:id          - 공정 단계 수정
DELETE /api/steps/:id        - 공정 단계 삭제
```

### 웹 페이지
```
/       - 메인 플로우차트 뷰어 (작업자용)
/admin  - 관리자 페이지 (데이터 관리용)
```

## 데이터 아키텍처

### 데이터 모델
1. **process_steps** (57개 단계)
   - id, step_number, step_name, step_type, description
   - position_x, position_y (플로우 레이아웃 위치)
   - 단계 유형: start, process, decision, end

2. **step_criteria** (판단 기준)
   - id, step_id, criteria_title, criteria_description
   - pass_condition, fail_condition, sort_order

3. **criteria_documents** (관련 문서)
   - id, criteria_id, document_type, title, description
   - file_url, file_content, mime_type
   - 문서 유형: work_instruction, quality_spec, reference, image, video

4. **flow_connections** (단계 간 연결)
   - id, from_step_id, to_step_id, condition_type, label
   - 조건 유형: yes, no, pass, fail, next

### 스토리지 서비스
- **Cloudflare D1**: SQLite 기반 글로벌 분산 데이터베이스
- **로컬 개발**: `.wrangler/state/v3/d1` 디렉토리에 로컬 SQLite

## 사용자 가이드

### 작업자용 (메인 페이지)
1. 웹 브라우저에서 애플리케이션 접속
2. **공정 흐름별로 정렬된** 단계 카드 확인
3. 확인하고 싶은 공정 단계 카드 클릭/터치
4. 모달 창에서 해당 단계의 **판단 기준** 확인
5. 각 판단 기준의 **"관련 자료 보기"** 버튼 클릭
6. 작업지침서, 품질기준서, 참고자료 등 확인

### 시각적 특징
- **흐름별 행 구성**: 같은 행에 있는 단계들이 순차적으로 진행
- **화살표 표시**: 단계 간 진행 방향을 명확하게 표시
- **색상 구분**:
  - 🔵 **파랑**: 시작 (START)
  - 🟣 **보라**: 공정 단계 (Process)
  - 🔴 **분홍**: 판단 단계 (Decision)
  - 🟢 **초록**: 종료 (FINISH)

### 관리자용
- `/admin` 페이지에서 API 엔드포인트 목록 확인
- REST API를 통해 단계, 판단 기준, 문서 데이터 관리

## 기술 스택
- **백엔드**: Hono (TypeScript)
- **프론트엔드**: Vanilla JavaScript + Tailwind CSS + Custom CSS
- **데이터베이스**: Cloudflare D1 (SQLite)
- **배포**: Cloudflare Pages
- **개발 도구**: Vite, Wrangler, PM2

## 로컬 개발 가이드

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 데이터베이스 마이그레이션 및 시딩
npm run db:migrate:local
npm run db:seed

# 또는 데이터베이스 초기화
npm run db:reset

# 빌드
npm run build

# PM2로 개발 서버 시작
pm2 start ecosystem.config.cjs

# 또는 직접 실행
npm run dev:sandbox
```

### 유용한 명령어
```bash
# 포트 3000 정리
npm run clean-port

# PM2 관리
pm2 list                    # 상태 확인
pm2 logs webapp --nostream  # 로그 확인
pm2 restart webapp          # 재시작
pm2 delete webapp           # 중지
```

## 구현되지 않은 기능 (향후 개발)

### 우선순위 높음
- [ ] **실제 문서 파일 업로드**: R2 스토리지 연동하여 PDF/이미지 업로드
- [ ] **관리자 UI 개발**: 웹 기반 데이터 관리 페이지
- [ ] **검색 기능**: 단계명, 판단 기준으로 검색
- [ ] **모든 단계에 판단 기준 추가**: 현재 샘플만 존재

### 우선순위 중간
- [ ] **SVG 기반 플로우차트**: 더 정교한 그래프 시각화
- [ ] **사용자 인증**: 작업자/관리자 권한 관리
- [ ] **변경 이력**: 누가 언제 무엇을 수정했는지 추적
- [ ] **즐겨찾기**: 자주 보는 단계 북마크
- [ ] **오프라인 모드**: PWA 구현

### 우선순위 낮음
- [ ] **다국어 지원**: 영어, 중국어 등
- [ ] **PDF 내보내기**: 플로우차트 PDF 생성
- [ ] **통계 대시보드**: 조회 빈도 등
- [ ] **알림 기능**: 기준 변경 시 알림

## 권장 다음 단계

### 1. 실제 작업 문서 연동 (최우선)
- 실제 작업지침서 PDF 파일 업로드
- 품질 기준서 및 참고자료 연동
- Cloudflare R2 스토리지 설정

### 2. 모든 단계에 판단 기준 추가
- 현재 샘플로만 존재하는 판단 기준을 전체 단계로 확대
- 실제 작업 현장의 기준을 데이터베이스에 입력

### 3. 관리자 UI 개발
- 웹 기반 관리 페이지로 쉽게 데이터 입력/수정
- WYSIWYG 에디터로 판단 기준 작성
- 파일 업로드 인터페이스

### 4. 실제 현장 테스트
- 작업자들에게 시범 사용
- 피드백 수집 및 UI/UX 개선
- 모바일 접근성 테스트

### 5. Cloudflare Pages 배포
- 프로덕션 환경에 배포
- 실제 도메인 연결
- 성능 모니터링

## 배포 상태
- **플랫폼**: Cloudflare Pages (준비 완료)
- **상태**: 🟢 로컬 개발 완료 / 배포 준비 완료
- **최종 업데이트**: 2026-01-07

## 데이터 현황
- **공정 단계**: 57개 (전체 공정)
- **판단 기준**: 27개 (주요 단계 샘플)
- **관련 문서**: 16개 (샘플)
- **플로우 연결**: 71개 (단계 간 연결)

## 소스 파일
- **PDF 원본**: `/home/user/uploaded_files/Production Process Flow Chart.pdf`
- **프로젝트 경로**: `/home/user/webapp/`

## 주요 개선 사항 (v2)
✅ PDF 기반 전체 57개 공정 단계 구현
✅ 플로우 흐름별 시각적 정렬 (position_x, position_y 기반)
✅ 단계 간 화살표로 공정 연결 표시
✅ 개선된 CSS 스타일 (외부 파일로 분리)
✅ 모달 내 판단 기준 토글 기능
✅ 문서 유형별 아이콘 및 배지
✅ 모바일 반응형 개선

## 라이선스
MIT License

## 연락처
프로젝트 관련 문의사항이 있으시면 GitHub 이슈를 통해 연락 주세요.
