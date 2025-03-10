// Admin Dashboard JavaScript

// DOM Elements
const sections = document.querySelectorAll(".content-section")
const navItems = document.querySelectorAll(".sidebar nav ul li")
const reportModal = document.getElementById("report-modal")
const closeModalBtn = document.querySelector(".close-modal")
const closeModalFooterBtn = document.getElementById("close-modal")
const saveReportBtn = document.getElementById("save-report")
const submitCommentBtn = document.getElementById("submit-comment")
const logoutBtn = document.getElementById("logout-btn")
const applyFiltersBtn = document.getElementById("apply-filters")
const prevPageBtn = document.getElementById("prev-page")
const nextPageBtn = document.getElementById("next-page")
const exportCsvBtn = document.getElementById("export-csv")
const exportPdfBtn = document.getElementById("export-pdf")
const exportExcelBtn = document.getElementById("export-excel")
const settingsForm = document.getElementById("settings-form")

// Dashboard stats elements
const totalRisksEl = document.getElementById("total-risks")
const pendingRisksEl = document.getElementById("pending-risks")
const inProgressRisksEl = document.getElementById("in-progress-risks")
const resolvedRisksEl = document.getElementById("resolved-risks")

// Tables
const recentReportsTable = document.getElementById("recent-reports-body")
const reportsTable = document.getElementById("reports-body")

// Pagination
let currentPage = 1
const reportsPerPage = 10
let filteredReports = []

// Initialize the admin dashboard
function initAdminDashboard() {
  // Load reports from localStorage
  const reports = getReportsFromStorage()

  // Update dashboard stats
  updateDashboardStats(reports)

  // Load recent reports
  loadRecentReports(reports)

  // Load all reports for the reports section
  filteredReports = [...reports]
  loadReportsTable(reports, currentPage)
  updatePagination()

  // Setup event listeners
  setupEventListeners()
}

// Get reports from localStorage
function getReportsFromStorage() {
  return JSON.parse(localStorage.getItem("riskReports")) || []
}

// Update dashboard statistics
function updateDashboardStats(reports) {
  const total = reports.length
  const pending = reports.filter((report) => report.status === "pending").length
  const inProgress = reports.filter((report) => report.status === "in-progress").length
  const resolved = reports.filter((report) => report.status === "resolved").length

  totalRisksEl.textContent = total
  pendingRisksEl.textContent = pending
  inProgressRisksEl.textContent = inProgress
  resolvedRisksEl.textContent = resolved
}

// Load recent reports (last 5)
function loadRecentReports(reports) {
  recentReportsTable.innerHTML = ""

  // Sort reports by timestamp (newest first) and take the first 5
  const recentReports = [...reports].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5)

  if (recentReports.length === 0) {
    const row = document.createElement("tr")
    row.innerHTML = `<td colspan="6">Nenhum relatório encontrado</td>`
    recentReportsTable.appendChild(row)
    return
  }

  recentReports.forEach((report) => {
    const row = document.createElement("tr")

    const date = new Date(report.timestamp).toLocaleDateString("pt-BR")

    row.innerHTML = `
      <td>${report.id.slice(0, 8)}</td>
      <td>${date}</td>
      <td>${report.location}</td>
      <td>${report.risk}</td>
      <td><span class="status-badge status-${report.status}">${getStatusText(report.status)}</span></td>
      <td>
        <div class="action-buttons">
          <button class="action-btn view-btn" data-id="${report.id}"><i class="fas fa-eye"></i></button>
          <button class="action-btn edit-btn" data-id="${report.id}"><i class="fas fa-edit"></i></button>
          <button class="action-btn delete-btn" data-id="${report.id}"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `

    recentReportsTable.appendChild(row)
  })

  // Add event listeners to action buttons
  addActionButtonListeners()
}

// Load reports table with pagination
function loadReportsTable(reports, page) {
  reportsTable.innerHTML = ""

  const startIndex = (page - 1) * reportsPerPage
  const endIndex = startIndex + reportsPerPage
  const paginatedReports = reports.slice(startIndex, endIndex)

  if (paginatedReports.length === 0) {
    const row = document.createElement("tr")
    row.innerHTML = `<td colspan="7">Nenhum relatório encontrado</td>`
    reportsTable.appendChild(row)
    return
  }

  paginatedReports.forEach((report) => {
    const row = document.createElement("tr")

    const date = new Date(report.timestamp).toLocaleDateString("pt-BR")

    row.innerHTML = `
      <td>${report.id.slice(0, 8)}</td>
      <td>${date}</td>
      <td>${report.location}</td>
      <td>${report.agent}</td>
      <td>${report.risk}</td>
      <td><span class="status-badge status-${report.status}">${getStatusText(report.status)}</span></td>
      <td>
        <div class="action-buttons">
          <button class="action-btn view-btn" data-id="${report.id}"><i class="fas fa-eye"></i></button>
          <button class="action-btn edit-btn" data-id="${report.id}"><i class="fas fa-edit"></i></button>
          <button class="action-btn delete-btn" data-id="${report.id}"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `

    reportsTable.appendChild(row)
  })

  // Add event listeners to action buttons
  addActionButtonListeners()
}

