# 생산 공정 플로우차트 애플리케이션

## 프로젝트 개요
- **이름**: Production Process Flow Chart
- **목적**: 생산 공정 작업자가 각 단계별 판단 기준을 쉽게 조회할 수 있는 디지털화된 모바일 웹 애플리케이션
- **주요 기능**:
  - 인터랙티브 공정 단계 카드 뷰
  - 각 단계별 상세 판단 기준(Criteria) 조회
  - 합격/불합격 조건 표시
  - 관련 문서 자료 (작업지침서, 품질기준서, 참고자료) 조회
  - 모바일 최적화 UI

## 현재 완료된 기능
✅ D1 데이터베이스 스키마 설계 및 구현
✅ RESTful API 백엔드 (Hono 프레임워크)
✅ 공정 단계 CRUD API
✅ 판단 기준 및 문서 관리 API
✅ 모바일 반응형 프론트엔드 UI
✅ 인터랙티브 단계 카드 (터치/클릭 가능)
✅ 모달 기반 상세 정보 표시
✅ 샘플 데이터 생성 및 테스트

## 데이터 아키텍처

### 데이터 모델
1. **process_steps**: 공정 단계 정보
   - id, step_number, step_name, step_type, description
   - 단계 유형: start, process, decision, end

2. **step_criteria**: 각 단계별 판단 기준
   - id, step_id, criteria_title, criteria_description
   - pass_condition, fail_condition

3. **criteria_documents**: 판단 기준별 관련 문서
   - id, criteria_id, document_type, title, description
   - file_url, file_content
   - 문서 유형: work_instruction, quality_spec, reference, image, video

4. **flow_connections**: 단계 간 연결 정보
   - id, from_step_id, to_step_id, condition_type

### 스토리지 서비스
- **Cloudflare D1**: SQLite 기반 글로벌 분산 데이터베이스
- **로컬 개발**: `.wrangler/state/v3/d1` 디렉토리에 로컬 SQLite 사용

## 기능별 URI 요약

### API 엔드포인트
- `GET /api/steps` - 모든 공정 단계 조회
- `GET /api/steps/:id` - 특정 단계 상세 정보 및 판단 기준 조회
- `GET /api/criteria/:id` - 특정 판단 기준 및 관련 문서 조회
- `GET /api/connections` - 공정 단계 간 연결 정보 조회
- `POST /api/steps` - 새 공정 단계 생성
- `POST /api/criteria` - 새 판단 기준 생성
- `POST /api/documents` - 새 문서 추가
- `PUT /api/steps/:id` - 공정 단계 수정
- `DELETE /api/steps/:id` - 공정 단계 삭제

### 웹 페이지
- `/` - 메인 플로우차트 뷰어 (작업자용)
- `/admin` - 관리자 페이지 (데이터 관리용)

## URLs
- **로컬 개발**: http://localhost:3000
- **샌드박스**: https://3000-iiy9r61g9y1paopb06t9t-a402f90a.sandbox.novita.ai
- **GitHub**: (배포 후 추가 예정)
- **Production**: (Cloudflare Pages 배포 후 추가 예정)

## 사용자 가이드

### 작업자용 (메인 페이지)
1. 웹 브라우저에서 애플리케이션 접속
2. 공정 단계 카드 목록에서 확인하고 싶은 단계 클릭/터치
3. 모달 창에서 해당 단계의 판단 기준 확인
4. 각 판단 기준의 "관련 자료 보기" 버튼 클릭
5. 작업지침서, 품질기준서, 참고자료 등 확인

### 관리자용
- `/admin` 페이지에서 API 엔드포인트 목록 확인
- REST API를 통해 단계, 판단 기준, 문서 데이터 관리
- 예시 데이터는 `seed.sql` 파일 참고

## 기술 스택
- **백엔드**: Hono (TypeScript)
- **프론트엔드**: Vanilla JavaScript + Tailwind CSS
- **데이터베이스**: Cloudflare D1 (SQLite)
- **배포**: Cloudflare Pages
- **개발 도구**: Vite, Wrangler, PM2

## 로컬 개발 가이드

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 데이터베이스 마이그레이션
npm run db:migrate:local

# 샘플 데이터 추가
npm run db:seed

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

# 데이터베이스 초기화
npm run db:reset

# PM2 상태 확인
pm2 list

# PM2 로그 확인
pm2 logs webapp --nostream

# PM2 재시작
pm2 restart webapp

# PM2 중지
pm2 delete webapp
```

## 구현되지 않은 기능 (향후 개발)

### 우선순위 높음
- [ ] 관리자 UI 개발 (웹 기반 데이터 관리 페이지)
- [ ] 파일 업로드 기능 (문서 및 이미지)
- [ ] 실제 플로우차트 그래프 시각화 (SVG/Canvas)
- [ ] 검색 기능 (단계명, 판단 기준으로 검색)

### 우선순위 중간
- [ ] 사용자 인증 및 권한 관리
- [ ] 변경 이력 관리 (누가 언제 무엇을 변경했는지)
- [ ] 즐겨찾기 기능 (자주 보는 단계 북마크)
- [ ] 오프라인 모드 지원 (PWA)

### 우선순위 낮음
- [ ] 다국어 지원 (영어, 중국어 등)
- [ ] PDF 내보내기 기능
- [ ] 통계 대시보드 (조회 빈도 등)
- [ ] 알림 기능 (기준 변경 시 알림)

## 권장 다음 단계

1. **실제 플로우차트 이미지 연동**
   - 업로드하신 플로우차트 이미지를 기반으로 더 많은 단계 데이터 입력
   - 실제 작업 지침서 및 품질 기준서 PDF 파일 연동

2. **파일 업로드 기능 구현**
   - Cloudflare R2 스토리지 연동
   - 문서 파일 업로드/다운로드 기능

3. **관리자 UI 개발**
   - 웹 기반 관리 페이지로 쉽게 데이터 입력/수정
   - WYSIWYG 에디터로 판단 기준 작성

4. **실제 현장 테스트**
   - 작업자들에게 시범 사용
   - 피드백 수집 및 UI/UX 개선

5. **Cloudflare Pages 배포**
   - 프로덕션 환경에 배포
   - 실제 도메인 연결

## 배포 상태
- **플랫폼**: Cloudflare Pages (준비 완료)
- **상태**: 🟡 로컬 개발 완료 / 배포 대기
- **최종 업데이트**: 2026-01-07

## 데이터베이스 스키마

### process_steps
```sql
CREATE TABLE process_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  step_number TEXT UNIQUE NOT NULL,
  step_name TEXT NOT NULL,
  step_type TEXT NOT NULL,
  description TEXT,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### step_criteria
```sql
CREATE TABLE step_criteria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  step_id INTEGER NOT NULL,
  criteria_title TEXT NOT NULL,
  criteria_description TEXT,
  pass_condition TEXT,
  fail_condition TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (step_id) REFERENCES process_steps(id) ON DELETE CASCADE
);
```

### criteria_documents
```sql
CREATE TABLE criteria_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  criteria_id INTEGER NOT NULL,
  document_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_content TEXT,
  mime_type TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (criteria_id) REFERENCES step_criteria(id) ON DELETE CASCADE
);
```

## 라이선스
MIT License

## 연락처
프로젝트 관련 문의사항이 있으시면 GitHub 이슈를 통해 연락 주세요.
