// Global variables
let allSteps = [];
let allConnections = [];

// Load all steps when page loads
document.addEventListener('DOMContentLoaded', async () => {
  await loadSteps();
});

// Load steps and connections from API
async function loadSteps() {
  const loading = document.getElementById('loading');
  const container = document.getElementById('stepsContainer');
  
  try {
    // Load both steps and connections
    const [stepsResponse, connectionsResponse] = await Promise.all([
      axios.get('/api/steps'),
      axios.get('/api/connections')
    ]);
    
    allSteps = stepsResponse.data;
    allConnections = connectionsResponse.data;
    
    loading.style.display = 'none';
    
    if (allSteps.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-8 text-gray-500">
          <i class="fas fa-inbox text-4xl mb-2"></i>
          <p>등록된 공정 단계가 없습니다.</p>
        </div>
      `;
      return;
    }
    
    // Render flow chart by position
    renderFlowChart();
    
  } catch (error) {
    console.error('Failed to load steps:', error);
    loading.innerHTML = `
      <div class="text-center text-red-500">
        <i class="fas fa-exclamation-triangle text-4xl mb-2"></i>
        <p>데이터를 불러오는데 실패했습니다.</p>
        <button onclick="loadSteps()" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          다시 시도
        </button>
      </div>
    `;
  }
}

// Render flow chart with position-based layout
function renderFlowChart() {
  const container = document.getElementById('stepsContainer');
  
  // Group steps by position_y (row)
  const rows = {};
  allSteps.forEach(step => {
    const row = step.position_y || 0;
    if (!rows[row]) rows[row] = [];
    rows[row].push(step);
  });
  
  // Sort rows
  const sortedRows = Object.keys(rows).sort((a, b) => parseInt(a) - parseInt(b));
  
  let html = '<div class="flow-chart-container">';
  
  sortedRows.forEach((rowKey, rowIndex) => {
    const rowSteps = rows[rowKey].sort((a, b) => a.position_x - b.position_x);
    
    html += `<div class="flow-row" data-row="${rowKey}">`;
    
    rowSteps.forEach((step, stepIndex) => {
      const connections = allConnections.filter(c => c.from_step_id === step.id);
      const hasNextInRow = stepIndex < rowSteps.length - 1;
      const hasNextInNextRow = connections.some(c => {
        const targetStep = allSteps.find(s => s.id === c.to_step_id);
        return targetStep && targetStep.position_y > step.position_y;
      });
      
      html += renderStepCardInFlow(step, hasNextInRow, hasNextInNextRow, connections);
      
      // Add arrow to next step in same row
      if (hasNextInRow) {
        html += `
          <div class="flow-arrow">
            <i class="fas fa-arrow-right text-gray-400"></i>
          </div>
        `;
      }
    });
    
    html += '</div>';
  });
  
  html += '</div>';
  container.innerHTML = html;
}

// Render a step card in flow layout
function renderStepCardInFlow(step, hasNextInRow, hasNextInNextRow, connections) {
  const typeClass = `step-${step.step_type}`;
  const icon = getStepIcon(step.step_type);
  
  // Get next step info for connection labels
  let connectionLabel = '';
  if (connections.length > 0) {
    const labels = connections
      .filter(c => c.label || c.condition_type)
      .map(c => c.label || c.condition_type);
    if (labels.length > 0) {
      connectionLabel = `<div class="text-xs mt-1 opacity-70">→ ${labels.join(', ')}</div>`;
    }
  }
  
  return `
    <div class="step-card-wrapper">
      <div class="step-card ${typeClass}" onclick="showStepDetails(${step.id})">
        <div class="flex items-start justify-between mb-1">
          <span class="step-number">${step.step_number}</span>
          <i class="${icon} text-lg"></i>
        </div>
        <h3 class="step-name">${step.step_name}</h3>
        ${connectionLabel}
        <div class="step-hint">
          <i class="fas fa-hand-pointer mr-1"></i>
          상세 정보
        </div>
      </div>
      ${hasNextInNextRow ? '<div class="flow-arrow-down"><i class="fas fa-arrow-down text-gray-400"></i></div>' : ''}
    </div>
  `;
}

// Get icon for step type
function getStepIcon(type) {
  switch(type) {
    case 'start': return 'fas fa-play-circle';
    case 'end': return 'fas fa-stop-circle';
    case 'decision': return 'fas fa-question-circle';
    case 'process': return 'fas fa-cog';
    default: return 'fas fa-circle';
  }
}

// Show step details in modal
async function showStepDetails(stepId) {
  const modal = document.getElementById('stepModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');
  
  try {
    // Show loading in modal
    modalTitle.textContent = '로딩 중...';
    modalContent.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-blue-500"></i></div>';
    modal.classList.add('active');
    
    // Fetch step details
    const response = await axios.get(`/api/steps/${stepId}`);
    const step = response.data;
    
    modalTitle.innerHTML = `
      <div class="flex items-center">
        <span class="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-3">
          ${step.step_number}
        </span>
        <span>${step.step_name}</span>
      </div>
    `;
    
    if (!step.criteria || step.criteria.length === 0) {
      modalContent.innerHTML = `
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <i class="fas fa-info-circle text-blue-500 text-4xl mb-3"></i>
          <p class="text-gray-700 mb-2">이 단계에 대한 판단 기준이 아직 등록되지 않았습니다.</p>
          <p class="text-sm text-gray-600">${step.description || ''}</p>
        </div>
      `;
      return;
    }
    
    let html = '<div class="space-y-4">';
    
    if (step.description) {
      html += `
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 class="font-semibold text-gray-700 mb-2"><i class="fas fa-info-circle mr-2"></i>설명</h4>
          <p class="text-gray-700">${step.description}</p>
        </div>
      `;
    }
    
    html += '<h4 class="font-semibold text-gray-800 text-lg"><i class="fas fa-clipboard-check mr-2"></i>판단 기준</h4>';
    
    for (const criteria of step.criteria) {
      html += await renderCriteriaCard(criteria);
    }
    
    html += '</div>';
    modalContent.innerHTML = html;
    
  } catch (error) {
    console.error('Failed to load step details:', error);
    modalContent.innerHTML = `
      <div class="text-center text-red-500 py-8">
        <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
        <p>상세 정보를 불러오는데 실패했습니다.</p>
      </div>
    `;
  }
}

// Render criteria card with documents
async function renderCriteriaCard(criteria) {
  let html = `
    <div class="criteria-card border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <h3 class="text-lg font-bold text-gray-800 mb-3">
        <i class="fas fa-check-square text-blue-600 mr-2"></i>
        ${criteria.criteria_title}
      </h3>
      ${criteria.criteria_description ? `<p class="text-gray-700 mb-3">${criteria.criteria_description}</p>` : ''}
      
      <div class="grid md:grid-cols-2 gap-3 mb-4">
        ${criteria.pass_condition ? `
          <div class="condition-box pass-condition">
            <div class="flex items-center mb-2">
              <i class="fas fa-check-circle text-green-600 text-xl mr-2"></i>
              <span class="font-semibold text-green-800">합격 조건</span>
            </div>
            <p class="text-sm text-green-700">${criteria.pass_condition}</p>
          </div>
        ` : ''}
        
        ${criteria.fail_condition ? `
          <div class="condition-box fail-condition">
            <div class="flex items-center mb-2">
              <i class="fas fa-times-circle text-red-600 text-xl mr-2"></i>
              <span class="font-semibold text-red-800">불합격 조건</span>
            </div>
            <p class="text-sm text-red-700">${criteria.fail_condition}</p>
          </div>
        ` : ''}
      </div>
      
      <button 
        onclick="toggleCriteriaDocuments(${criteria.id})" 
        class="document-toggle-btn"
      >
        <i class="fas fa-folder-open mr-2"></i>
        관련 자료 보기
        <i class="fas fa-chevron-down ml-2 toggle-icon"></i>
      </button>
      
      <div id="documents-${criteria.id}" class="documents-container" style="display: none;"></div>
    </div>
  `;
  
  return html;
}

// Toggle documents visibility
async function toggleCriteriaDocuments(criteriaId) {
  const container = document.getElementById(`documents-${criteriaId}`);
  const button = container.previousElementSibling;
  const icon = button.querySelector('.toggle-icon');
  
  if (container.style.display === 'block') {
    container.style.display = 'none';
    icon.classList.remove('fa-chevron-up');
    icon.classList.add('fa-chevron-down');
    return;
  }
  
  try {
    container.innerHTML = '<div class="text-center py-4"><i class="fas fa-spinner fa-spin text-blue-500"></i></div>';
    container.style.display = 'block';
    icon.classList.remove('fa-chevron-down');
    icon.classList.add('fa-chevron-up');
    
    const response = await axios.get(`/api/criteria/${criteriaId}`);
    const criteria = response.data;
    
    if (!criteria.documents || criteria.documents.length === 0) {
      container.innerHTML = `
        <div class="text-center py-4 text-gray-500 bg-gray-50 rounded mt-3">
          <i class="fas fa-folder-open text-2xl mb-2"></i>
          <p class="text-sm">등록된 자료가 없습니다.</p>
        </div>
      `;
      return;
    }
    
    let html = '<div class="documents-list mt-3">';
    
    criteria.documents.forEach(doc => {
      const icon = getDocumentIcon(doc.document_type);
      const typeLabel = getDocumentTypeLabel(doc.document_type);
      html += `
        <div class="document-item">
          <div class="flex items-start justify-between">
            <div class="flex items-start flex-1">
              <div class="document-icon">
                <i class="${icon}"></i>
              </div>
              <div class="flex-1">
                <div class="font-semibold text-gray-800">${doc.title}</div>
                ${doc.description ? `<div class="text-sm text-gray-600 mt-1">${doc.description}</div>` : ''}
                ${doc.file_url ? `
                  <div class="text-sm text-blue-600 mt-2">
                    <i class="fas fa-link mr-1"></i>
                    <span>${doc.file_url}</span>
                  </div>
                ` : ''}
              </div>
            </div>
            <span class="document-type-badge">${typeLabel}</span>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
  } catch (error) {
    console.error('Failed to load documents:', error);
    container.innerHTML = `
      <div class="text-center text-red-500 py-4 bg-red-50 rounded mt-3">
        <i class="fas fa-exclamation-triangle mb-2"></i>
        <p class="text-sm">자료를 불러오는데 실패했습니다.</p>
      </div>
    `;
  }
}

// Get icon for document type
function getDocumentIcon(type) {
  switch(type) {
    case 'work_instruction': return 'fas fa-file-alt';
    case 'quality_spec': return 'fas fa-clipboard-list';
    case 'reference': return 'fas fa-book';
    case 'image': return 'fas fa-image';
    case 'video': return 'fas fa-video';
    default: return 'fas fa-file';
  }
}

// Get label for document type
function getDocumentTypeLabel(type) {
  switch(type) {
    case 'work_instruction': return '작업지침서';
    case 'quality_spec': return '품질기준서';
    case 'reference': return '참고자료';
    case 'image': return '이미지';
    case 'video': return '동영상';
    default: return '문서';
  }
}

// Close modal
function closeModal() {
  const modal = document.getElementById('stepModal');
  modal.classList.remove('active');
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  const modal = document.getElementById('stepModal');
  if (e.target === modal) {
    closeModal();
  }
});
