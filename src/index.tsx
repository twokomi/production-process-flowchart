import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// ===== API Routes =====

// Get all process steps
app.get('/api/steps', async (c) => {
  const { DB } = c.env
  try {
    const result = await DB.prepare('SELECT * FROM process_steps ORDER BY position_y, position_x').all()
    return c.json(result.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch steps' }, 500)
  }
})

// Get a specific step with criteria
app.get('/api/steps/:id', async (c) => {
  const { DB } = c.env
  const stepId = c.req.param('id')
  
  try {
    // Get step details
    const step = await DB.prepare('SELECT * FROM process_steps WHERE id = ?').bind(stepId).first()
    
    if (!step) {
      return c.json({ error: 'Step not found' }, 404)
    }
    
    // Get criteria for this step
    const criteria = await DB.prepare('SELECT * FROM step_criteria WHERE step_id = ? ORDER BY sort_order').bind(stepId).all()
    
    return c.json({
      ...step,
      criteria: criteria.results
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch step details' }, 500)
  }
})

// Get criteria with documents
app.get('/api/criteria/:id', async (c) => {
  const { DB } = c.env
  const criteriaId = c.req.param('id')
  
  try {
    // Get criteria details
    const criteria = await DB.prepare('SELECT * FROM step_criteria WHERE id = ?').bind(criteriaId).first()
    
    if (!criteria) {
      return c.json({ error: 'Criteria not found' }, 404)
    }
    
    // Get documents for this criteria
    const documents = await DB.prepare('SELECT * FROM criteria_documents WHERE criteria_id = ? ORDER BY sort_order').bind(criteriaId).all()
    
    return c.json({
      ...criteria,
      documents: documents.results
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch criteria details' }, 500)
  }
})

// Get flow connections
app.get('/api/connections', async (c) => {
  const { DB } = c.env
  try {
    const result = await DB.prepare('SELECT * FROM flow_connections').all()
    return c.json(result.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch connections' }, 500)
  }
})

// Create a new step
app.post('/api/steps', async (c) => {
  const { DB } = c.env
  const body = await c.req.json()
  
  try {
    const result = await DB.prepare(`
      INSERT INTO process_steps (step_number, step_name, step_type, description, position_x, position_y)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      body.step_number,
      body.step_name,
      body.step_type,
      body.description || null,
      body.position_x || 0,
      body.position_y || 0
    ).run()
    
    return c.json({ id: result.meta.last_row_id, ...body })
  } catch (error) {
    return c.json({ error: 'Failed to create step' }, 500)
  }
})

// Create a new criteria
app.post('/api/criteria', async (c) => {
  const { DB } = c.env
  const body = await c.req.json()
  
  try {
    const result = await DB.prepare(`
      INSERT INTO step_criteria (step_id, criteria_title, criteria_description, pass_condition, fail_condition, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      body.step_id,
      body.criteria_title,
      body.criteria_description || null,
      body.pass_condition || null,
      body.fail_condition || null,
      body.sort_order || 0
    ).run()
    
    return c.json({ id: result.meta.last_row_id, ...body })
  } catch (error) {
    return c.json({ error: 'Failed to create criteria' }, 500)
  }
})

// Create a new document
app.post('/api/documents', async (c) => {
  const { DB } = c.env
  const body = await c.req.json()
  
  try {
    const result = await DB.prepare(`
      INSERT INTO criteria_documents (criteria_id, document_type, title, description, file_url, file_content, mime_type, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.criteria_id,
      body.document_type,
      body.title,
      body.description || null,
      body.file_url || null,
      body.file_content || null,
      body.mime_type || null,
      body.sort_order || 0
    ).run()
    
    return c.json({ id: result.meta.last_row_id, ...body })
  } catch (error) {
    return c.json({ error: 'Failed to create document' }, 500)
  }
})

// Update a step
app.put('/api/steps/:id', async (c) => {
  const { DB } = c.env
  const stepId = c.req.param('id')
  const body = await c.req.json()
  
  try {
    await DB.prepare(`
      UPDATE process_steps 
      SET step_number = ?, step_name = ?, step_type = ?, description = ?, position_x = ?, position_y = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      body.step_number,
      body.step_name,
      body.step_type,
      body.description || null,
      body.position_x || 0,
      body.position_y || 0,
      stepId
    ).run()
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to update step' }, 500)
  }
})

// Delete a step
app.delete('/api/steps/:id', async (c) => {
  const { DB } = c.env
  const stepId = c.req.param('id')
  
  try {
    await DB.prepare('DELETE FROM process_steps WHERE id = ?').bind(stepId).run()
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to delete step' }, 500)
  }
})

// ===== Frontend Routes =====

// Main page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>생산 공정 플로우차트</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          .step-card {
            transition: all 0.3s ease;
            cursor: pointer;
          }
          .step-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          .step-process {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .step-decision {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }
          .step-start {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }
          .criteria-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
            margin-left: 8px;
          }
          .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
          }
          .modal.active {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .modal-content {
            background-color: white;
            padding: 20px;
            border-radius: 12px;
            max-width: 90%;
            max-height: 90%;
            overflow-y: auto;
            animation: slideIn 0.3s ease;
          }
          @keyframes slideIn {
            from {
              transform: translateY(-50px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .document-link {
            display: block;
            padding: 12px;
            margin: 8px 0;
            background: #f8f9fa;
            border-radius: 8px;
            text-decoration: none;
            color: #333;
            transition: all 0.2s;
          }
          .document-link:hover {
            background: #e9ecef;
            transform: translateX(4px);
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <div class="container mx-auto px-4 py-6">
            <header class="mb-8">
                <h1 class="text-3xl font-bold text-gray-800 mb-2">
                    <i class="fas fa-project-diagram mr-2"></i>
                    생산 공정 플로우차트
                </h1>
                <p class="text-gray-600">각 단계를 터치하여 판단 기준과 관련 자료를 확인하세요</p>
            </header>
            
            <div id="stepsContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- Steps will be loaded here -->
            </div>
            
            <!-- Loading indicator -->
            <div id="loading" class="text-center py-8">
                <i class="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
                <p class="mt-2 text-gray-600">데이터 로딩 중...</p>
            </div>
        </div>
        
        <!-- Modal for step details -->
        <div id="stepModal" class="modal">
            <div class="modal-content w-full md:w-2/3 lg:w-1/2">
                <div class="flex justify-between items-center mb-4">
                    <h2 id="modalTitle" class="text-2xl font-bold text-gray-800"></h2>
                    <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                <div id="modalContent">
                    <!-- Content will be loaded here -->
                </div>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

// Admin page (for adding/editing data)
app.get('/admin', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>관리자 페이지</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div class="container mx-auto px-4 py-6">
            <header class="mb-8">
                <h1 class="text-3xl font-bold text-gray-800 mb-2">
                    <i class="fas fa-cog mr-2"></i>
                    관리자 페이지
                </h1>
                <a href="/" class="text-blue-600 hover:underline">
                    <i class="fas fa-arrow-left mr-1"></i>
                    플로우차트로 돌아가기
                </a>
            </header>
            
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-bold mb-4">공정 단계 관리</h2>
                <p class="text-gray-600">현재는 샘플 데이터를 사용하고 있습니다. API를 통해 데이터를 추가/수정할 수 있습니다.</p>
                
                <div class="mt-6">
                    <h3 class="text-lg font-semibold mb-2">API 엔드포인트</h3>
                    <ul class="list-disc list-inside text-gray-700 space-y-1">
                        <li><code class="bg-gray-100 px-2 py-1 rounded">GET /api/steps</code> - 모든 단계 조회</li>
                        <li><code class="bg-gray-100 px-2 py-1 rounded">GET /api/steps/:id</code> - 특정 단계 상세 조회</li>
                        <li><code class="bg-gray-100 px-2 py-1 rounded">POST /api/steps</code> - 새 단계 생성</li>
                        <li><code class="bg-gray-100 px-2 py-1 rounded">PUT /api/steps/:id</code> - 단계 수정</li>
                        <li><code class="bg-gray-100 px-2 py-1 rounded">DELETE /api/steps/:id</code> - 단계 삭제</li>
                        <li><code class="bg-gray-100 px-2 py-1 rounded">POST /api/criteria</code> - 판단 기준 추가</li>
                        <li><code class="bg-gray-100 px-2 py-1 rounded">POST /api/documents</code> - 문서 추가</li>
                    </ul>
                </div>
            </div>
        </div>
    </body>
    </html>
  `)
})

export default app
