-- Add category column to process_steps
ALTER TABLE process_steps ADD COLUMN category TEXT;
ALTER TABLE process_steps ADD COLUMN category_order INTEGER DEFAULT 0;

-- Update categories for existing steps
-- CT: Cold Test (Start ~ Plate Cutting)
UPDATE process_steps SET category = 'CT', category_order = 1 
WHERE step_number IN ('START', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10');

-- BT: Blast Test (Plate Cutting ~ BT Release)
UPDATE process_steps SET category = 'BT', category_order = 2
WHERE step_number IN ('11', '12', '13', '14', '15', '16', '17', '18', '19', '20', 
                      '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
                      '31', '32', '33', '34', '35', '36', '37');

-- WT: Wash Test (Wash Bay ~ WT Release)
UPDATE process_steps SET category = 'WT', category_order = 3
WHERE step_number IN ('38', '39', '40', '41', '42', '43', '44');

-- IM: Installation & Mechanical (M&E Installation ~ IM Release)
UPDATE process_steps SET category = 'IM', category_order = 4
WHERE step_number IN ('45', '46', '47', '48', '49', '50', '51', '52');

-- GT: Gate (IM Release ~ Finish)
UPDATE process_steps SET category = 'GT', category_order = 5
WHERE step_number IN ('53', '54', '55', 'FINISH');
