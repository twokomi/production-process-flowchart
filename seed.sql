-- Clear existing data
DELETE FROM flow_connections;
DELETE FROM criteria_documents;
DELETE FROM step_criteria;
DELETE FROM process_steps;

-- Insert all process steps from PDF in correct flow order
INSERT INTO process_steps (step_number, step_name, step_type, description, position_x, position_y) VALUES
-- Row 1: Start and initial review
('START', 'START', 'start', '생산 공정 시작', 0, 0),
('1', 'Preliminary Project Review', 'process', '초기 프로젝트 검토', 1, 0),
('2', 'Acceptable?', 'decision', '프로젝트 수용 가능 여부 판단', 2, 0),

-- Row 2: Material sourcing
('3', 'Material Sourcing', 'process', '자재 소싱', 0, 1),
('4', 'Acceptable?', 'decision', '자재 수용 가능 여부 판단', 1, 1),
('5', 'Material Receiving and Storage', 'process', '자재 입고 및 보관', 2, 1),

-- Row 3: Incoming inspection
('6', 'Incoming Inspection', 'decision', '입고 검사', 0, 2),
('7', 'Plate Movement and Plate Blasting', 'process', '플레이트 이동 및 블라스팅', 1, 2),
('8', 'Operator Verification', 'decision', '작업자 확인', 2, 2),

-- Row 4: Plate cutting and door segment
('9', 'Plate Cutting', 'process', '플레이트 절단', 0, 3),
('10', 'Operator Verification', 'decision', '작업자 확인', 1, 3),
('11', 'Door Segment Rolling', 'process', '도어 세그먼트 롤링', 0, 4),
('12', 'Operator Verification', 'decision', '작업자 확인', 1, 4),

-- Row 5: Additional processes
('13', 'Door Segment Milling', 'process', '도어 세그먼트 밀링', 0, 5),
('14', 'Operator Verification', 'decision', '작업자 확인', 1, 5),
('15', 'Plate Beveling', 'process', '플레이트 베벨링', 2, 3),
('16', 'Operator Verification', 'decision', '작업자 확인', 3, 3),

-- Row 6: Rolling and welding
('17', 'Plate Rolling', 'process', '플레이트 롤링', 2, 4),
('18', 'Operator Verification', 'decision', '작업자 확인', 3, 4),
('19', 'Door Segment Fit-Up', 'process', '도어 세그먼트 피트업', 0, 6),
('20', 'Operator Verification', 'decision', '작업자 확인', 1, 6),

-- Row 7: Longitudinal welding
('21', 'Longitudinal Welding', 'process', '세로 용접', 2, 5),
('22', 'Operator Verification', 'decision', '작업자 확인', 3, 5),
('23', 'Flange-to-Can Fit-Up & SAW', 'process', '플랜지-캔 피트업 및 SAW', 2, 6),
('24', 'Operator Verification', 'decision', '작업자 확인', 3, 6),

-- Row 8: Welding processes
('25', 'Growline Fit-Up & Tack Welding', 'process', '그로우라인 피트업 및 택 용접', 2, 7),
('26', 'Operator Verification', 'decision', '작업자 확인', 3, 7),
('27', 'Circular Welding', 'process', '원형 용접', 0, 7),
('28', 'Operator Verification', 'decision', '작업자 확인', 1, 7),

-- Row 9: Bracket welding
('29', 'Bracket Welding', 'process', '브라켓 용접', 0, 8),
('30', 'Operator Verification', 'decision', '작업자 확인', 1, 8),
('31', 'Flange Correction', 'process', '플랜지 보정', 2, 8),

-- Row 10: Welding failures and inspections
('32', 'Circular Weld Failure', 'decision', '원형 용접 실패', 0, 9),
('33', 'Bracket Weld Failure', 'decision', '브라켓 용접 실패', 1, 9),
('34', 'NDT Inspection', 'decision', 'NDT 검사', 2, 9),
('35', 'Flange Dim. Inspection', 'decision', '플랜지 치수 검사', 3, 9),

-- Row 11: Quality inspections
('36', 'CTQ Quality Inspection', 'decision', 'CTQ 품질 검사', 0, 10),
('37', 'BT Release / WT Start', 'decision', 'BT 해제 / WT 시작', 1, 10),

-- Row 12: Wash and blast
('38', 'Wash Bay / Pre-Grit Blast', 'process', '세척 베이 / 프리-그릿 블라스트', 2, 10),
('39', 'Quality Inspection', 'decision', '품질 검사', 3, 10),
('40', 'WT Release / IM Start', 'decision', 'WT 해제 / IM 시작', 2, 11),

