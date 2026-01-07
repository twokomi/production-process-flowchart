// Global state
let currentCategory = null;
let currentStepIndex = 0;
let categorySteps = [];
let completedSteps = [];
let stepHistory = [];

// Category definitions
const categories = {
  CT: {
    name: 'CT',
    fullName: 'Cold Test',
    description: '초기 검토부터 플레이트 절단까지',
    color: '#3b82f6',
    icon: 'fa-snowflake'
  },
  BT: {
    name: 'BT',
    fullName: 'Blast Test',
    description: '절단부터 BT 해제까지',
    color: '#8b5cf6',
    icon: 'fa-hammer'
  },
  WT: {
    name: 'WT',
    fullName: 'Wash Test',
    description: '세척부터 WT 해제까지',
    color: '#06b6d4',
    icon: 'fa-water'
  },
  IM: {
    name: 'IM',
    fullName: 'Installation & Mechanical',
    description: '설치부터 IM 해제까지',
    color: '#f59e0b',
    icon: 'fa-tools'
  },
  GT: {
    name: 'GT',
    fullName: 'Gate',
    description: 'IM 해제부터 완료까지',
    color: '#10b981',
    icon: 'fa-check-circle'
  }
};

// Load when page loads
document.addEventListener('DOMContentLoaded', async () => {
  await loadCategoryStatus();
  renderCategoryList();
});

// Load category status
async function loadCategoryStatus() {
  try {
    const response = await axios.get('/api/steps');
    const allSteps = response.data;
    
    // Group by category
    Object.keys(categories).forEach(catKey => {
      const steps = allSteps.filter(s => s.category === catKey);
      categories[catKey].steps = steps;
      categories[catKey].totalSteps = steps.length;
      categories[catKey].completedCount = 0; // TODO: Load from session/storage
      categories[catKey].status = 'pending'; // pending, in_progress, completed
    });
    
  } catch (error) {
    console.error('Failed to load steps:', error);
  }
}

