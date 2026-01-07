// Global variables
let allSteps = [];

// Load all steps when page loads
document.addEventListener('DOMContentLoaded', async () => {
  await loadSteps();
});

// Load steps from API
async function loadSteps() {
  const loading = document.getElementById('loading');
  const container = document.getElementById('stepsContainer');
  
  try {
    const response = await axios.get('/api/steps');
    allSteps = response.data;
    
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
    
    // Group steps by type
    const startSteps = allSteps.filter(s => s.step_type === 'start');
    const processSteps = allSteps.filter(s => s.step_type === 'process');
    const decisionSteps = allSteps.filter(s => s.step_type === 'decision');
    const endSteps = allSteps.filter(s => s.step_type === 'end');
    
    let html = '';
    
    // Render start steps
    if (startSteps.length > 0) {
      html += '<div class="col-span-full"><h2 class="text-xl font-bold text-gray-700 mb-3"><i class="fas fa-play-circle mr-2"></i>시작</h2></div>';
      startSteps.forEach(step => {
        html += renderStepCard(step);
      });
    }
    
    // Render process steps
    if (processSteps.length > 0) {
      html += '<div class="col-span-full mt-4"><h2 class="text-xl font-bold text-gray-700 mb-3"><i class="fas fa-cogs mr-2"></i>공정 단계</h2></div>';
      processSteps.forEach(step => {
        html += renderStepCard(step);
      });
    }
    
    // Render decision steps
    if (decisionSteps.length > 0) {
      html += '<div class="col-span-full mt-4"><h2 class="text-xl font-bold text-gray-700 mb-3"><i class="fas fa-question-circle mr-2"></i>판단 단계</h2></div>';
      decisionSteps.forEach(step => {
        html += renderStepCard(step);
      });
    }
    
    // Render end steps
    if (endSteps.length > 0) {
      html += '<div class="col-span-full mt-4"><h2 class="text-xl font-bold text-gray-700 mb-3"><i class="fas fa-stop-circle mr-2"></i>종료</h2></div>';
      endSteps.forEach(step => {
        html += renderStepCard(step);
      });
    }
    
    container.innerHTML = html;
    
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

// Render a step card
function renderStepCard(step) {
  const typeClass = `step-${step.step_type}`;
  const icon = getStepIcon(step.step_type);
  
  return `
    <div class="step-card ${typeClass} rounded-lg shadow-md p-5 text-white" onclick="showStepDetails(${step.id})">
      <div class="flex items-start justify-between mb-2">
        <span class="text-sm opacity-80">Step ${step.step_number}</span>
        <i class="${icon} text-xl opacity-80"></i>
      </div>
      <h3 class="text-lg font-bold mb-2">${step.step_name}</h3>
      ${step.description ? `<p class="text-sm opacity-90">${step.description}</p>` : ''}
      <div class="mt-3 pt-3 border-t border-white border-opacity-30">
        <span class="text-xs opacity-80">
          <i class="fas fa-hand-pointer mr-1"></i>
          터치하여 상세 정보 보기
        </span>
      </div>
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
    
    modalTitle.textContent = `${step.step_number}. ${step.step_name}`;
    
    if (!step.criteria || step.criteria.length === 0) {
      modalContent.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-info-circle text-4xl mb-2"></i>
          <p>이 단계에 대한 판단 기준이 아직 등록되지 않았습니다.</p>
        </div>
      `;
      return;
    }
    
    let html = '<div class="space-y-4">';
    
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
    <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <h3 class="text-lg font-bold text-gray-800 mb-2">
        <i class="fas fa-clipboard-check text-blue-600 mr-2"></i>
        ${criteria.criteria_title}
      </h3>
      ${criteria.criteria_description ? `<p class="text-gray-700 mb-3">${criteria.criteria_description}</p>` : ''}
      
      <div class="grid md:grid-cols-2 gap-3 mb-3">
        ${criteria.pass_condition ? `
          <div class="bg-green-50 border border-green-200 rounded p-3">
            <div class="flex items-center mb-1">
              <i class="fas fa-check-circle text-green-600 mr-2"></i>
              <span class="font-semibold text-green-800">합격 조건</span>
            </div>
            <p class="text-sm text-green-700">${criteria.pass_condition}</p>
          </div>
        ` : ''}
        
        ${criteria.fail_condition ? `
          <div class="bg-red-50 border border-red-200 rounded p-3">
            <div class="flex items-center mb-1">
              <i class="fas fa-times-circle text-red-600 mr-2"></i>
              <span class="font-semibold text-red-800">불합격 조건</span>
            </div>
            <p class="text-sm text-red-700">${criteria.fail_condition}</p>
          </div>
        ` : ''}
      </div>
      
      <button 
        onclick="showCriteriaDocuments(${criteria.id})" 
        class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
      >
        <i class="fas fa-folder-open mr-2"></i>
        관련 자료 보기
      </button>
      
      <div id="documents-${criteria.id}" class="mt-3" style="display: none;"></div>
    </div>
  `;
  
  return html;
}

// Show documents for a criteria
async function showCriteriaDocuments(criteriaId) {
  const container = document.getElementById(`documents-${criteriaId}`);
  
  if (container.style.display === 'block') {
    container.style.display = 'none';
    return;
  }
  
  try {
    container.innerHTML = '<div class="text-center py-4"><i class="fas fa-spinner fa-spin text-blue-500"></i></div>';
    container.style.display = 'block';
    
    const response = await axios.get(`/api/criteria/${criteriaId}`);
    const criteria = response.data;
    
    if (!criteria.documents || criteria.documents.length === 0) {
      container.innerHTML = `
        <div class="text-center py-4 text-gray-500">
          <i class="fas fa-folder-open text-2xl mb-2"></i>
          <p class="text-sm">등록된 자료가 없습니다.</p>
        </div>
      `;
      return;
    }
    
    let html = '<div class="space-y-2">';
    
    criteria.documents.forEach(doc => {
      const icon = getDocumentIcon(doc.document_type);
      html += `
        <div class="document-link">
          <div class="flex items-center justify-between">
            <div class="flex items-center flex-1">
              <i class="${icon} text-blue-600 mr-3 text-xl"></i>
              <div>
                <div class="font-semibold text-gray-800">${doc.title}</div>
                ${doc.description ? `<div class="text-sm text-gray-600">${doc.description}</div>` : ''}
              </div>
            </div>
            <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${getDocumentTypeLabel(doc.document_type)}</span>
          </div>
          ${doc.file_url ? `
            <div class="mt-2 text-sm text-gray-500">
              <i class="fas fa-link mr-1"></i>
              <span class="text-blue-600">${doc.file_url}</span>
            </div>
          ` : ''}
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
  } catch (error) {
    console.error('Failed to load documents:', error);
    container.innerHTML = `
      <div class="text-center text-red-500 py-4">
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