-- Row 13: Grit blast and coating
('41', 'Grit Blast Bay', 'process', '그릿 블라스트 베이', 0, 11),
('42', 'Quality Inspection', 'decision', '품질 검사', 1, 11),
('43', 'Thermal Spray Coating', 'process', '열 스프레이 코팅', 2, 12),
('44', 'Quality Inspection', 'decision', '품질 검사', 3, 12),

-- Row 14: Additional coatings
('45', 'Epoxy Coating', 'process', '에폭시 코팅', 0, 13),
('46', 'Quality Inspection', 'decision', '품질 검사', 1, 13),
('47', 'Polyurethane Coating', 'process', '폴리우레탄 코팅', 2, 13),
('48', 'CTQ Quality Inspection', 'decision', 'CTQ 품질 검사', 3, 13),

-- Row 15: Installation and final inspection
('49', 'IM Release / Packaging and Storage Start', 'decision', 'IM 해제 / 포장 및 보관 시작', 0, 14),
('50', 'Mechanical & Electrical Installation', 'process', '기계 및 전기 설치', 1, 14),
('51', 'Quality Inspection', 'decision', '품질 검사', 2, 14),
('52', 'Firewall Inspection', 'decision', '방화벽 검사', 3, 14),

-- Row 16: Final stages
('53', 'Packing & Storage', 'process', '포장 및 보관', 0, 15),
('54', 'Operator Verification', 'decision', '작업자 확인', 1, 15),
('55', 'Packaging and Storage Release / Loading and Shipping', 'process', '포장 및 보관 해제 / 적재 및 배송', 2, 15),
('FINISH', 'FINISH', 'end', '생산 공정 완료', 3, 15);

-- Insert sample criteria for key decision points
-- Step 2: Preliminary Project Review - Acceptable?
INSERT INTO step_criteria (step_id, criteria_title, criteria_description, pass_condition, fail_condition, sort_order) VALUES
(3, '프로젝트 사양 적합성', '고객 요구사항과 프로젝트 사양 일치 여부', '모든 사양이 제작 가능 범위 내', '사양 제작 불가능 또는 기준 미달', 1),
(3, '자재 가용성', '필요 자재의 공급 가능 여부', '모든 자재 공급 가능', '핵심 자재 공급 불가', 2),
(3, '일정 검토', '납기일 준수 가능 여부', '일정 내 완료 가능', '일정 준수 불가', 3);

-- Step 4: Material Sourcing - Acceptable?
INSERT INTO step_criteria (step_id, criteria_title, criteria_description, pass_condition, fail_condition, sort_order) VALUES
(5, '자재 품질 기준', '입고 자재 품질 기준 충족 여부', '품질 기준 충족', '품질 기준 미달', 1),
(5, '자재 규격 확인', '자재 규격 도면 일치 여부', '규격 일치', '규격 불일치', 2),
(5, '수량 확인', '주문 수량과 입고 수량 일치', '수량 일치', '수량 불일치', 3);

-- Step 6: Incoming Inspection
INSERT INTO step_criteria (step_id, criteria_title, criteria_description, pass_condition, fail_condition, sort_order) VALUES
(7, '외관 검사', '자재 표면 결함 여부', '결함 없음', '긁힘, 변형, 오염 발견', 1),
(7, '치수 검사', '자재 치수 허용 공차 확인', '모든 치수 공차 내', '치수 공차 초과', 2),
(7, '성적서 확인', '밀테스트 성적서 및 품질 문서', '성적서 적합', '성적서 부적합', 3);

-- Step 8: Operator Verification (Plate Movement)
INSERT INTO step_criteria (step_id, criteria_title, criteria_description, pass_condition, fail_condition, sort_order) VALUES
(9, '작업자 자격', '해당 공정 수행 자격 보유', '자격 보유', '자격 미보유', 1),
(9, '장비 상태', '작업 장비 정상 작동', '장비 정상', '장비 이상', 2),
(9, '안전 장비', '필수 안전 장비 착용', '모두 착용', '미착용', 3);

-- Step 10: Operator Verification (Plate Cutting)
INSERT INTO step_criteria (step_id, criteria_title, criteria_description, pass_condition, fail_condition, sort_order) VALUES
(11, '절단 품질', '절단면 상태 및 버(burr) 확인', '품질 양호', '절단면 불량', 1),
(11, '치수 정확도', '절단 치수 도면 일치', '치수 일치', '치수 불일치', 2),
(11, '표면 상태', '절단 작업 중 표면 손상', '손상 없음', '긁힘, 변형 발견', 3);

