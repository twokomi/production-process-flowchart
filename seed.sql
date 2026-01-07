-- Insert sample process steps from the flowchart
INSERT INTO process_steps (step_number, step_name, step_type, description, position_x, position_y) VALUES
('START', 'START', 'start', '생산 공정 시작', 0, 0),
('1', 'Preliminary Project Review', 'process', '초기 프로젝트 검토', 100, 0),
('2', 'Acceptable?', 'decision', '수용 가능 여부 판단', 200, 0),
('3', 'Material of Start-List', 'process', '시작 목록 자재 확인', 300, 0),
('4', 'Acceptable?', 'decision', '수용 가능 여부 판단', 400, 0),
('5', 'Material Receiving and Storage', 'process', '자재 입고 및 보관', 500, 0),
('6', 'Incoming Inspection', 'decision', '입고 검사', 600, 0),
('7', 'Cold Bonding Inspection', 'process', '냉접합 검사', 100, 100),
('8', 'Operator Verification', 'decision', '작업자 확인', 200, 100),
('9', 'Cold Bonding Setting', 'process', '냉접합 설정', 300, 100),
('10', 'Plate Blocking', 'process', '플레이트 블로킹', 100, 200),
('11', 'Cold Bonding No. 11', 'process', '냉접합 11번', 300, 200),
('12', 'Plate Rolling', 'process', '플레이트 롤링', 300, 300),
('13', 'Longitudinal Cutting', 'process', '세로 절단', 100, 400),
('14', 'Operator Verification', 'decision', '작업자 확인', 200, 400),
('15', 'Bracket Welding', 'process', '브라켓 용접', 300, 400),
('16', 'Flange Joint Inspection', 'process', '플랜지 조인트 검사', 100, 500),
('17', 'BIT Release/MVT Start', 'decision', 'BIT 해제/MVT 시작', 300, 500),
('18', 'Quality Inspection', 'decision', '품질 검사', 400, 500),
('19', 'Thermal Spray Coating', 'process', '열 스프레이 코팅', 100, 600),
('20', 'Epoxy Coating', 'process', '에폭시 코팅', 200, 600),
('21', 'Polyurethane Coating', 'process', '폴리우레탄 코팅', 300, 600);

-- Insert sample criteria for decision steps
-- Step 2: Acceptable?
INSERT INTO step_criteria (step_id, criteria_title, criteria_description, pass_condition, fail_condition, sort_order) VALUES
(2, '프로젝트 사양 적합성', '고객 요구사항과 프로젝트 사양이 일치하는지 확인', '모든 사양이 제작 가능 범위 내에 있음', '사양이 제작 불가능하거나 기준 미달', 1),
(2, '자재 가용성 확인', '필요한 자재가 공급 가능한지 확인', '모든 자재 공급 가능', '핵심 자재 공급 불가', 2),
(2, '일정 검토', '납기일 준수 가능 여부 확인', '일정 내 완료 가능', '일정 준수 불가', 3);

-- Step 4: Material Acceptable?
INSERT INTO step_criteria (step_id, criteria_title, criteria_description, pass_condition, fail_condition, sort_order) VALUES
(4, '자재 품질 기준', '입고 자재가 품질 기준을 충족하는지 확인', '모든 자재가 품질 기준 충족', '품질 기준 미달 자재 존재', 1),
(4, '자재 규격 확인', '자재 규격이 도면과 일치하는지 확인', '규격 일치', '규격 불일치', 2),
(4, '수량 확인', '주문 수량과 입고 수량 일치 여부', '수량 일치', '수량 불일치', 3);

-- Step 6: Incoming Inspection
INSERT INTO step_criteria (step_id, criteria_title, criteria_description, pass_condition, fail_condition, sort_order) VALUES
(6, '외관 검사', '자재 표면 결함 여부 확인', '결함 없음', '긁힘, 변형, 오염 등 발견', 1),
(6, '치수 검사', '자재 치수가 허용 공차 내에 있는지 확인', '모든 치수 공차 내', '치수 공차 초과', 2),
(6, '성적서 확인', '밀테스트 성적서 및 품질 문서 확인', '성적서 적합', '성적서 부적합 또는 미제출', 3);

-- Step 8: Operator Verification
INSERT INTO step_criteria (step_id, criteria_title, criteria_description, pass_condition, fail_condition, sort_order) VALUES
(8, '작업자 자격 확인', '해당 공정 수행 자격이 있는 작업자인지 확인', '자격 보유', '자격 미보유', 1),
(8, '장비 상태 확인', '작업 장비가 정상 작동하는지 확인', '장비 정상', '장비 이상', 2),
(8, '안전 장비 착용', '필수 안전 장비 착용 여부 확인', '모두 착용', '미착용', 3);

-- Step 14: Operator Verification
INSERT INTO step_criteria (step_id, criteria_title, criteria_description, pass_condition, fail_condition, sort_order) VALUES
(14, '절단 품질 확인', '절단면이 깨끗하고 버(burr)가 없는지 확인', '품질 양호', '절단면 불량', 1),
(14, '치수 정확도', '절단 치수가 도면과 일치하는지 확인', '치수 일치', '치수 불일치', 2),
(14, '표면 상태', '절단 작업 중 표면 손상 여부 확인', '손상 없음', '긁힘, 변형 등 발견', 3);

