// Risk data
const riskData = {
  fisico: {
    name: "Físico",
    description: "Riscos relacionados a fatores físicos do ambiente",
    risks: [
      { id: "f1", name: "Ruído" },
      { id: "f2", name: "Vibração" },
      { id: "f3", name: "Radiação" },
      { id: "f4", name: "Temperaturas extremas" },
      { id: "f5", name: "Pressão anormal" },
      { id: "f6", name: "Umidade" },
    ],
  },
  quimico: {
    name: "Químico",
    description: "Riscos relacionados a substâncias químicas",
    risks: [
      { id: "q1", name: "Poeiras" },
      { id: "q2", name: "Fumos" },
      { id: "q3", name: "Névoas" },
      { id: "q4", name: "Neblinas" },
      { id: "q5", name: "Gases" },
      { id: "q6", name: "Vapores" },
      { id: "q7", name: "Produtos químicos em geral" },
    ],
  },
  biologico: {
    name: "Biológico",
    description: "Riscos relacionados a agentes biológicos",
    risks: [
      { id: "b1", name: "Vírus" },
      { id: "b2", name: "Bactérias" },
      { id: "b3", name: "Protozoários" },
      { id: "b4", name: "Fungos" },
      { id: "b5", name: "Parasitas" },
      { id: "b6", name: "Insetos" },
    ],
  },
  ergonomico: {
    name: "Ergonômico",
    description: "Riscos relacionados a fatores ergonômicos",
    risks: [
      { id: "e1", name: "Esforço físico intenso" },
      { id: "e2", name: "Levantamento de peso" },
      { id: "e3", name: "Postura inadequada" },
      { id: "e4", name: "Controle rígido de produtividade" },
      { id: "e5", name: "Trabalho em turno noturno" },
      { id: "e6", name: "Jornadas prolongadas" },
      { id: "e7", name: "Monotonia e repetitividade" },
    ],
  },
  acidente: {
    name: "Acidente",
    description: "Riscos relacionados a acidentes",
    risks: [
      { id: "a1", name: "Arranjo físico inadequado" },
      { id: "a2", name: "Máquinas sem proteção" },
      { id: "a3", name: "Ferramentas defeituosas" },
      { id: "a4", name: "Iluminação inadequada" },
      { id: "a5", name: "Eletricidade" },
      { id: "a6", name: "Probabilidade de incêndio ou explosão" },
      { id: "a7", name: "Armazenamento inadequado" },
    ],
  },
}

// Application state
let appState = {
  currentScreen: "home",
  selectedAgent: null,
  selectedRisk: null,
  scannedLocation: null,
  photoData: null,
}

// DOM Elements
const appContent = document.getElementById("app-content")
const templates = {
  homeScreen: document.getElementById("home-screen"),
  riskSelectionScreen: document.getElementById("risk-selection-screen"),
  reportRiskScreen: document.getElementById("report-risk-screen"),
  confirmationScreen: document.getElementById("confirmation-screen"),
}

// Initialize the application
function initApp() {
  renderScreen("home")
  setupQRScanner()
}

// Render the current screen
function renderScreen(screenName) {
  appState.currentScreen = screenName
  appContent.innerHTML = ""

  switch (screenName) {
    case "home":
      renderHomeScreen()
      break
    case "riskSelection":
      renderRiskSelectionScreen()
      break
    case "reportRisk":
      renderReportRiskScreen()
      break
    case "confirmation":
      renderConfirmationScreen()
      break
    default:
      renderHomeScreen()
  }
}

// Render home screen
function renderHomeScreen() {
  const clone = templates.homeScreen.content.cloneNode(true)
  appContent.appendChild(clone)

  // Setup event listeners
  document.getElementById("scan-qr").addEventListener("click", startQRScanner)
  document.getElementById("quick-access-btn").addEventListener("click", () => showQuickAccess())

  // Setup risk agent selection
  const riskAgents = document.querySelectorAll(".risk-agent")
  riskAgents.forEach((agent) => {
    agent.addEventListener("click", () => {
      const agentType = agent.dataset.agent
      selectRiskAgent(agentType)
    })
  })
}