// Update pagination controls
function updatePagination() {
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage)
  document.getElementById("page-info").textContent = `Página ${currentPage} de ${totalPages || 1}`

  prevPageBtn.disabled = currentPage <= 1
  nextPageBtn.disabled = currentPage >= totalPages
}

// Get status text based on status code
function getStatusText(status) {
  switch (status) {
    case "pending":
      return "Pendente"
    case "in-progress":
      return "Em Progresso"
    case "resolved":
      return "Resolvido"
    default:
      return "Desconhecido"
  }
}

// Add event listeners to action buttons
function addActionButtonListeners() {
  // View buttons
  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const reportId = btn.dataset.id
      openReportModal(reportId, "view")
    })
  })

  // Edit buttons
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const reportId = btn.dataset.id
      openReportModal(reportId, "edit")
    })
  })

  // Delete buttons
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const reportId = btn.dataset.id
      if (confirm("Tem certeza que deseja excluir este relatório?")) {
        deleteReport(reportId)
      }
    })
  })
}

// Open report modal
function openReportModal(reportId, mode) {
  const reports = getReportsFromStorage()
  const report = reports.find((r) => r.id === reportId)

  if (!report) {
    alert("Relatório não encontrado!")
    return
  }

  // Fill modal with report details
  document.getElementById("detail-id").textContent = report.id
  document.getElementById("detail-date").textContent = new Date(report.timestamp).toLocaleString("pt-BR")
  document.getElementById("detail-location").textContent = report.location
  document.getElementById("detail-agent").textContent = report.agent
  document.getElementById("detail-risk").textContent = report.risk
  document.getElementById("detail-observation").textContent = report.observation || "Nenhuma observação"

  // Set status
  const statusSelect = document.getElementById("detail-status")
  statusSelect.value = report.status

  // Show photo if available
  const photoContainer = document.getElementById("detail-photo")
  if (report.photoData) {
    photoContainer.innerHTML = `<img src="${report.photoData}" alt="Foto do local">`
  } else {
    photoContainer.innerHTML = `<p>Nenhuma foto disponível</p>`
  }

  // Load comments
  loadComments(report)

  // Store current report ID for saving
  saveReportBtn.dataset.reportId = reportId
  submitCommentBtn.dataset.reportId = reportId

  // Show modal
  reportModal.style.display = "block"
}

// Load comments for a report
function loadComments(report) {
  const commentsContainer = document.getElementById("detail-comments")
  commentsContainer.innerHTML = ""

  if (!report.comments || report.comments.length === 0) {
    commentsContainer.innerHTML = "<p>Nenhum comentário ainda.</p>"
    return
  }

  report.comments.forEach((comment) => {
    const commentEl = document.createElement("div")
    commentEl.className = "comment"

    commentEl.innerHTML = `
      <div class="comment-header">
        <span>${comment.author}</span>
        <span>${new Date(comment.timestamp).toLocaleString("pt-BR")}</span>
      </div>
      <div class="comment-body">
        ${comment.text}
      </div>
    `

    commentsContainer.appendChild(commentEl)
  })
}

// Save report changes
function saveReportChanges(reportId) {
  const reports = getReportsFromStorage()
  const reportIndex = reports.findIndex((r) => r.id === reportId)

  if (reportIndex === -1) {
    alert("Relatório não encontrado!")
    return
  }

  // Update status
  const newStatus = document.getElementById("detail-status").value
  reports[reportIndex].status = newStatus

  // Save to localStorage
  localStorage.setItem("riskReports", JSON.stringify(reports))

  // Refresh data
  updateDashboardStats(reports)
  loadRecentReports(reports)
  filteredReports = [...reports]
  loadReportsTable(filteredReports, currentPage)
  updatePagination()

  // Close modal
  reportModal.style.display = "none"

  // Show success message
  alert("Relatório atualizado com sucesso!")
}

// Add a comment to a report
function addComment(reportId) {
  const commentText = document.getElementById("new-comment").value.trim()

  if (!commentText) {
    alert("Por favor, digite um comentário.")
    return
  }

  const reports = getReportsFromStorage()
  const reportIndex = reports.findIndex((r) => r.id === reportId)

  if (reportIndex === -1) {
    alert("Relatório não encontrado!")
    return
  }

  // Initialize comments array if it doesn't exist
  if (!reports[reportIndex].comments) {
    reports[reportIndex].comments = []
  }

  // Add new comment
  const newComment = {
    id: Date.now().toString(36),
    author: "Administrador",
    timestamp: new Date().toISOString(),
    text: commentText,
  }

  reports[reportIndex].comments.push(newComment)

  // Save to localStorage
  localStorage.setItem("riskReports", JSON.stringify(reports))

  // Reload comments
  loadComments(reports[reportIndex])

  // Clear comment input
  document.getElementById("new-comment").value = ""
}