-- Step 17: BIT Release/MVT Start
INSERT INTO step_criteria (step_id, criteria_title, criteria_description, pass_condition, fail_condition, sort_order) VALUES
(17, '용접 품질 검사', '용접 비드가 균일하고 결함이 없는지 확인', '용접 양호', '기공, 균열 등 결함 발견', 1),
(17, 'NDT 검사 결과', '비파괴 검사(NDT) 결과 확인', 'NDT 합격', 'NDT 불합격', 2),
(17, '치수 검사', '최종 제품 치수 확인', '치수 적합', '치수 부적합', 3);

-- Step 18: Quality Inspection
INSERT INTO step_criteria (step_id, criteria_title, criteria_description, pass_condition, fail_condition, sort_order) VALUES
(18, '외관 품질', '제품 외관에 결함이 없는지 최종 확인', '외관 양호', '외관 결함 발견', 1),
(18, '기능 테스트', '제품이 요구 기능을 정상적으로 수행하는지 확인', '기능 정상', '기능 이상', 2),
(18, '도면 일치성', '제품이 최종 도면과 일치하는지 확인', '도면 일치', '도면 불일치', 3);

-- Insert sample documents for criteria
-- Documents for Step 2 Criteria 1
INSERT INTO criteria_documents (criteria_id, document_type, title, description, file_url, sort_order) VALUES
(1, 'work_instruction', '프로젝트 검토 작업 지침서', '신규 프로젝트 검토 시 확인해야 할 체크리스트', '/docs/wi-001-project-review.pdf', 1),
(1, 'quality_spec', '제작 가능 사양 기준서', '당사에서 제작 가능한 제품 사양 범위', '/docs/qs-001-manufacturing-spec.pdf', 2),
(1, 'reference', '프로젝트 검토 샘플', '이전 프로젝트 검토 사례', '/docs/ref-001-review-samples.pdf', 3);

-- Documents for Step 4 Criteria 1
INSERT INTO criteria_documents (criteria_id, document_type, title, description, file_url, sort_order) VALUES
(4, 'quality_spec', '자재 품질 기준서', '입고 자재 품질 검사 기준', '/docs/qs-002-material-quality.pdf', 1),
(4, 'work_instruction', '자재 검사 작업 지침', '자재 검사 절차 및 방법', '/docs/wi-002-material-inspection.pdf', 2);

-- Documents for Step 6 Criteria 1
INSERT INTO criteria_documents (criteria_id, document_type, title, description, file_url, sort_order) VALUES
(7, 'quality_spec', '입고 검사 기준서', '입고 검사 합격 기준', '/docs/qs-003-incoming-inspection.pdf', 1),
(7, 'work_instruction', '외관 검사 방법', '외관 결함 판정 기준', '/docs/wi-003-visual-inspection.pdf', 2),
(7, 'reference', '불량 사례집', '자주 발생하는 불량 유형', '/docs/ref-002-defect-examples.pdf', 3);

-- Documents for Step 8 Criteria 1
INSERT INTO criteria_documents (criteria_id, document_type, title, description, file_url, sort_order) VALUES
(10, 'work_instruction', '작업자 자격 관리', '공정별 필요 자격 요건', '/docs/wi-004-operator-qualification.pdf', 1),
(10, 'reference', '안전 작업 수칙', '작업장 안전 수칙', '/docs/ref-003-safety-rules.pdf', 2);

-- Documents for Step 17 Criteria 1
INSERT INTO criteria_documents (criteria_id, document_type, title, description, file_url, sort_order) VALUES
(16, 'quality_spec', '용접 품질 기준', '용접부 합격 기준', '/docs/qs-004-welding-quality.pdf', 1),
(16, 'work_instruction', 'NDT 검사 절차', '비파괴 검사 수행 방법', '/docs/wi-005-ndt-procedure.pdf', 2),
(16, 'reference', '용접 결함 판정', '용접 결함 유형 및 판정', '/docs/ref-004-welding-defects.pdf', 3);

-- Documents for Step 18 Criteria 1
INSERT INTO criteria_documents (criteria_id, document_type, title, description, file_url, sort_order) VALUES
(19, 'quality_spec', '최종 품질 검사 기준', '출하 전 최종 검사 기준', '/docs/qs-005-final-inspection.pdf', 1),
(19, 'work_instruction', '최종 검사 절차', '최종 품질 검사 수행 절차', '/docs/wi-006-final-inspection.pdf', 2);

-- Insert flow connections
INSERT INTO flow_connections (from_step_id, to_step_id, condition_type, label) VALUES
(1, 2, 'next', NULL),
(2, 3, 'yes', 'Acceptable'),
(2, 1, 'no', 'Not Acceptable'),
(3, 4, 'next', NULL),
(4, 5, 'yes', 'Acceptable'),
(4, 3, 'no', 'Not Acceptable'),
(5, 6, 'next', NULL),
(6, 7, 'pass', 'Pass'),
(6, 5, 'fail', 'Fail'),
(7, 8, 'next', NULL),
(8, 9, 'yes', 'Verified'),
(8, 7, 'no', 'Not Verified'),
(9, 10, 'next', NULL),
(10, 11, 'next', NULL),
(11, 8, 'next', 'Loop back'),
(11, 12, 'next', NULL),
(12, 13, 'next', NULL),
(13, 14, 'next', NULL),
(14, 15, 'yes', 'Verified'),
(14, 13, 'no', 'Not Verified'),
(15, 16, 'next', NULL),
(16, 17, 'next', NULL),
(17, 18, 'next', NULL),
(18, 19, 'pass', 'Pass'),
(18, 16, 'fail', 'Fail'),
(19, 20, 'next', NULL),
(20, 21, 'next', NULL);