// Render risk selection screen
function renderRiskSelectionScreen() {
  const clone = templates.riskSelectionScreen.content.cloneNode(true)
  appContent.appendChild(clone)

  // Update agent information
  const agent = riskData[appState.selectedAgent]
  document.getElementById("selected-agent-name").textContent = `Agente ${agent.name}`
  document.getElementById("selected-agent-desc").textContent = agent.description

  // Populate risks list
  const risksList = document.getElementById("risks-list")
  agent.risks.forEach((risk) => {
    const riskItem = document.createElement("div")
    riskItem.className = "risk-item"
    riskItem.dataset.riskId = risk.id
    riskItem.textContent = risk.name
    riskItem.addEventListener("click", () => selectRisk(risk))
    risksList.appendChild(riskItem)
  })

  // Setup back button
  document.getElementById("back-to-home").addEventListener("click", () => renderScreen("home"))
}

// Render report risk screen
function renderReportRiskScreen() {
  const clone = templates.reportRiskScreen.content.cloneNode(true)
  appContent.appendChild(clone)

  // Update selected risk information
  const agent = riskData[appState.selectedAgent]
  const risk = agent.risks.find((r) => r.id === appState.selectedRisk.id)

  document.getElementById("selected-risk-name").textContent = risk.name
  document.getElementById("selected-risk-agent").textContent = `Agente: ${agent.name}`

  // If location was scanned from QR code, pre-fill the location field
  const locationInput = document.getElementById("location")
  if (appState.scannedLocation) {
    locationInput.value = appState.scannedLocation
  }

  // Setup photo upload preview
  const photoInput = document.getElementById("photo")
  const photoPreview = document.getElementById("photo-preview")

  photoInput.addEventListener("change", (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        appState.photoData = event.target.result
        const img = document.createElement("img")
        img.src = event.target.result
        photoPreview.innerHTML = ""
        photoPreview.appendChild(img)
      }
      reader.readAsDataURL(file)
    }
  })

  // Setup form submission
  const form = document.getElementById("risk-report-form")
  form.addEventListener("submit", (e) => {
    e.preventDefault()
    submitRiskReport()
  })

  // Setup back button
  document.getElementById("back-to-risks").addEventListener("click", () => renderScreen("riskSelection"))
}

// Render confirmation screen
function renderConfirmationScreen() {
  const clone = templates.confirmationScreen.content.cloneNode(true)
  appContent.appendChild(clone)

  // Setup back to start button
  document.getElementById("back-to-start").addEventListener("click", () => {
    resetAppState()
    renderScreen("home")
  })
}

// Select a risk agent
function selectRiskAgent(agentType) {
  appState.selectedAgent = agentType
  renderScreen("riskSelection")
}

// Select a specific risk
function selectRisk(risk) {
  appState.selectedRisk = risk
  renderScreen("reportRisk")
}

// Show quick access form
function showQuickAccess() {
  // For quick access, we'll just go to agent selection first
  renderScreen("home")
  // You could also implement a direct form here if needed
}

// Submit risk report
function submitRiskReport() {
  const location = document.getElementById("location").value
  const observation = document.getElementById("observation").value

  // Create report object
  const report = {
    id: generateUniqueId(),
    timestamp: new Date().toISOString(),
    agent: riskData[appState.selectedAgent].name,
    risk: appState.selectedRisk.name,
    location: location,
    observation: observation,
    photoData: appState.photoData,
    status: "pending", // pending, in-progress, resolved
  }

  // Save report to localStorage
  saveReport(report)

  // Show confirmation screen
  renderScreen("confirmation")
}

// Setup QR Scanner
function setupQRScanner() {
  // This is just a placeholder. In a real app, you'd implement actual QR scanning
  // using a library like html5-qrcode
}

// Start QR Scanner
function startQRScanner() {
  // In a real implementation, this would activate the camera and scan for QR codes
  // For demo purposes, we'll simulate a successful scan

  setTimeout(() => {
    const simulatedLocation = "Laboratório de Química - Sala 101"
    handleQRScanResult(simulatedLocation)
  }, 1000)
}

// Handle QR Scan Result
function handleQRScanResult(location) {
  appState.scannedLocation = location
  alert(`Local escaneado: ${location}`)
  // After scanning, we'd typically go to risk selection
  renderScreen("home")
}

// Save report to localStorage
function saveReport(report) {
  const reports = JSON.parse(localStorage.getItem("riskReports")) || []
  reports.push(report)
  localStorage.setItem("riskReports", JSON.stringify(reports))
}

// Generate a unique ID for reports
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

// Reset application state
function resetAppState() {
  appState = {
    currentScreen: "home",
    selectedAgent: null,
    selectedRisk: null,
    scannedLocation: null,
    photoData: null,
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", initApp)