-- Step 34: NDT Inspection
INSERT INTO step_criteria (step_id, criteria_title, criteria_description, pass_condition, fail_condition, sort_order) VALUES
(35, 'RT 검사', 'Radiographic Testing 결과', 'RT 합격', 'RT 불합격', 1),
(35, 'UT 검사', 'Ultrasonic Testing 결과', 'UT 합격', 'UT 불합격', 2),
(35, 'MT 검사', 'Magnetic Testing 결과', 'MT 합격', 'MT 불합격', 3);

-- Step 35: Flange Dimension Inspection
INSERT INTO step_criteria (step_id, criteria_title, criteria_description, pass_condition, fail_condition, sort_order) VALUES
(36, '플랜지 직경', '플랜지 외경 및 내경 측정', '공차 범위 내', '공차 초과', 1),
(36, '평면도', '플랜지 평면도 측정', '기준 충족', '기준 미달', 2),
(36, '볼트 홀 위치', '볼트 홀 위치 및 간격', '위치 정확', '위치 불량', 3);

-- Step 36: CTQ Quality Inspection
INSERT INTO step_criteria (step_id, criteria_title, criteria_description, pass_condition, fail_condition, sort_order) VALUES
(37, 'Critical to Quality 항목', '주요 품질 특성 확인', '모든 CTQ 항목 합격', 'CTQ 항목 불합격', 1),
(37, '치수 정밀도', '주요 치수 측정', '정밀도 기준 충족', '정밀도 미달', 2),
(37, '표면 품질', '표면 마감 상태', '품질 기준 충족', '품질 기준 미달', 3);

-- Step 52: Firewall Inspection
INSERT INTO step_criteria (step_id, criteria_title, criteria_description, pass_condition, fail_condition, sort_order) VALUES
(53, '방화벽 설치', '방화벽 올바른 설치 확인', '설치 적합', '설치 부적합', 1),
(53, '밀봉 상태', '방화벽 밀봉재 상태', '밀봉 양호', '밀봉 불량', 2),
(53, '내화 성능', '방화벽 내화 성능 확인', '성능 기준 충족', '성능 미달', 3);

-- Insert sample documents
INSERT INTO criteria_documents (criteria_id, document_type, title, description, file_url, sort_order) VALUES
-- Project Review documents
(1, 'work_instruction', 'WI-001 프로젝트 검토 절차', '신규 프로젝트 검토 시 확인 체크리스트', '/docs/wi-001-project-review.pdf', 1),
(1, 'quality_spec', 'QS-001 제작 가능 사양 기준', '당사 제작 가능 제품 사양 범위', '/docs/qs-001-manufacturing-spec.pdf', 2),

-- Material Sourcing documents
(4, 'quality_spec', 'QS-002 자재 품질 기준서', '입고 자재 품질 검사 기준', '/docs/qs-002-material-quality.pdf', 1),
(4, 'work_instruction', 'WI-002 자재 검사 절차', '자재 검사 절차 및 방법', '/docs/wi-002-material-inspection.pdf', 2),

-- Incoming Inspection documents
(7, 'quality_spec', 'QS-003 입고 검사 기준서', '입고 검사 합격 기준', '/docs/qs-003-incoming-inspection.pdf', 1),
(7, 'work_instruction', 'WI-003 외관 검사 방법', '외관 결함 판정 기준', '/docs/wi-003-visual-inspection.pdf', 2),
(7, 'reference', 'REF-001 불량 사례집', '자주 발생하는 불량 유형', '/docs/ref-001-defect-examples.pdf', 3),

-- Operator Verification documents
(10, 'work_instruction', 'WI-004 작업자 자격 관리', '공정별 필요 자격 요건', '/docs/wi-004-operator-qualification.pdf', 1),
(10, 'reference', 'REF-002 안전 작업 수칙', '작업장 안전 수칙', '/docs/ref-002-safety-rules.pdf', 2),

-- NDT Inspection documents
(19, 'quality_spec', 'QS-004 NDT 검사 기준', 'NDT 합격 기준', '/docs/qs-004-ndt-standard.pdf', 1),
(19, 'work_instruction', 'WI-005 NDT 검사 절차', '비파괴 검사 수행 방법', '/docs/wi-005-ndt-procedure.pdf', 2),
(19, 'reference', 'REF-003 NDT 결함 판정', 'NDT 결함 유형 및 판정', '/docs/ref-003-ndt-defects.pdf', 3),

-- CTQ Quality Inspection documents
(22, 'quality_spec', 'QS-005 CTQ 품질 기준', 'Critical to Quality 항목 기준', '/docs/qs-005-ctq-standard.pdf', 1),
(22, 'work_instruction', 'WI-006 CTQ 검사 절차', 'CTQ 검사 수행 절차', '/docs/wi-006-ctq-procedure.pdf', 2),