// Delete a report
function deleteReport(reportId) {
  let reports = getReportsFromStorage()
  reports = reports.filter((r) => r.id !== reportId)

  // Save to localStorage
  localStorage.setItem("riskReports", JSON.stringify(reports))

  // Refresh data
  updateDashboardStats(reports)
  loadRecentReports(reports)
  filteredReports = [...reports]
  loadReportsTable(filteredReports, currentPage)
  updatePagination()

  // Show success message
  alert("Relatório excluído com sucesso!")
}

// Apply filters to reports
function applyFilters() {
  const statusFilter = document.getElementById("status-filter").value
  const agentFilter = document.getElementById("agent-filter").value
  const dateFilter = document.getElementById("date-filter").value

  let reports = getReportsFromStorage()

  // Apply status filter
  if (statusFilter !== "all") {
    reports = reports.filter((r) => r.status === statusFilter)
  }

  // Apply agent filter (this is simplified, in a real app you'd match the agent name)
  if (agentFilter !== "all") {
    reports = reports.filter((r) => r.agent.toLowerCase().includes(agentFilter))
  }

  // Apply date filter
  if (dateFilter) {
    const filterDate = new Date(dateFilter).setHours(0, 0, 0, 0)
    reports = reports.filter((r) => {
      const reportDate = new Date(r.timestamp).setHours(0, 0, 0, 0)
      return reportDate === filterDate
    })
  }

  // Update filtered reports and reset to page 1
  filteredReports = [...reports]
  currentPage = 1
  loadReportsTable(filteredReports, currentPage)
  updatePagination()
}

// Export reports to CSV
function exportToCSV() {
  const reports = getReportsFromStorage()

  if (reports.length === 0) {
    alert("Não há relatórios para exportar.")
    return
  }

  // Create CSV header
  let csv = "ID,Data,Local,Agente,Risco,Status,Observação\n"

  // Add each report as a row
  reports.forEach((report) => {
    const date = new Date(report.timestamp).toLocaleDateString("pt-BR")
    const observation = report.observation ? report.observation.replace(/,/g, ";").replace(/\n/g, " ") : ""

    csv += `${report.id},${date},${report.location},${report.agent},${report.risk},${getStatusText(report.status)},${observation}\n`
  })

  // Create download link
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", "relatorios_de_risco.csv")
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Setup event listeners
function setupEventListeners() {
  // Navigation
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const sectionId = item.dataset.section

      // Update active nav item
      navItems.forEach((navItem) => navItem.classList.remove("active"))
      item.classList.add("active")

      // Show selected section
      sections.forEach((section) => section.classList.remove("active"))
      document.getElementById(`${sectionId}-section`).classList.add("active")
    })
  })

  // Modal close buttons
  closeModalBtn.addEventListener("click", () => {
    reportModal.style.display = "none"
  })

  closeModalFooterBtn.addEventListener("click", () => {
    reportModal.style.display = "none"
  })

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === reportModal) {
      reportModal.style.display = "none"
    }
  })

  // Save report button
  saveReportBtn.addEventListener("click", () => {
    const reportId = saveReportBtn.dataset.reportId
    saveReportChanges(reportId)
  })

  // Submit comment button
  submitCommentBtn.addEventListener("click", () => {
    const reportId = submitCommentBtn.dataset.reportId
    addComment(reportId)
  })

  // Logout button
  logoutBtn.addEventListener("click", () => {
    if (confirm("Tem certeza que deseja sair?")) {
      window.location.href = "../index.html"
    }
  })

  // Apply filters button
  applyFiltersBtn.addEventListener("click", applyFilters)

  // Pagination buttons
  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--
      loadReportsTable(filteredReports, currentPage)
      updatePagination()
    }
  })

  nextPageBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredReports.length / reportsPerPage)
    if (currentPage < totalPages) {
      currentPage++
      loadReportsTable(filteredReports, currentPage)
      updatePagination()
    }
  })

  // Export buttons
  exportCsvBtn.addEventListener("click", exportToCSV)

  exportPdfBtn.addEventListener("click", () => {
    alert("Funcionalidade de exportação para PDF será implementada em breve.")
  })

  exportExcelBtn.addEventListener("click", () => {
    alert("Funcionalidade de exportação para Excel será implementada em breve.")
  })

  // Settings form
  settingsForm.addEventListener("submit", (e) => {
    e.preventDefault()
    alert("Configurações salvas com sucesso!")
  })
}

// Initialize the admin dashboard when the DOM is loaded
document.addEventListener("DOMContentLoaded", initAdminDashboard)

