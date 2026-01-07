-- Production Process Flow Steps
CREATE TABLE IF NOT EXISTS process_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  step_number TEXT UNIQUE NOT NULL,
  step_name TEXT NOT NULL,
  step_type TEXT NOT NULL, -- 'process', 'decision', 'start', 'end'
  description TEXT,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Decision Criteria for each step
CREATE TABLE IF NOT EXISTS step_criteria (
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

-- Supporting Documents and References
CREATE TABLE IF NOT EXISTS criteria_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  criteria_id INTEGER NOT NULL,
  document_type TEXT NOT NULL, -- 'work_instruction', 'quality_spec', 'reference', 'image', 'video'
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_content TEXT, -- For storing text content directly
  mime_type TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (criteria_id) REFERENCES step_criteria(id) ON DELETE CASCADE
);

-- Flow Connections (edges between steps)
CREATE TABLE IF NOT EXISTS flow_connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_step_id INTEGER NOT NULL,
  to_step_id INTEGER NOT NULL,
  condition_type TEXT, -- 'yes', 'no', 'pass', 'fail', 'next'
  label TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_step_id) REFERENCES process_steps(id) ON DELETE CASCADE,
  FOREIGN KEY (to_step_id) REFERENCES process_steps(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_step_criteria_step_id ON step_criteria(step_id);
CREATE INDEX IF NOT EXISTS idx_criteria_documents_criteria_id ON criteria_documents(criteria_id);
CREATE INDEX IF NOT EXISTS idx_flow_connections_from_step ON flow_connections(from_step_id);
CREATE INDEX IF NOT EXISTS idx_flow_connections_to_step ON flow_connections(to_step_id);
CREATE INDEX IF NOT EXISTS idx_process_steps_number ON process_steps(step_number);
