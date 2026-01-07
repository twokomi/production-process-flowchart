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

// Main page - Mobile UI
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>생산 공정 플로우차트</title>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/mobile-styles.css" rel="stylesheet">
    </head>
    <body>
    <body>
        <!-- Category Selection View -->
        <div id="categoryView">
            <header style="background: white; padding: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h1 style="font-size: 1.5rem; font-weight: bold; color: #1f2937; margin: 0; text-align: center;">
                    <i class="fas fa-industry" style="margin-right: 0.5rem;"></i>
                    생산 공정 관리
                </h1>
                <p style="text-align: center; color: #6b7280; font-size: 0.875rem; margin: 0.5rem 0 0 0;">
                    CS WIND Production Process
                </p>
            </header>
            
            <div id="categoryList">
                <!-- Category cards will be loaded here -->
            </div>
            
            <div id="loading" style="text-align: center; padding: 2rem;">
                <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #3b82f6;"></i>
                <p style="margin-top: 1rem; color: #6b7280;">데이터 로딩 중...</p>
            </div>
        </div>
        
        <!-- Process Step View -->
        <div id="processView">
            <!-- Process Header -->
            <div class="process-header-mobile">
                <div class="process-header-top">
                    <button class="back-button-mobile" onclick="backToCategories()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div id="currentCategoryName">Category</div>
                </div>
                <div class="process-progress-mobile">
                    <div class="progress-bar">
                        <div id="progressFill" class="progress-fill" style="width: 0%"></div>
                    </div>
                    <div id="progressText" class="progress-text">0 / 0</div>
                </div>
            </div>
            
            <!-- Step Question -->
            <div id="stepQuestion">
                <!-- Step content will be loaded here -->
            </div>
            
            <!-- Action Buttons -->
            <div class="action-buttons-mobile">
                <button id="prevBtn" class="btn-prev-mobile" onclick="goPrevious()">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <button class="btn-no-mobile" onclick="answerNo()">
                    <i class="fas fa-times-circle"></i>
                    <span>NO</span>
                </button>
                <button class="btn-yes-mobile" onclick="answerYes()">
                    <i class="fas fa-check-circle"></i>
                    <span>YES</span>
                </button>
            </div>
        </div>
        
        <!-- Criteria Detail Modal -->
        <div id="criteriaModal">
            <div id="criteriaModalContent">
                <button class="modal-close-button" onclick="closeCriteriaModal()" style="position: fixed; top: 1rem; right: 1rem;">
                    <i class="fas fa-times"></i>
                </button>
                <!-- Criteria details will be loaded here -->
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/mobile-app.js"></script>
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