-- Firewall Inspection documents
(25, 'quality_spec', 'QS-006 방화벽 검사 기준', '방화벽 설치 및 성능 기준', '/docs/qs-006-firewall-standard.pdf', 1),
(25, 'work_instruction', 'WI-007 방화벽 검사 절차', '방화벽 검사 수행 방법', '/docs/wi-007-firewall-inspection.pdf', 2);

-- Insert flow connections (main flow path)
INSERT INTO flow_connections (from_step_id, to_step_id, condition_type, label) VALUES
-- Main flow
(1, 2, 'next', NULL),
(2, 3, 'yes', 'Acceptable'),
(2, 1, 'no', 'Review Again'),
(3, 4, 'next', NULL),
(4, 5, 'yes', 'Acceptable'),
(4, 3, 'no', 'Re-source'),
(5, 6, 'next', NULL),
(6, 7, 'yes', 'Pass'),
(6, 5, 'no', 'Return'),
(7, 8, 'next', NULL),
(8, 9, 'yes', 'Verified'),
(8, 7, 'no', 'Retry'),

-- Plate cutting path
(9, 10, 'next', NULL),
(10, 11, 'yes', 'Verified'),
(10, 9, 'no', 'Recut'),
(11, 12, 'next', NULL),
(12, 13, 'yes', 'Verified'),
(12, 11, 'no', 'Re-roll'),
(13, 14, 'next', NULL),
(14, 19, 'yes', 'Verified'),
(14, 13, 'no', 'Re-mill'),

-- Beveling path
(9, 15, 'next', 'Parallel'),
(15, 16, 'next', NULL),
(16, 17, 'yes', 'Verified'),
(16, 15, 'no', 'Re-bevel'),
(17, 18, 'next', NULL),
(18, 21, 'yes', 'Verified'),
(18, 17, 'no', 'Re-roll'),

-- Door segment fit-up path
(19, 20, 'next', NULL),
(20, 23, 'yes', 'Verified'),
(20, 19, 'no', 'Refit'),

-- Longitudinal welding path
(21, 22, 'next', NULL),
(22, 23, 'yes', 'Verified'),
(22, 21, 'no', 'Reweld'),

-- Flange fit-up path
(23, 24, 'next', NULL),
(24, 25, 'yes', 'Verified'),
(24, 23, 'no', 'Refit'),

-- Growline welding path
(25, 26, 'next', NULL),
(26, 27, 'yes', 'Verified'),
(26, 25, 'no', 'Reweld'),

-- Circular welding path
(27, 28, 'next', NULL),
(28, 29, 'yes', 'Verified'),
(28, 32, 'no', 'Check Failure'),

-- Bracket welding path
(29, 30, 'next', NULL),
(30, 31, 'yes', 'Verified'),
(30, 33, 'no', 'Check Failure'),

-- Failure checks and corrections
(32, 27, 'fail', 'Repair Circular Weld'),
(33, 29, 'fail', 'Repair Bracket Weld'),
(31, 34, 'next', NULL),

-- NDT and dimension inspection
(34, 35, 'pass', 'Pass'),
(34, 31, 'fail', 'Correction Required'),
(35, 36, 'pass', 'Pass'),
(35, 31, 'fail', 'Correction Required'),

-- CTQ inspection
(36, 37, 'pass', 'Pass'),
(36, 31, 'fail', 'Rework'),

-- Wash and blast
(37, 38, 'yes', 'BT Release'),
(38, 39, 'next', NULL),
(39, 40, 'pass', 'Pass'),
(39, 38, 'fail', 'Re-wash'),

-- Grit blast
(40, 41, 'yes', 'WT Release'),
(41, 42, 'next', NULL),
(42, 43, 'pass', 'Pass'),
(42, 41, 'fail', 'Re-blast'),

-- Thermal spray coating
(43, 44, 'next', NULL),
(44, 45, 'pass', 'Pass'),
(44, 43, 'fail', 'Re-coat'),

-- Epoxy coating
(45, 46, 'next', NULL),
(46, 47, 'pass', 'Pass'),
(46, 45, 'fail', 'Re-coat'),

-- Polyurethane coating
(47, 48, 'next', NULL),
(48, 49, 'pass', 'Pass'),
(48, 47, 'fail', 'Re-coat'),

-- Installation
(49, 50, 'yes', 'IM Release'),
(50, 51, 'next', NULL),
(51, 52, 'pass', 'Pass'),
(51, 50, 'fail', 'Reinstall'),

-- Firewall inspection
(52, 53, 'pass', 'Pass'),
(52, 50, 'fail', 'Repair'),

-- Final packing
(53, 54, 'next', NULL),
(54, 55, 'yes', 'Verified'),
(54, 53, 'no', 'Repack'),
(55, 56, 'next', 'Ship');