// Render category list (상단 Status List)
function renderCategoryList() {
  const container = document.getElementById('categoryList');
  
  let html = '';
  
  Object.entries(categories).forEach(([key, cat]) => {
    const progress = cat.totalSteps > 0 ? (cat.completedCount / cat.totalSteps * 100).toFixed(0) : 0;
    const statusIcon = getStatusIcon(cat.status);
    
    html += `
      <div class="category-card" style="border-left: 4px solid ${cat.color}" onclick="selectCategory('${key}')">
        <div class="category-header">
          <div class="category-icon" style="background: ${cat.color}">
            <i class="fas ${cat.icon}"></i>
          </div>
          <div class="category-info">
            <div class="category-name">${cat.name}</div>
            <div class="category-full-name">${cat.fullName}</div>
          </div>
          <div class="category-status">
            <i class="fas ${statusIcon}"></i>
          </div>
        </div>
        <div class="category-description">${cat.description}</div>
        <div class="category-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%; background: ${cat.color}"></div>
          </div>
          <div class="progress-text">${cat.completedCount} / ${cat.totalSteps} 완료</div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function getStatusIcon(status) {
  switch(status) {
    case 'completed': return 'fa-check-circle text-green-500';
    case 'in_progress': return 'fa-spinner fa-pulse text-blue-500';
    default: return 'fa-circle text-gray-300';
  }
}

// Select category and start process
async function selectCategory(categoryKey) {
  currentCategory = categoryKey;
  currentStepIndex = 0;
  stepHistory = [];
  
  const cat = categories[categoryKey];
  categorySteps = cat.steps || [];
  
  if (categorySteps.length === 0) {
    alert('이 카테고리에 단계가 없습니다.');
    return;
  }
  
  // Update UI
  document.getElementById('categoryView').style.display = 'none';
  document.getElementById('processView').style.display = 'flex';
  
  // Update header
  document.getElementById('currentCategoryName').textContent = cat.fullName;
  document.getElementById('currentCategoryName').style.color = cat.color;
  
  // Load first step
  await loadCurrentStep();
}

// Load current step details
async function loadCurrentStep() {
  if (currentStepIndex >= categorySteps.length) {
    // Category completed
    showCategoryCompleted();
    return;
  }
  
  const step = categorySteps[currentStepIndex];
  
  try {
    // Fetch step details with criteria
    const response = await axios.get(`/api/steps/${step.id}`);
    const stepData = response.data;
    
    renderStepQuestion(stepData);
    
    // Update progress
    updateProgressIndicator();
    
  } catch (error) {
    console.error('Failed to load step:', error);
    alert('단계 정보를 불러오는데 실패했습니다.');
  }
}

// Render step question
function renderStepQuestion(step) {
  const container = document.getElementById('stepQuestion');
  
  const cat = categories[currentCategory];
  const isDecision = step.step_type === 'decision';
  const hasMultipleCriteria = step.criteria && step.criteria.length > 1;
  
  let html = `
    <div class="step-card-mobile">
      <div class="step-header-mobile">
        <div class="step-number-badge" style="background: ${cat.color}">
          ${step.step_number}
        </div>
        <div class="step-type-badge ${step.step_type}">
          ${getStepTypeLabel(step.step_type)}
        </div>
      </div>
      
      <h2 class="step-title-mobile">${step.step_name}</h2>
      
      ${step.description ? `
        <div class="step-description-mobile">
          <i class="fas fa-info-circle mr-2"></i>
          ${step.description}
        </div>
      ` : ''}
      
      ${isDecision ? `
        <div class="decision-question">
          <i class="fas fa-question-circle mr-2"></i>
          Acceptable?
        </div>
      ` : ''}
      
      ${step.criteria && step.criteria.length > 0 ? `
        <div class="criteria-section-mobile">
          <div class="criteria-header-mobile" onclick="toggleCriteria()">
            <i class="fas fa-clipboard-list mr-2"></i>
            <span>판단 기준 보기</span>
            <span class="criteria-count">(${step.criteria.length})</span>
            <i class="fas fa-chevron-down ml-auto toggle-icon-criteria"></i>
          </div>
          <div id="criteriaContent" class="criteria-content-mobile" style="display: none;">
            ${renderCriteriaList(step.criteria)}
          </div>
        </div>
      ` : `
        <div class="no-criteria-mobile">
          <i class="fas fa-exclamation-circle mr-2"></i>
          등록된 판단 기준이 없습니다.
        </div>
      `}
    </div>
  `;
  
  container.innerHTML = html;
  
  // Enable/disable buttons
  document.getElementById('prevBtn').disabled = stepHistory.length === 0;
}

function renderCriteriaList(criteria) {
  let html = '<div class="criteria-list-mobile">';
  
  criteria.forEach((c, index) => {
    html += `
      <div class="criteria-item-mobile" onclick="showCriteriaDetails(${c.id})">
        <div class="criteria-item-header">
          <span class="criteria-number">${index + 1}</span>
          <span class="criteria-title">${c.criteria_title}</span>
          <i class="fas fa-chevron-right"></i>
        </div>
        ${c.criteria_description ? `
          <div class="criteria-desc">${c.criteria_description}</div>
        ` : ''}
      </div>
    `;
  });
  
  html += '</div>';
  return html;
}

function getStepTypeLabel(type) {
  switch(type) {
    case 'start': return '시작';
    case 'process': return '공정';
    case 'decision': return '판단';
    case 'end': return '완료';
    default: return '단계';
  }
}

// Toggle criteria visibility
function toggleCriteria() {
  const content = document.getElementById('criteriaContent');
  const icon = document.querySelector('.toggle-icon-criteria');
  
  if (content.style.display === 'none') {
    content.style.display = 'block';
    icon.classList.remove('fa-chevron-down');
    icon.classList.add('fa-chevron-up');
  } else {
    content.style.display = 'none';
    icon.classList.remove('fa-chevron-up');
    icon.classList.add('fa-chevron-down');
  }
}

// Show criteria details in modal
async function showCriteriaDetails(criteriaId) {
  const modal = document.getElementById('criteriaModal');
  const modalContent = document.getElementById('criteriaModalContent');
  
  try {
    modalContent.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-blue-500"></i></div>';
    modal.classList.add('active');
    
    const response = await axios.get(`/api/criteria/${criteriaId}`);
    const criteria = response.data;
    
    let html = `
      <div class="criteria-detail-modal">
        <h3 class="criteria-modal-title">${criteria.criteria_title}</h3>
        ${criteria.criteria_description ? `<p class="criteria-modal-desc">${criteria.criteria_description}</p>` : ''}
        
        <div class="conditions-grid-mobile">
          ${criteria.pass_condition ? `
            <div class="condition-card-mobile pass">
              <div class="condition-header">
                <i class="fas fa-check-circle"></i>
                <span>합격 조건</span>
              </div>
              <p>${criteria.pass_condition}</p>
            </div>
          ` : ''}
          
          ${criteria.fail_condition ? `
            <div class="condition-card-mobile fail">
              <div class="condition-header">
                <i class="fas fa-times-circle"></i>
                <span>불합격 조건</span>
              </div>
              <p>${criteria.fail_condition}</p>
            </div>
          ` : ''}
        </div>
        
        ${criteria.documents && criteria.documents.length > 0 ? `
          <div class="documents-section-mobile">
            <h4 class="documents-title-mobile">관련 자료</h4>
            ${renderDocumentsList(criteria.documents)}
          </div>
        ` : `
          <div class="no-documents-mobile">
            <i class="fas fa-folder-open mr-2"></i>
            등록된 관련 자료가 없습니다.
          </div>
        `}
      </div>
    `;
    
    modalContent.innerHTML = html;
    
  } catch (error) {
    console.error('Failed to load criteria:', error);
    modalContent.innerHTML = `
      <div class="text-center text-red-500 py-8">
        <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
        <p>정보를 불러오는데 실패했습니다.</p>
      </div>
    `;
  }
}

function renderDocumentsList(documents) {
  let html = '<div class="documents-list-mobile">';
  
  documents.forEach(doc => {
    const icon = getDocumentIcon(doc.document_type);
    const label = getDocumentTypeLabel(doc.document_type);
    
    html += `
      <div class="document-item-mobile">
        <div class="document-icon-mobile" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
          <i class="${icon}"></i>
        </div>
        <div class="document-info-mobile">
          <div class="document-title-mobile">${doc.title}</div>
          ${doc.description ? `<div class="document-desc-mobile">${doc.description}</div>` : ''}
          ${doc.file_url ? `<div class="document-url-mobile">${doc.file_url}</div>` : ''}
        </div>
        <span class="document-badge-mobile">${label}</span>
      </div>
    `;
  });
  
  html += '</div>';
  return html;
}

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

// Close criteria modal
function closeCriteriaModal() {
  document.getElementById('criteriaModal').classList.remove('active');
}

// Answer YES
function answerYes() {
  const step = categorySteps[currentStepIndex];
  
  // Save to history
  stepHistory.push({
    stepIndex: currentStepIndex,
    answer: 'yes',
    step: step
  });
  
  // Mark as completed
  completedSteps.push(step.id);
  
  // Move to next step
  currentStepIndex++;
  loadCurrentStep();
}

// Answer NO
function answerNo() {
  // For NO answer, we might want to show a message or take different action
  // For now, we'll just show an alert and not proceed
  alert('불합격 처리되었습니다. 해당 단계를 다시 확인해주세요.');
  
  // Optionally, you could still move to next step or stay at current
  // For this implementation, we stay at current step
}

// Go to previous step
function goPrevious() {
  if (stepHistory.length === 0) return;
  
  const lastHistory = stepHistory.pop();
  currentStepIndex = lastHistory.stepIndex;
  
  // Remove from completed
  const index = completedSteps.indexOf(lastHistory.step.id);
  if (index > -1) {
    completedSteps.splice(index, 1);
  }
  
  loadCurrentStep();
}

// Back to category selection
function backToCategories() {
  document.getElementById('processView').style.display = 'none';
  document.getElementById('categoryView').style.display = 'block';
  
  currentCategory = null;
  currentStepIndex = 0;
  categorySteps = [];
  stepHistory = [];
  
  // Reload category status
  loadCategoryStatus().then(() => renderCategoryList());
}

// Update progress indicator
function updateProgressIndicator() {
  const total = categorySteps.length;
  const current = currentStepIndex + 1;
  const percent = (currentStepIndex / total * 100).toFixed(0);
  
  document.getElementById('progressText').textContent = `${current} / ${total}`;
  document.getElementById('progressFill').style.width = `${percent}%`;
  
  const cat = categories[currentCategory];
  document.getElementById('progressFill').style.background = cat.color;
}

// Show category completed
function showCategoryCompleted() {
  const cat = categories[currentCategory];
  
  document.getElementById('stepQuestion').innerHTML = `
    <div class="completion-card">
      <div class="completion-icon" style="color: ${cat.color}">
        <i class="fas fa-check-circle"></i>
      </div>
      <h2 class="completion-title">${cat.fullName} 완료!</h2>
      <p class="completion-message">
        모든 단계를 완료했습니다.<br>
        다른 카테고리를 진행하거나 메인으로 돌아가세요.
      </p>
      <button onclick="backToCategories()" class="btn-completion">
        <i class="fas fa-home mr-2"></i>
        메인으로 돌아가기
      </button>
    </div>
  `;
  
  // Update category status
  cat.status = 'completed';
  cat.completedCount = cat.totalSteps;
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  const modal = document.getElementById('criteriaModal');
  if (e.target === modal) {
    closeCriteriaModal();
  }
});
