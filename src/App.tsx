import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronRight,
  ClipboardCheck,
  FileSearch,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  ShieldAlert,
  ShieldCheck,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';

import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import {
  createAudit,
  createFinding,
  updateFinding,
  updateAudit,
  getAudits,
  getFindings,
  getOrganizations,
  getAllOrganizations,
  createOrganization,
  updateOrganization,
  setOrganizationActive,
} from './services/audit.service';
import type { Audit, AuditFinding } from './types/audit';
import type {
  OrganizationOption,
  Organization,
} from './services/audit.service';
import {
  formatAuditStatus,
  formatRiskLevel,
} from './lib/utils';
import {
  buildExecutiveAuditReport,
  saveReportDraft,
  generateStoredReport,
  approveStoredReport,
} from './services/report.service';
import type { StoredReport } from './services/report.service';
import {
  getAdminUsers,
  changeUserRole,
} from './services/admin-users.service';
import type {
  AdminUser,
  AppUserRole,
} from './services/admin-users.service';

import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  markTransactionReviewed,
  approveTransaction,
  rejectTransaction,
  getPendingAlerts,
  getTransactionReviews,
  getTransactionTotal,
  getFlaggedTransactions,
} from './services/transaction.service';

import type {
  Transaction,
  TransactionReview,
  TransactionStatus,
} from './services/transaction.service';

import { OperationsSuite } from './components/OperationsSuite';

import { GovernanceSuite } from './components/GovernanceSuite';

import { EnterpriseRiskSuite } from './components/EnterpriseRiskSuite';

import { ConsolidationCenter } from './components/ConsolidationCenter';

function App() {
  const {
    user,
    role,
    loading: authLoading,
    signOut,
  } = useAuth();

  const canWrite =
    role === 'admin' || role === 'auditor';

  const canApproveReports =
    role === 'admin';

  function getReviewerIdentity(
    reviewerId: string | null
  ) {
    if (!reviewerId) {
      return {
        email: 'Sistema / SQL',
        roleLabel: 'Sistema',
      };
    }

    if (reviewerId === user?.id) {
      const roleLabel =
        role === 'admin'
          ? 'Administrador'
          : role === 'auditor'
            ? 'Auditor'
            : 'Consulta';

      return {
        email: user.email ?? reviewerId,
        roleLabel,
      };
    }

    const adminUser = adminUsers.find(
      (item) => item.id === reviewerId
    );

    if (adminUser) {
      const roleLabel =
        adminUser.role === 'admin'
          ? 'Administrador'
          : adminUser.role === 'auditor'
            ? 'Auditor'
            : 'Consulta';

      return {
        email: adminUser.email || reviewerId,
        roleLabel,
      };
    }

    return {
      email: reviewerId,
      roleLabel: 'Usuario',
    };
  }

  const [showUsersCenter, setShowUsersCenter] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [changingUserId, setChangingUserId] = useState<string | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [showAuditsCenter, setShowAuditsCenter] = useState(false);
  const [showRisksCenter, setShowRisksCenter] = useState(false);
  const [showTransactionsCenter, setShowTransactionsCenter] = useState(false);
  const [showTransactionAlerts, setShowTransactionAlerts] = useState(false);

  const [decisionTransaction, setDecisionTransaction] =
    useState<Transaction | null>(null);

  const [decisionType, setDecisionType] =
    useState<'approved' | 'rejected' | null>(null);

  const [decisionComment, setDecisionComment] =
    useState('');

  const [savingDecision, setSavingDecision] =
    useState(false);

  const [decisionError, setDecisionError] =
    useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const [transactionReviews, setTransactionReviews] =
    useState<TransactionReview[]>([]);

  const [loadingTransactionReviews, setLoadingTransactionReviews] =
    useState(false);

  const [transactionReviewsError, setTransactionReviewsError] =
    useState<string | null>(null);
  const [savingTransaction, setSavingTransaction] = useState(false);
  const [transactionStatusFilter, setTransactionStatusFilter] =
    useState<'all' | TransactionStatus>('all');
  const [transactionAnomalyFilter, setTransactionAnomalyFilter] =
    useState<'all' | 'anomaly' | 'normal'>('all');
  const [showNewAudit, setShowNewAudit] = useState(false);
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
  const [showOrganizationsCenter, setShowOrganizationsCenter] = useState(false);
  const [showNewOrganization, setShowNewOrganization] = useState(false);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [savingOrganization, setSavingOrganization] = useState(false);
  const [organizationError, setOrganizationError] =
    useState<string | null>(null);
  const [creatingAudit, setCreatingAudit] = useState(false);
  const [auditFormError, setAuditFormError] = useState<string | null>(null);
  const [showNewFinding, setShowNewFinding] = useState(false);
  const [showFindingsCenter, setShowFindingsCenter] = useState(false);
  const [showReportsCenter, setShowReportsCenter] = useState(false);
  const [reportAuditId, setReportAuditId] = useState('');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [storedReport, setStoredReport] = useState<StoredReport | null>(null);
  const [savingReport, setSavingReport] = useState(false);
  const [reportWorkflowError, setReportWorkflowError] =
    useState<string | null>(null);
  const [auditorName, setAuditorName] = useState('');
  const [approverName, setApproverName] = useState('');
  const [creatingFinding, setCreatingFinding] = useState(false);
  const [findingFormError, setFindingFormError] = useState<string | null>(null);

  const [transactionForm, setTransactionForm] = useState({
    auditId: '',
    organizationId: '',
    transactionDate: new Date().toISOString().slice(0, 16),
    reference: '',
    description: '',
    accountCode: '',
    counterparty: '',
    amount: 0,
    currency: 'DOP',
    status: 'pending' as TransactionStatus,
    anomalyScore: '',
    isAnomaly: false,
    aiExplanation: '',
  });

  const [findingForm, setFindingForm] = useState({
    auditId: '',
    title: '',
    description: '',
    category: 'Seguridad',
    riskLevel: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    status: 'open' as 'open' | 'investigating' | 'resolved' | 'accepted',
    score: 5,
    recommendation: '',
  });

  const [selectedFinding, setSelectedFinding] =
    useState<AuditFinding | null>(null);

  const [savingFinding, setSavingFinding] = useState(false);

  const [editFindingError, setEditFindingError] =
    useState<string | null>(null);

  const [editFindingForm, setEditFindingForm] = useState({
    auditId: '',
    title: '',
    description: '',
    category: '',
    riskLevel: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    status: 'open' as 'open' | 'investigating' | 'resolved' | 'accepted',
    score: 0,
    recommendation: '',
  });
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [savingAudit, setSavingAudit] = useState(false);
  const [editAuditError, setEditAuditError] = useState<string | null>(null);

  const [audits, setAudits] = useState<Audit[]>([]);
  const [findings, setFindings] = useState<AuditFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [editForm, setEditForm] = useState({
    organizationId: '',
    name: '',
    type: '',
    status: 'draft' as 'draft' | 'in_progress' | 'completed',
    riskLevel: 'low' as 'low' | 'medium' | 'high' | 'critical',
    progress: 0,
    score: '',
    scope: '',
    objectives: '',
    methodology: '',
  });

  const [organizationForm, setOrganizationForm] = useState({
    name: '',
    legalName: '',
    industry: '',
    taxId: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    active: true,
  });

  const [form, setForm] = useState({
    organizationId: '',
    name: '',
    type: 'Ciberseguridad',
    status: 'draft' as 'draft' | 'in_progress' | 'completed',
    riskLevel: 'low' as 'low' | 'medium' | 'high' | 'critical',
    progress: 0,
    scope: '',
    objectives: '',
    methodology: '',
  });
useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const [
          auditsData,
          findingsData,
          organizationsData,
          transactionsData,
        ] = await Promise.all([
          getAudits(),
          getFindings(),
          getOrganizations(),
          getTransactions(),
        ]);

        setAudits(auditsData);
        setFindings(findingsData);
        setOrganizations(organizationsData);
        setTransactions(transactionsData);

        setForm((current) => ({
          ...current,
          organizationId:
            current.organizationId || organizationsData[0]?.id || '',
        }));
      } catch (err) {
        console.error('Error cargando dashboard:', err);

        setError(
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar los datos.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user, refreshKey]);

  async function handleCreateAudit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setAuditFormError(null);

    if (!form.organizationId || !form.name.trim() || !form.type.trim()) {
      setAuditFormError(
        'Organización, nombre y tipo de auditoría son obligatorios.'
      );
      return;
    }

    try {
      setCreatingAudit(true);

      await createAudit({
        organizationId: form.organizationId,
        name: form.name,
        type: form.type,
        status: form.status,
        riskLevel: form.riskLevel,
        progress: form.progress,
        scope: form.scope,
        objectives: form.objectives,
        methodology: form.methodology,
      });

      setShowNewAudit(false);

      setForm({
        organizationId: form.organizationId,
        name: '',
        type: 'Ciberseguridad',
        status: 'draft',
        riskLevel: 'low',
        progress: 0,
        scope: '',
        objectives: '',
        methodology: '',
      });

      setRefreshKey((value) => value + 1);
    } catch (err) {
      console.error('Error creando auditoría:', err);

      setAuditFormError(
        err instanceof Error
          ? err.message
          : 'No se pudo crear la auditoría.'
      );
    } finally {
      setCreatingAudit(false);
    }
  }

  function openAuditDetail(audit: Audit) {
    setEditAuditError(null);
    setSelectedAudit(audit);

    setEditForm({
      organizationId: audit.organizationId,
      name: audit.name,
      type: audit.type,
      status: audit.status,
      riskLevel: audit.riskLevel,
      progress: audit.progress,
      score: audit.score !== null ? String(audit.score) : '',
      scope: audit.scope,
      objectives: audit.objectives,
      methodology: audit.methodology,
    });
  }

  async function handleUpdateAudit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!selectedAudit) return;

    setEditAuditError(null);

    if (
      !editForm.organizationId ||
      !editForm.name.trim() ||
      !editForm.type.trim()
    ) {
      setEditAuditError(
        'Organización, nombre y tipo son obligatorios.'
      );
      return;
    }

    try {
      setSavingAudit(true);

      await updateAudit({
        id: selectedAudit.id,
        organizationId: editForm.organizationId,
        name: editForm.name,
        type: editForm.type,
        status: editForm.status,
        riskLevel: editForm.riskLevel,
        progress: Number(editForm.progress),
        score:
          editForm.score.trim() === ''
            ? null
            : Number(editForm.score),
        scope: editForm.scope,
        objectives: editForm.objectives,
        methodology: editForm.methodology,
      });

      setSelectedAudit(null);
      setRefreshKey((value) => value + 1);
    } catch (err) {
      console.error('Error actualizando auditoría:', err);

      setEditAuditError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar la auditoría.'
      );
    } finally {
      setSavingAudit(false);
    }
  }

  async function handleCreateFinding(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setFindingFormError(null);

    if (
      !findingForm.auditId ||
      !findingForm.title.trim() ||
      !findingForm.category.trim()
    ) {
      setFindingFormError(
        'Auditoría, título y categoría son obligatorios.'
      );
      return;
    }

    try {
      setCreatingFinding(true);

      await createFinding({
        auditId: findingForm.auditId,
        title: findingForm.title,
        description: findingForm.description,
        category: findingForm.category,
        riskLevel: findingForm.riskLevel,
        status: findingForm.status,
        score: Number(findingForm.score),
        recommendation: findingForm.recommendation,
      });

      setShowNewFinding(false);

      setFindingForm({
        auditId: findingForm.auditId,
        title: '',
        description: '',
        category: 'Seguridad',
        riskLevel: 'medium',
        status: 'open',
        score: 5,
        recommendation: '',
      });

      setRefreshKey((value) => value + 1);
    } catch (err) {
      console.error('Error creando hallazgo:', err);

      setFindingFormError(
        err instanceof Error
          ? err.message
          : 'No se pudo crear el hallazgo.'
      );
    } finally {
      setCreatingFinding(false);
    }
  }


  function openFindingDetail(finding: AuditFinding) {
    setEditFindingError(null);
    setSelectedFinding(finding);

    setEditFindingForm({
      auditId: finding.auditId,
      title: finding.title,
      description: finding.description,
      category: finding.category,
      riskLevel: finding.riskLevel,
      status: finding.status,
      score: finding.score,
      recommendation: finding.recommendation,
    });
  }

  async function handleUpdateFinding(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!selectedFinding) return;

    setEditFindingError(null);

    if (
      !editFindingForm.auditId ||
      !editFindingForm.title.trim() ||
      !editFindingForm.category.trim()
    ) {
      setEditFindingError(
        'Auditoría, título y categoría son obligatorios.'
      );
      return;
    }

    const score = Number(editFindingForm.score);

    if (!Number.isFinite(score) || score < 0 || score > 10) {
      setEditFindingError(
        'El score debe ser un número entre 0 y 10.'
      );
      return;
    }

    try {
      setSavingFinding(true);

      await updateFinding({
        id: selectedFinding.id,
        auditId: editFindingForm.auditId,
        title: editFindingForm.title,
        description: editFindingForm.description,
        category: editFindingForm.category,
        riskLevel: editFindingForm.riskLevel,
        status: editFindingForm.status,
        score,
        recommendation: editFindingForm.recommendation,
      });

      setSelectedFinding(null);
      setRefreshKey((value) => value + 1);
    } catch (err) {
      console.error('Error actualizando hallazgo:', err);

      setEditFindingError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar el hallazgo.'
      );
    } finally {
      setSavingFinding(false);
    }
  }

  async function loadOrganizationsCenter() {
    try {
      setOrganizationError(null);

      const data = await getAllOrganizations();

      setAllOrganizations(data);
      setShowOrganizationsCenter(true);
    } catch (err) {
      console.error('Error cargando organizaciones:', err);

      setOrganizationError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar las organizaciones.'
      );
    }
  }

  function openNewOrganization() {
    setOrganizationError(null);
    setSelectedOrganization(null);

    setOrganizationForm({
      name: '',
      legalName: '',
      industry: '',
      taxId: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      active: true,
    });

    setShowNewOrganization(true);
  }

  function openOrganizationDetail(organization: Organization) {
    setOrganizationError(null);
    setSelectedOrganization(organization);

    setOrganizationForm({
      name: organization.name,
      legalName: organization.legalName,
      industry: organization.industry,
      taxId: organization.taxId,
      contactName: organization.contactName,
      contactEmail: organization.contactEmail,
      contactPhone: organization.contactPhone,
      active: organization.active,
    });
  }

  async function handleSaveOrganization(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setOrganizationError(null);

    if (!organizationForm.name.trim()) {
      setOrganizationError(
        'El nombre de la organización es obligatorio.'
      );
      return;
    }

    try {
      setSavingOrganization(true);

      if (selectedOrganization) {
        await updateOrganization({
          id: selectedOrganization.id,
          name: organizationForm.name,
          legalName: organizationForm.legalName,
          industry: organizationForm.industry,
          taxId: organizationForm.taxId,
          contactName: organizationForm.contactName,
          contactEmail: organizationForm.contactEmail,
          contactPhone: organizationForm.contactPhone,
          active: organizationForm.active,
        });
      } else {
        await createOrganization({
          name: organizationForm.name,
          legalName: organizationForm.legalName,
          industry: organizationForm.industry,
          taxId: organizationForm.taxId,
          contactName: organizationForm.contactName,
          contactEmail: organizationForm.contactEmail,
          contactPhone: organizationForm.contactPhone,
        });
      }

      setShowNewOrganization(false);
      setSelectedOrganization(null);

      const [allData, activeData] = await Promise.all([
        getAllOrganizations(),
        getOrganizations(),
      ]);

      setAllOrganizations(allData);
      setOrganizations(activeData);

      setRefreshKey((value) => value + 1);
    } catch (err) {
      console.error('Error guardando organización:', err);

      setOrganizationError(
        err instanceof Error
          ? err.message
          : 'No se pudo guardar la organización.'
      );
    } finally {
      setSavingOrganization(false);
    }
  }

  async function handleOrganizationActive(
    organization: Organization
  ) {
    try {
      setOrganizationError(null);

      await setOrganizationActive(
        organization.id,
        !organization.active
      );

      const [allData, activeData] = await Promise.all([
        getAllOrganizations(),
        getOrganizations(),
      ]);

      setAllOrganizations(allData);
      setOrganizations(activeData);

      if (selectedOrganization?.id === organization.id) {
        setSelectedOrganization({
          ...organization,
          active: !organization.active,
        });
      }

      setRefreshKey((value) => value + 1);
    } catch (err) {
      console.error('Error actualizando organización:', err);

      setOrganizationError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar la organización.'
      );
    }
  }

  async function handleSaveReportDraft() {
    const audit = audits.find(
      (item) => item.id === reportAuditId
    );

    if (!audit) return;

    try {
      setSavingReport(true);
      setReportWorkflowError(null);

      const saved = await saveReportDraft({
        audit,
        findings,
        auditorName,
      });

      setStoredReport(saved);
    } catch (err) {
      console.error('Error guardando reporte:', err);

      setReportWorkflowError(
        err instanceof Error
          ? err.message
          : 'No se pudo guardar el reporte.'
      );
    } finally {
      setSavingReport(false);
    }
  }

  async function handleGenerateReportDirectly() {
    const audit = audits.find(
      (item) => item.id === reportAuditId
    );

    if (!audit || !user) {
      setReportWorkflowError(
        'Selecciona una auditoría antes de generar el informe.'
      );
      return;
    }

    try {
      setSavingReport(true);
      setReportWorkflowError(null);

      let reportToGenerate = storedReport;

      if (!reportToGenerate) {
        reportToGenerate = await saveReportDraft({
          audit,
          findings,
          auditorName,
        });

        setStoredReport(reportToGenerate);
      }

      await generateStoredReport(
        reportToGenerate.id,
        user.id
      );

      setStoredReport({
        ...reportToGenerate,
        status: 'generated',
        generatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error generando informe:', err);

      setReportWorkflowError(
        err instanceof Error
          ? err.message
          : 'No se pudo generar el informe.'
      );
    } finally {
      setSavingReport(false);
    }
  }

  async function handleApproveStoredReport() {
    if (!storedReport || !user) return;

    try {
      setSavingReport(true);
      setReportWorkflowError(null);

      await approveStoredReport(
        storedReport.id,
        user.id,
        approverName
      );

      setStoredReport({
        ...storedReport,
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approverName,
      });
    } catch (err) {
      console.error('Error aprobando reporte:', err);

      setReportWorkflowError(
        err instanceof Error
          ? err.message
          : 'No se pudo aprobar el reporte.'
      );
    } finally {
      setSavingReport(false);
    }
  }

  async function handleExportPdf() {
    const { jsPDF } =
      await import('jspdf');

    const audit = audits.find(
      (item) => item.id === reportAuditId
    );

    if (!audit) {
      console.error('No se encontró la auditoría seleccionada.');
      return;
    }

    try {
      setGeneratingPdf(true);

      const report = buildExecutiveAuditReport(
        audit,
        findings
      );

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 16;
      const contentWidth = pageWidth - margin * 2;
      const bottomLimit = pageHeight - 18;

      let y = 20;

      function newPage() {
        pdf.addPage();
        y = 20;
      }

      function ensureSpace(height: number) {
        if (y + height > bottomLimit) {
          newPage();
        }
      }

      function addWrappedText(
        text: string,
        x: number,
        width: number,
        lineHeight = 5
      ) {
        const lines = pdf.splitTextToSize(
          text || 'No especificado',
          width
        );

        ensureSpace(lines.length * lineHeight + 3);

        pdf.text(lines, x, y);

        y += lines.length * lineHeight + 3;
      }

      // =====================================================
      // PORTADA
      // =====================================================

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text(
        'SUAREZ AI AUDIT',
        margin,
        y
      );

      y += 12;

      pdf.setFontSize(24);
      pdf.text(
        'Informe Ejecutivo',
        margin,
        y
      );

      y += 9;

      pdf.setFontSize(18);
      pdf.text(
        'de Auditoría',
        margin,
        y
      );

      y += 14;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);

      pdf.text(
        `Código: ${audit.auditCode}`,
        margin,
        y
      );

      y += 7;

      pdf.text(
        `Organización: ${audit.organization}`,
        margin,
        y
      );

      y += 7;

      pdf.text(
        `Auditoría: ${audit.name}`,
        margin,
        y
      );

      y += 7;

      pdf.text(
        `Tipo: ${audit.type}`,
        margin,
        y
      );

      y += 7;

      pdf.text(
        `Riesgo: ${formatRiskLevel(audit.riskLevel)}`,
        margin,
        y
      );

      y += 7;

      pdf.text(
        `Estado: ${formatAuditStatus(audit.status)}`,
        margin,
        y
      );

      y += 7;

      pdf.text(
        `Progreso: ${audit.progress}%`,
        margin,
        y
      );

      y += 7;

      pdf.text(
        `Fecha de emisión: ${new Date().toLocaleDateString('es-DO')}`,
        margin,
        y
      );

      // =====================================================
      // RESUMEN EJECUTIVO
      // =====================================================

      newPage();

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.text(
        'Resumen Ejecutivo',
        margin,
        y
      );

      y += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);

      const executiveText =
        `La auditoría ${audit.auditCode} presenta ` +
        `${report.summary.total} hallazgo(s), incluyendo ` +
        `${report.summary.critical} crítico(s), ` +
        `${report.summary.high} alto(s), ` +
        `${report.summary.medium} medio(s) y ` +
        `${report.summary.low} bajo(s). ` +
        `El score promedio de los hallazgos es ` +
        `${report.summary.averageScore}.`;

      addWrappedText(
        executiveText,
        margin,
        contentWidth,
        5
      );

      y += 4;

      pdf.setFont('helvetica', 'bold');
      pdf.text('Indicadores', margin, y);
      y += 7;

      pdf.setFont('helvetica', 'normal');

      const metrics = [
        `Total de hallazgos: ${report.summary.total}`,
        `Críticos: ${report.summary.critical}`,
        `Altos: ${report.summary.high}`,
        `Medios: ${report.summary.medium}`,
        `Bajos: ${report.summary.low}`,
        `Abiertos: ${report.summary.open}`,
        `Investigando: ${report.summary.investigating}`,
        `Resueltos: ${report.summary.resolved}`,
        `Aceptados: ${report.summary.accepted}`,
        `Score promedio: ${report.summary.averageScore}`,
      ];

      for (const metric of metrics) {
        ensureSpace(6);
        pdf.text(`• ${metric}`, margin + 2, y);
        y += 6;
      }

      // =====================================================
      // ALCANCE
      // =====================================================

      y += 4;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('Alcance', margin, y);

      y += 8;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);

      addWrappedText(
        audit.scope || 'No se ha definido el alcance.',
        margin,
        contentWidth
      );

      // =====================================================
      // OBJETIVOS
      // =====================================================

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('Objetivos', margin, y);

      y += 8;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);

      addWrappedText(
        audit.objectives ||
          'No se han definido objetivos.',
        margin,
        contentWidth
      );

      // =====================================================
      // METODOLOGÍA
      // =====================================================

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('Metodología', margin, y);

      y += 8;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);

      addWrappedText(
        audit.methodology ||
          'No se ha definido metodología.',
        margin,
        contentWidth
      );

      // =====================================================
      // HALLAZGOS
      // =====================================================

      newPage();

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.text(
        'Hallazgos de Auditoría',
        margin,
        y
      );

      y += 12;

      if (report.findings.length === 0) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);

        pdf.text(
          'No se registraron hallazgos para esta auditoría.',
          margin,
          y
        );
      }

      for (const finding of report.findings) {
        ensureSpace(40);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);

        pdf.text(
          `${finding.findingCode} · ${finding.title}`,
          margin,
          y
        );

        y += 7;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);

        pdf.text(
          `Riesgo: ${formatRiskLevel(finding.riskLevel)} | ` +
          `Score: ${finding.score} | ` +
          `Categoría: ${finding.category}`,
          margin,
          y
        );

        y += 6;

        pdf.text(
          `Estado: ${
            {
              open: 'Abierto',
              investigating: 'Investigando',
              resolved: 'Resuelto',
              accepted: 'Aceptado',
            }[finding.status]
          }`,
          margin,
          y
        );

        y += 7;

        pdf.setFont('helvetica', 'bold');
        pdf.text('Descripción', margin, y);

        y += 5;

        pdf.setFont('helvetica', 'normal');

        addWrappedText(
          finding.description || 'Sin descripción.',
          margin,
          contentWidth,
          4.5
        );

        if (finding.recommendation) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Recomendación', margin, y);

          y += 5;

          pdf.setFont('helvetica', 'normal');

          addWrappedText(
            finding.recommendation,
            margin,
            contentWidth,
            4.5
          );
        }

        y += 5;

        ensureSpace(3);

        pdf.line(
          margin,
          y,
          pageWidth - margin,
          y
        );

        y += 8;
      }

      // =====================================================
      // PIE DE PÁGINA
      // =====================================================

      const totalPages = pdf.getNumberOfPages();

      for (
        let page = 1;
        page <= totalPages;
        page += 1
      ) {
        pdf.setPage(page);

        pdf.setFont(
          'helvetica',
          'normal'
        );

        pdf.setFontSize(8);

        pdf.text(
          `${audit.auditCode} · Suarez AI Audit`,
          margin,
          pageHeight - 8
        );

        pdf.text(
          `Página ${page} de ${totalPages}`,
          pageWidth - margin,
          pageHeight - 8,
          { align: 'right' }
        );
      }

      const safeCode =
        audit.auditCode.replace(
          /[^a-zA-Z0-9-_]/g,
          '-'
        );

      pdf.save(
        `${safeCode}-informe-ejecutivo.pdf`
      );

    } catch (err) {
      console.error(
        'Error generando PDF:',
        err
      );

      alert(
        err instanceof Error
          ? `No se pudo generar el PDF: ${err.message}`
          : 'No se pudo generar el PDF.'
      );
    } finally {
      setGeneratingPdf(false);
    }
  }

  async function loadAdminUsers() {
    if (role !== 'admin') return;

    try {
      setLoadingUsers(true);
      setUsersError(null);

      const users = await getAdminUsers();

      setAdminUsers(users);
      setShowUsersCenter(true);
    } catch (err) {
      console.error('Error cargando usuarios:', err);

      setUsersError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar los usuarios.'
      );

      setShowUsersCenter(true);
    } finally {
      setLoadingUsers(false);
    }
  }

  async function handleChangeUserRole(
    userId: string,
    newRole: AppUserRole
  ) {
    if (role !== 'admin') return;

    try {
      setChangingUserId(userId);
      setUsersError(null);

      await changeUserRole(userId, newRole);

      setAdminUsers((current) =>
        current.map((item) =>
          item.id === userId
            ? { ...item, role: newRole }
            : item
        )
      );
    } catch (err) {
      console.error('Error cambiando rol:', err);

      setUsersError(
        err instanceof Error
          ? err.message
          : 'No se pudo cambiar el rol.'
      );
    } finally {
      setChangingUserId(null);
    }
  }

  async function loadTransactionsCenter() {
    try {
      setLoadingTransactions(true);
      setTransactionError(null);

      const data = await getTransactions();

      setTransactions(data);
      setShowTransactionsCenter(true);
    } catch (err) {
      console.error('Error cargando transacciones:', err);

      setTransactionError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar las transacciones.'
      );

      setShowTransactionsCenter(true);
    } finally {
      setLoadingTransactions(false);
    }
  }

  function openNewTransaction() {
    setSelectedTransaction(null);
    setTransactionError(null);

    setTransactionForm({
      auditId: audits[0]?.id ?? '',
      organizationId: audits[0]?.organizationId ?? '',
      transactionDate: new Date().toISOString().slice(0, 16),
      reference: '',
      description: '',
      accountCode: '',
      counterparty: '',
      amount: 0,
      currency: 'DOP',
      status: 'pending',
      anomalyScore: '',
      isAnomaly: false,
      aiExplanation: '',
    });

    setShowTransactionForm(true);
  }

  async function openTransactionDetail(
    transaction: Transaction
  ) {
    setSelectedTransaction(transaction);
    setTransactionError(null);
    setTransactionReviewsError(null);
    setLoadingTransactionReviews(true);

    try {
      const reviews = await getTransactionReviews(
        transaction.id
      );

      setTransactionReviews(reviews);
    } catch (err) {
      console.error(
        'Error cargando historial de transacción:',
        err
      );

      setTransactionReviews([]);

      setTransactionReviewsError(
        err instanceof Error
          ? err.message
          : 'No se pudo cargar el historial.'
      );
    } finally {
      setLoadingTransactionReviews(false);
    }

    setTransactionForm({
      auditId: transaction.auditId ?? '',
      organizationId: transaction.organizationId ?? '',
      transactionDate:
        transaction.transactionDate.slice(0, 16),
      reference: transaction.reference,
      description: transaction.description,
      accountCode: transaction.accountCode,
      counterparty: transaction.counterparty,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      anomalyScore:
        transaction.anomalyScore === null
          ? ''
          : String(transaction.anomalyScore),
      isAnomaly: transaction.isAnomaly,
      aiExplanation: transaction.aiExplanation,
    });

    setShowTransactionForm(true);
  }

  async function handleSaveTransaction(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!transactionForm.description.trim()) {
      setTransactionError(
        'La descripción es obligatoria.'
      );
      return;
    }

    if (
      !Number.isFinite(Number(transactionForm.amount))
    ) {
      setTransactionError(
        'El importe debe ser numérico.'
      );
      return;
    }

    try {
      setSavingTransaction(true);
      setTransactionError(null);

      if (selectedTransaction) {
        await updateTransaction({
          id: selectedTransaction.id,
          auditId:
            transactionForm.auditId || null,
          organizationId:
            transactionForm.organizationId || null,
          transactionDate:
            new Date(
              transactionForm.transactionDate
            ).toISOString(),
          reference: transactionForm.reference,
          description: transactionForm.description,
          accountCode: transactionForm.accountCode,
          counterparty: transactionForm.counterparty,
          amount: Number(transactionForm.amount),
          currency: transactionForm.currency,
          status: transactionForm.status,
          anomalyScore:
            transactionForm.anomalyScore === ''
              ? null
              : Number(transactionForm.anomalyScore),
          isAnomaly: transactionForm.isAnomaly,
          aiExplanation:
            transactionForm.aiExplanation,
        });
      } else {
        await createTransaction({
          auditId:
            transactionForm.auditId || null,
          organizationId:
            transactionForm.organizationId || null,
          transactionDate:
            new Date(
              transactionForm.transactionDate
            ).toISOString(),
          reference: transactionForm.reference,
          description: transactionForm.description,
          accountCode: transactionForm.accountCode,
          counterparty: transactionForm.counterparty,
          amount: Number(transactionForm.amount),
          currency: transactionForm.currency,
          status: transactionForm.status,
        });
      }

      const data = await getTransactions();
      setTransactions(data);

      setShowTransactionForm(false);
      setSelectedTransaction(null);
    } catch (err) {
      console.error('Error guardando transacción:', err);

      setTransactionError(
        err instanceof Error
          ? err.message
          : 'No se pudo guardar la transacción.'
      );
    } finally {
      setSavingTransaction(false);
    }
  }

  async function handleReviewTransaction(
    transaction: Transaction
  ) {
    if (!user) return;

    try {
      setTransactionError(null);

      await markTransactionReviewed(
        transaction.id,
        user.id
      );

      const data = await getTransactions();
      setTransactions(data);
    } catch (err) {
      setTransactionError(
        err instanceof Error
          ? err.message
          : 'No se pudo revisar la transacción.'
      );
    }
  }

  function openDecisionModal(
    transaction: Transaction,
    decision: 'approved' | 'rejected'
  ) {
    setDecisionTransaction(transaction);
    setDecisionType(decision);
    setDecisionComment('');
    setDecisionError(null);
  }

  async function handleFinalDecision() {
    if (
      !decisionTransaction ||
      !decisionType ||
      !user
    ) {
      return;
    }

    if (
      decisionType === 'rejected' &&
      !decisionComment.trim()
    ) {
      setDecisionError(
        'Debes indicar el motivo del rechazo.'
      );
      return;
    }

    try {
      setSavingDecision(true);
      setDecisionError(null);
      setTransactionError(null);

      if (decisionType === 'approved') {
        await approveTransaction(
          decisionTransaction.id,
          user.id,
          decisionComment
        );
      } else {
        await rejectTransaction(
          decisionTransaction.id,
          user.id,
          decisionComment
        );
      }

      const data = await getTransactions();

      setTransactions(data);

      setDecisionTransaction(null);
      setDecisionType(null);
      setDecisionComment('');

      setShowTransactionAlerts(true);
    } catch (err) {
      console.error(
        'FINAL DECISION ERROR:',
        err
      );

      setDecisionError(
        err instanceof Error
          ? err.message
          : 'No se pudo guardar la decisión.'
      );
    } finally {
      setSavingDecision(false);
    }
  }





  async function handleDeleteTransaction(
    transaction: Transaction
  ) {
    if (role !== 'admin') return;

    if (
      !window.confirm(
        `¿Eliminar ${transaction.transactionCode}?`
      )
    ) {
      return;
    }

    try {
      await deleteTransaction(transaction.id);

      setTransactions((current) =>
        current.filter(
          (item) => item.id !== transaction.id
        )
      );
    } catch (err) {
      setTransactionError(
        err instanceof Error
          ? err.message
          : 'No se pudo eliminar la transacción.'
      );
    }
  }

  const filteredTransactions = transactions.filter(
    (transaction) => {
      const matchesStatus =
        transactionStatusFilter === 'all' ||
        transaction.status === transactionStatusFilter;

      const matchesAnomaly =
        transactionAnomalyFilter === 'all' ||
        (transactionAnomalyFilter === 'anomaly'
          ? transaction.isAnomaly
          : !transaction.isAnomaly);

      return matchesStatus && matchesAnomaly;
    }
  );

  const transactionTotal =
    getTransactionTotal(filteredTransactions);

  const flaggedTransactions =
    getFlaggedTransactions(transactions);

  const pendingTransactionAlerts =
    getPendingAlerts(transactions);

  const totalTransactions = transactions.length;

  const anomalyTransactions = transactions.filter(
    (transaction) => transaction.isAnomaly
  );

  const totalTransactionAmount = transactions.reduce(
    (total, transaction) =>
      total + transaction.amount,
    0
  );

  const anomalyExposureAmount = anomalyTransactions.reduce(
    (total, transaction) =>
      total + transaction.amount,
    0
  );

  const anomalyRate =
    totalTransactions > 0
      ? Number(
          (
            (anomalyTransactions.length /
              totalTransactions) *
            100
          ).toFixed(1)
        )
      : 0;

  const topAnomalyTransactions = [...transactions]
    .filter(
      (transaction) =>
        transaction.anomalyScore !== null
    )
    .sort(
      (a, b) =>
        (b.anomalyScore ?? 0) -
        (a.anomalyScore ?? 0)
    )
    .slice(0, 5);

  const transactionTrendData = [...transactions]
    .sort(
      (a, b) =>
        new Date(a.transactionDate).getTime() -
        new Date(b.transactionDate).getTime()
    )
    .map((transaction) => ({
      code: transaction.transactionCode,
      date: new Date(
        transaction.transactionDate
      ).toLocaleDateString('es-DO', {
        day: '2-digit',
        month: '2-digit',
      }),
      amount: transaction.amount,
      anomalyScore: transaction.anomalyScore ?? 0,
      isAnomaly: transaction.isAnomaly,
    }));

  const transactionStatusData = [
    'pending',
    'approved',
    'rejected',
    'flagged',
    'reviewed',
  ].map((status) => ({
    status,
    label:
      {
        pending: 'Pendientes',
        approved: 'Aprobadas',
        rejected: 'Rechazadas',
        flagged: 'Marcadas',
        reviewed: 'Revisadas',
      }[status] ?? status,
    count: transactions.filter(
      (transaction) =>
        transaction.status === status
    ).length,
  }));

  const anomalyDistributionData = [
    {
      name: 'Normal',
      value: transactions.filter(
        (transaction) => !transaction.isAnomaly
      ).length,
    },
    {
      name: 'Anómala',
      value: transactions.filter(
        (transaction) => transaction.isAnomaly
      ).length,
    },
  ];

  const anomalyScoreChartData = [...transactions]
    .sort(
      (a, b) =>
        (b.anomalyScore ?? 0) -
        (a.anomalyScore ?? 0)
    )
    .slice(0, 10)
    .map((transaction) => ({
      code: transaction.transactionCode,
      score: transaction.anomalyScore ?? 0,
      amount: transaction.amount,
    }));

  const maxTransactionAmount = Math.max(
    ...transactionTrendData.map(
      (item) => item.amount
    ),
    1
  );

  const maxTransactionStatusCount = Math.max(
    ...transactionStatusData.map(
      (item) => item.count
    ),
    1
  );

  const anomalyTotal =
    anomalyDistributionData.reduce(
      (total, item) => total + item.value,
      0
    ) || 1;



  const totalFindings = findings.length;

  const criticalFindings = findings.filter(
    (finding) => finding.riskLevel === 'critical'
  ).length;

  const completedAudits = audits.filter(
    (audit) => audit.status === 'completed'
  ).length;

  const activeAudits = audits.filter(
    (audit) => audit.status === 'in_progress'
  ).length;

  const averageProgress =
    audits.length > 0
      ? Math.round(
          audits.reduce(
            (total, audit) => total + audit.progress,
            0
          ) / audits.length
        )
      : 0;


  const riskCounts = {
    critical: findings.filter(
      (finding) => finding.riskLevel === 'critical'
    ).length,

    high: findings.filter(
      (finding) => finding.riskLevel === 'high'
    ).length,

    medium: findings.filter(
      (finding) => finding.riskLevel === 'medium'
    ).length,

    low: findings.filter(
      (finding) => finding.riskLevel === 'low'
    ).length,
  };

  function closeNavigationCenters() {
    setShowAuditsCenter(false);
    setShowFindingsCenter(false);
    setShowRisksCenter(false);
    setShowTransactionsCenter(false);
    setShowOrganizationsCenter(false);
    setShowReportsCenter(false);
    setShowUsersCenter(false);
  }

  function handleNavigation(label: string) {
    closeNavigationCenters();
    setSidebarOpen(false);
    setActiveSection(label);

    switch (label) {
      case 'Dashboard':
        return;

      case 'Auditorías':
        setShowAuditsCenter(true);
        return;

      case 'Hallazgos':
        setShowFindingsCenter(true);
        return;

      case 'Riesgos':
        setShowRisksCenter(true);
        return;

      case 'Transacciones':
        void loadTransactionsCenter();
        return;

      case 'Organizaciones':
        if (canWrite) {
          void loadOrganizationsCenter();
        }
        return;

      case 'Reportes':
        setReportAuditId(
          reportAuditId || audits[0]?.id || ''
        );
        setShowReportsCenter(true);
        return;

      case 'Usuarios':
        if (role === 'admin') {
          void loadAdminUsers();
        }
        return;

      default:
        setActiveSection('Dashboard');
    }
  }

  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: true,
    },
    {
      label: 'Auditorías',
      icon: ClipboardCheck,
    },
    {
      label: 'Organizaciones',
      icon: Target,
    },
    {
      label: 'Hallazgos',
      icon: FileSearch,
    },
    {
      label: 'Riesgos',
      icon: ShieldAlert,
    },
    {
      label: 'Transacciones',
      icon: BarChart3,
    },
    {
      label: 'Reportes',
      icon: Target,
    },
    {
      label: 'Usuarios',
      icon: LockKeyhole,
      adminOnly: true,
    },

  ];

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07111f] text-slate-300">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#c9a227] border-t-transparent" />
          <p className="mt-4 text-sm">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07111f] text-slate-300">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#c9a227] border-t-transparent" />
          <p className="mt-4 text-sm">
            Cargando datos de auditoría...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07111f] px-6 text-slate-100">
        <div className="max-w-lg rounded-2xl border border-red-400/20 bg-red-400/5 p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />

            <h2 className="font-bold text-white">
              Error al cargar la auditoría
            </h2>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-[#c9a227] px-4 py-2 text-sm font-bold text-[#07111f]"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07111f] text-slate-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          aria-label="Cerrar menú"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10',
          'bg-[#091522] transition-transform duration-300',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a5f] shadow-lg shadow-blue-950/30">
                <ShieldCheck className="h-5 w-5 text-[#c9a227]" />
              </div>

              <div>
                <div className="font-black tracking-wide text-white">
                  SUAREZ
                </div>
                <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-500">
                  AI Audit
                </div>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            <div className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
              Plataforma
            </div>

            {navItems
              .filter(
                (item) =>
                  !('adminOnly' in item) ||
                  !item.adminOnly ||
                  role === 'admin'
              )
              .map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.label;

              return (
                <button
                  key={item.label}
                  onClick={() => handleNavigation(item.label)}
                  className={[
                    'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all',
                    item.active
                      ? 'bg-[#1e3a5f]/70 text-white shadow-inner'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white',
                  ].join(' ')}
                >
                  <Icon
                    className={[
                      'h-[18px] w-[18px]',
                      isActive ? 'text-[#c9a227]' : '',
                    ].join(' ')}
                  />

                  <span>{item.label}</span>

                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#c9a227]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Security status */}
          <div className="border-t border-white/10 p-5">
            <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

                <span className="text-xs font-bold text-emerald-300">
                  Sistema operativo
                </span>
              </div>

              <p className="mt-2 text-[11px] leading-5 text-slate-500">
                Motor de auditoría y análisis funcionando correctamente.
              </p>
            </div>

            <div className="mt-5 text-center text-[9px] uppercase tracking-[0.18em] text-slate-600">
              Suarez AI Audit v1.0
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-white/10 bg-[#07111f]/90 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9a227]">
                Executive Control Center
              </div>

              <h1 className="mt-1 text-lg font-bold text-white sm:text-xl">
                Auditoría Inteligente
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowTransactionAlerts(true)}
              className="relative rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              aria-label="Alertas transaccionales"
            >
              <Bell className="h-5 w-5" />

              {pendingTransactionAlerts.length > 0 && (
                <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[9px] font-black text-white">
                  {pendingTransactionAlerts.length}
                </span>
              )}
            </button>

            <div className="hidden text-right sm:block">
              <div className="text-xs font-bold text-white">
                {user?.email}
              </div>

              <div className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-[#c9a227]">
                {{
                  admin: 'Administrador',
                  auditor: 'Auditor',
                  viewer: 'Consulta',
                }[role ?? 'viewer']}
              </div>
            </div>

            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-white"
            >
              Salir
            </button>
          </div>
        </header>

        <main className="p-5 sm:p-8">
          {/* Welcome */}
          <section className="mb-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-sm text-slate-500">
                  Domingo, 16 de agosto de 2026
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Panel ejecutivo
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Visión consolidada del estado de auditorías, riesgos y
                  hallazgos detectados por la plataforma.
                </p>
              </div>

              <button
                onClick={() => {
                setAuditFormError(null);
                setShowNewAudit(true);
              }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#c9a227] px-5 py-3 text-sm font-bold text-[#07111f] shadow-lg shadow-yellow-950/20 transition hover:bg-[#d8b43c]"
              >
                <ClipboardCheck className="h-4 w-4" />
                Nueva auditoría
              </button>
            </div>
          </section>

          {/* KPI cards */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Auditorías activas"
              value={String(activeAudits)}
              description={`${completedAudits} completada`}
              icon={ClipboardCheck}
              trend="+12%"
              positive
            />

            <KpiCard
              title="Hallazgos"
              value={String(totalFindings)}
              description="Detectados actualmente"
              icon={FileSearch}
              trend="+8%"
            />

            <KpiCard
              title="Riesgos críticos"
              value={String(criticalFindings)}
              description="Requieren atención"
              icon={AlertTriangle}
              trend="Prioridad"
              danger
            />

            <KpiCard
              title="Progreso global"
              value={`${averageProgress}%`}
              description="Avance de auditorías"
              icon={TrendingUp}
              trend="+5.4%"
              positive
            />
          </section>

          <OperationsSuite
            audits={audits}
            findings={findings}
            transactions={transactions}
            organizations={organizations}
            role={role}
          />

          <GovernanceSuite
            audits={audits}
            findings={findings}
            canWrite={canWrite}
          />

          <EnterpriseRiskSuite
            audits={audits}
            organizations={allOrganizations}
            transactions={transactions}
            canWrite={canWrite}
          />

          <ConsolidationCenter
            canWrite={canWrite}
            canDelete={role === 'admin'}
          />

          {/* Transaction intelligence */}
          <section className="mt-6">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
                  Transaction Intelligence
                </div>

                <h3 className="mt-1 text-lg font-black text-white">
                  Inteligencia transaccional
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Indicadores derivados del motor automático de detección de anomalías.
                </p>

                <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  {transactions.length} transacciones cargadas
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  void loadTransactionsCenter()
                }
                className="text-xs font-bold text-[#c9a227] hover:text-[#e1c45a]"
              >
                Ver transacciones
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <ReportMetric
                label="Analizadas"
                value={String(totalTransactions)}
              />

              <ReportMetric
                label="Anomalías"
                value={String(anomalyTransactions.length)}
              />

              <ReportMetric
                label="Tasa de anomalías"
                value={`${anomalyRate}%`}
              />

              <ReportMetric
                label="Importe analizado"
                value={totalTransactionAmount.toLocaleString(
                  'es-DO',
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              />

              <ReportMetric
                label="Importe expuesto"
                value={anomalyExposureAmount.toLocaleString(
                  'es-DO',
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              />
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b1928]">
              <div className="flex items-center justify-between border-b border-white/10 p-6">
                <div>
                  <h3 className="font-bold text-white">
                    Transacciones con mayor score
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Priorizadas según el análisis automático
                  </p>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Top 5
                </span>
              </div>

              {topAnomalyTransactions.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  Todavía no existen transacciones analizadas.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {topAnomalyTransactions.map(
                    (transaction) => (
                      <button
                        key={transaction.id}
                        type="button"
                        onClick={() => {
                          setShowTransactionsCenter(true);

                          if (canWrite) {
                            openTransactionDetail(
                              transaction
                            );
                          }
                        }}
                        className="grid w-full gap-4 p-5 text-left transition hover:bg-white/[0.025] md:grid-cols-[1fr_auto]"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-[#c9a227]">
                              {transaction.transactionCode}
                            </span>

                            {transaction.isAnomaly ? (
                              <span className="rounded-full bg-red-400/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-red-300">
                                Anomalía
                              </span>
                            ) : (
                              <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                                Normal
                              </span>
                            )}
                          </div>

                          <h4 className="mt-2 font-bold text-white">
                            {transaction.description}
                          </h4>

                          <p className="mt-1 text-xs text-slate-500">
                            {transaction.counterparty ||
                              'Sin contraparte'}
                          </p>

                          {transaction.aiExplanation && (
                            <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-600">
                              {transaction.aiExplanation}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                              Importe
                            </div>

                            <div className="mt-1 font-black text-white">
                              {transaction.amount.toLocaleString(
                                'es-DO',
                                {
                                  minimumFractionDigits: 2,
                                }
                              )}
                            </div>

                            <div className="text-[9px] text-slate-600">
                              {transaction.currency}
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                              Score
                            </div>

                            <div
                              className={[
                                'mt-1 text-xl font-black',
                                (transaction.anomalyScore ?? 0) >= 50
                                  ? 'text-red-400'
                                  : (transaction.anomalyScore ?? 0) >= 25
                                    ? 'text-[#c9a227]'
                                    : 'text-emerald-400',
                              ].join(' ')}
                            >
                              {transaction.anomalyScore ?? 0}
                            </div>
                          </div>

                          <ChevronRight className="h-4 w-4 text-slate-700" />
                        </div>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Transaction analytics charts */}
          <div className="mt-8 rounded-xl border border-[#c9a227]/40 bg-[#c9a227]/5 p-4">
            <div className="font-bold text-[#c9a227]">
              Analítica transaccional
            </div>

            <div className="mt-1 text-xs text-slate-400">
              {transactions.length} transacciones procesadas · visualización ligera activa
            </div>
          </div>

          <section className="mt-6 grid gap-6 xl:grid-cols-2">

            {/* Volumen */}
            <div className="rounded-2xl border border-white/10 bg-[#0b1928] p-6">
              <div>
                <h3 className="font-black text-white">
                  Tendencia de volumen
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Importe procesado por transacción
                </p>
              </div>

              <div className="mt-8 flex h-56 items-end gap-3 overflow-x-auto border-b border-white/10 pb-2">
                {transactionTrendData.map((item) => {
                  const height =
                    Math.max(
                      (item.amount / maxTransactionAmount) * 100,
                      4
                    );

                  return (
                    <div
                      key={item.code}
                      className="group flex min-w-[44px] flex-1 flex-col items-center justify-end"
                    >
                      <div className="mb-2 hidden whitespace-nowrap rounded-lg border border-white/10 bg-[#07111f] px-2 py-1 text-[9px] text-slate-300 group-hover:block">
                        {item.amount.toLocaleString(
                          'es-DO',
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </div>

                      <div
                        className={[
                          'w-full max-w-[42px] rounded-t-lg transition-all',
                          item.isAnomaly
                            ? 'bg-red-500/80'
                            : 'bg-[#c9a227]/80',
                        ].join(' ')}
                        style={{
                          height: `${height}%`,
                        }}
                      />

                      <div className="mt-2 text-[8px] text-slate-600">
                        {item.date}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Normal vs anomalía */}
            <div className="rounded-2xl border border-white/10 bg-[#0b1928] p-6">
              <div>
                <h3 className="font-black text-white">
                  Normal vs anomalía
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Clasificación automática del universo analizado
                </p>
              </div>

              <div className="mt-10 space-y-8">
                {anomalyDistributionData.map((item) => {
                  const percentage =
                    (item.value / anomalyTotal) * 100;

                  return (
                    <div key={item.name}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-300">
                          {item.name}
                        </span>

                        <div className="text-right">
                          <span className="font-black text-white">
                            {item.value}
                          </span>

                          <span className="ml-2 text-xs text-slate-500">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <div className="h-4 overflow-hidden rounded-full bg-white/5">
                        <div
                          className={[
                            'h-full rounded-full transition-all',
                            item.name === 'Anómala'
                              ? 'bg-red-500'
                              : 'bg-emerald-500',
                          ].join(' ')}
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/5 p-4 text-center">
                    <div className="text-2xl font-black text-emerald-300">
                      {
                        anomalyDistributionData.find(
                          (item) => item.name === 'Normal'
                        )?.value ?? 0
                      }
                    </div>

                    <div className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      Normales
                    </div>
                  </div>

                  <div className="rounded-xl border border-red-400/10 bg-red-400/5 p-4 text-center">
                    <div className="text-2xl font-black text-red-300">
                      {
                        anomalyDistributionData.find(
                          (item) => item.name === 'Anómala'
                        )?.value ?? 0
                      }
                    </div>

                    <div className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      Anómalas
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estados */}
            <div className="rounded-2xl border border-white/10 bg-[#0b1928] p-6">
              <div>
                <h3 className="font-black text-white">
                  Transacciones por estado
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Distribución operacional actual
                </p>
              </div>

              <div className="mt-7 space-y-5">
                {transactionStatusData.map((item) => {
                  const percentage =
                    (item.count /
                      maxTransactionStatusCount) *
                    100;

                  return (
                    <div key={item.status}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">
                          {item.label}
                        </span>

                        <span className="text-sm font-black text-white">
                          {item.count}
                        </span>
                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-[#c9a227]"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Anomaly score */}
            <div className="rounded-2xl border border-white/10 bg-[#0b1928] p-6">
              <div>
                <h3 className="font-black text-white">
                  Ranking de anomaly score
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Operaciones priorizadas por puntuación
                </p>
              </div>

              <div className="mt-7 space-y-4">
                {anomalyScoreChartData.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      const transaction =
                        transactions.find(
                          (current) =>
                            current.transactionCode ===
                            item.code
                        );

                      if (
                        transaction &&
                        canWrite
                      ) {
                        openTransactionDetail(
                          transaction
                        );
                      }
                    }}
                    className="block w-full text-left"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-400">
                        {item.code}
                      </span>

                      <span
                        className={[
                          'text-sm font-black',
                          item.score >= 50
                            ? 'text-red-400'
                            : item.score >= 25
                              ? 'text-[#c9a227]'
                              : 'text-emerald-400',
                        ].join(' ')}
                      >
                        {item.score}
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-white/5">
                      <div
                        className={[
                          'h-full rounded-full transition-all',
                          item.score >= 50
                            ? 'bg-red-500'
                            : item.score >= 25
                              ? 'bg-[#c9a227]'
                              : 'bg-emerald-500',
                        ].join(' ')}
                        style={{
                          width: `${Math.max(
                            item.score,
                            2
                          )}%`,
                        }}
                      />
                    </div>
                  </button>
                ))}

                {anomalyScoreChartData.length === 0 && (
                  <div className="py-10 text-center text-sm text-slate-500">
                    No existen puntuaciones disponibles.
                  </div>
                )}
              </div>
            </div>

          </section>

          {/* Main grid */}
          <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            {/* Audits */}
            <div className="rounded-2xl border border-white/10 bg-[#0b1928]">
              <div className="flex items-center justify-between border-b border-white/10 p-6">
                <div>
                  <h3 className="font-bold text-white">
                    Auditorías recientes
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Actividad de los últimos procesos
                  </p>
                </div>

                <button className="text-xs font-bold text-[#c9a227] hover:text-[#e1c45a]">
                  Ver todas
                </button>
              </div>

              <div className="divide-y divide-white/5">
                {audits.map((audit) => (
                  <button
                    type="button"
                    key={audit.auditCode}
                    onClick={() => {
                      if (canWrite) {
                        openAuditDetail(audit);
                      }
                    }}
                    className="group block w-full p-5 text-left transition hover:bg-white/[0.025]"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-600">
                            {audit.id}
                          </span>

                          <RiskBadge level={audit.riskLevel} />
                        </div>

                        <h4 className="mt-2 truncate font-bold text-white">
                          {audit.name}
                        </h4>

                        <p className="mt-1 text-xs text-slate-500">
                          {audit.organization} · {audit.type}
                        </p>
                      </div>

                      <div className="flex items-center gap-5">
                        <div className="min-w-[130px]">
                          <div className="mb-2 flex justify-between text-[10px] font-bold uppercase tracking-wider">
                            <span className="text-slate-600">Progreso</span>
                            <span className="text-slate-300">
                              {audit.progress}%
                            </span>
                          </div>

                          <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                            <div
                              className="h-full rounded-full bg-[#c9a227] transition-all"
                              style={{ width: `${audit.progress}%` }}
                            />
                          </div>
                        </div>

                        <ChevronRight className="hidden h-4 w-4 text-slate-700 transition group-hover:text-[#c9a227] sm:block" />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-4 text-[10px] font-medium text-slate-500">
                      <span>
                        Estado:{' '}
                        <strong className="text-slate-300">
                          {formatAuditStatus(audit.status)}
                        </strong>
                      </span>

                      <span>
                        Hallazgos:{' '}
                        <strong className="text-slate-300">
                          {audit.findings}
                        </strong>
                      </span>

                      <span>
                        Críticos:{' '}
                        <strong className="text-red-400">
                          {audit.criticalFindings}
                        </strong>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Risk distribution */}
            <div className="rounded-2xl border border-white/10 bg-[#0b1928]">
              <div className="border-b border-white/10 p-6">
                <h3 className="font-bold text-white">
                  Distribución de riesgo
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Clasificación actual de hallazgos
                </p>
              </div>

              <div className="space-y-5 p-6">
                <RiskBar
                  label="Crítico"
                  count={riskCounts.critical}
                  total={totalFindings}
                  color="bg-red-500"
                />

                <RiskBar
                  label="Alto"
                  count={riskCounts.high}
                  total={totalFindings}
                  color="bg-orange-500"
                />

                <RiskBar
                  label="Medio"
                  count={riskCounts.medium}
                  total={totalFindings}
                  color="bg-[#c9a227]"
                />

                <RiskBar
                  label="Bajo"
                  count={riskCounts.low}
                  total={totalFindings}
                  color="bg-emerald-500"
                />
              </div>

              <div className="mx-6 mb-6 rounded-xl border border-[#c9a227]/10 bg-[#c9a227]/5 p-4">
                <div className="flex items-start gap-3">
                  <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#c9a227]" />

                  <div>
                    <p className="text-xs font-bold text-white">
                      Análisis inteligente activo
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                      La plataforma prioriza automáticamente los hallazgos
                      según impacto y nivel de exposición.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Findings */}
          <section className="mt-6 rounded-2xl border border-white/10 bg-[#0b1928]">
            <div className="flex flex-col justify-between gap-4 border-b border-white/10 p-6 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-bold text-white">
                  Hallazgos prioritarios
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Elementos que requieren revisión
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {canWrite && (
                <button
                  type="button"
                  onClick={() => {
                    setFindingFormError(null);
                    setFindingForm((current) => ({
                      ...current,
                      auditId: current.auditId || audits[0]?.id || '',
                    }));
                    setShowNewFinding(true);
                  }}
                  className="rounded-xl bg-[#c9a227] px-4 py-2 text-xs font-black text-[#07111f]"
                >
                  Nuevo hallazgo
                </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowFindingsCenter(true)}
                  className="inline-flex items-center gap-2 self-start px-2 py-2 text-xs font-bold text-[#c9a227]"
                >
                  Ver centro de hallazgos
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="divide-y divide-white/5">
              {findings.map((finding) => (
                <button
                  type="button"
                  key={finding.findingCode}
                  onClick={() => {
                    if (canWrite) {
                      openFindingDetail(finding);
                    }
                  }}
                  className="grid w-full gap-4 p-5 text-left transition hover:bg-white/[0.025] md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[9px] text-slate-600">
                        {finding.findingCode}
                      </span>

                      <RiskBadge level={finding.riskLevel} />

                      <span className="rounded-full border border-white/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                        {finding.category}
                      </span>
                    </div>

                    <h4 className="mt-3 font-bold text-white">
                      {finding.title}
                    </h4>

                    <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
                      {finding.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 md:text-right">
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                        Score
                      </div>

                      <div className="mt-1 text-xl font-black text-white">
                        {finding.score}
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                        Estado
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-xs font-bold text-slate-300">
                        {finding.status === 'open' ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#c9a227]" />
                        )}

                        {{
                          open: 'Abierto',
                          investigating: 'Investigando',
                          resolved: 'Resuelto',
                          accepted: 'Aceptado',
                        }[finding.status]}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-8 flex flex-col gap-2 border-t border-white/5 pt-6 text-[10px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>
              SUAREZ AI AUDIT · Plataforma inteligente de auditoría y riesgo
            </span>

            <span>© 2026 Suarez Consulting</span>
          </footer>
        </main>
      {selectedAudit && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1928] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
                  {selectedAudit.auditCode}
                </div>

                <h2 className="mt-1 text-xl font-black text-white">
                  Detalle de auditoría
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {selectedAudit.organization}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAudit(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAudit} className="space-y-5 p-6">
              {editAuditError && (
                <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
                  {editAuditError}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-300">
                    Organización
                  </label>

                  <select
                    value={editForm.organizationId}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        organizationId: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                  >
                    {organizations.map((organization) => (
                      <option key={organization.id} value={organization.id}>
                        {organization.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">
                    Nombre
                  </label>

                  <input
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        name: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">
                    Tipo
                  </label>
                  <input
                    value={editForm.type}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        type: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">
                    Estado
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        status: e.target.value as
                          | 'draft'
                          | 'in_progress'
                          | 'completed',
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                  >
                    <option value="draft">Borrador</option>
                    <option value="in_progress">En progreso</option>
                    <option value="completed">Completada</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">
                    Riesgo
                  </label>
                  <select
                    value={editForm.riskLevel}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        riskLevel: e.target.value as
                          | 'low'
                          | 'medium'
                          | 'high'
                          | 'critical',
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                  >
                    <option value="low">Bajo</option>
                    <option value="medium">Medio</option>
                    <option value="high">Alto</option>
                    <option value="critical">Crítico</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-300">
                    Progreso: {editForm.progress}%
                  </label>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editForm.progress}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        progress: Number(e.target.value),
                      })
                    }
                    className="mt-3 w-full"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">
                    Score
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={editForm.score}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        score: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">
                  Alcance
                </label>

                <textarea
                  rows={3}
                  value={editForm.scope}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      scope: e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">
                  Objetivos
                </label>

                <textarea
                  rows={3}
                  value={editForm.objectives}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      objectives: e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">
                  Metodología
                </label>

                <textarea
                  rows={3}
                  value={editForm.methodology}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      methodology: e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedAudit(null)}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-slate-300 hover:bg-white/5"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={savingAudit}
                  className="rounded-xl bg-[#c9a227] px-5 py-3 text-sm font-black text-[#07111f] disabled:opacity-50"
                >
                  {savingAudit ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAuditsCenter && (
        <div className="fixed inset-0 z-[165] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1928] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0b1928] p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
                  Gestión de auditorías
                </p>
                <h2 className="mt-1 text-2xl font-black text-white">
                  Centro de auditorías
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {audits.length} auditoría{audits.length === 1 ? '' : 's'} registrada{audits.length === 1 ? '' : 's'}
                </p>
              </div>

              <div className="flex gap-3">
                {canWrite && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowAuditsCenter(false);
                      setAuditFormError(null);
                      setShowNewAudit(true);
                    }}
                    className="rounded-xl bg-[#c9a227] px-4 py-2 text-xs font-black text-[#07111f]"
                  >
                    Nueva auditoría
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowAuditsCenter(false);
                    setActiveSection('Dashboard');
                  }}
                  className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid gap-4 p-6">
              {audits.map((audit) => (
                <button
                  key={audit.id}
                  type="button"
                  onClick={() => {
                    setShowAuditsCenter(false);
                    if (canWrite) {
                      openAuditDetail(audit);
                    }
                  }}
                  className="grid w-full gap-5 rounded-2xl border border-white/10 bg-[#07111f] p-5 text-left transition hover:border-[#c9a227]/30 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-[#c9a227]">
                        {audit.auditCode}
                      </span>
                      <RiskBadge level={audit.riskLevel} />
                    </div>

                    <h3 className="mt-3 font-bold text-white">
                      {audit.name}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {audit.organization} · {audit.type}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-4 text-[10px] text-slate-500">
                      <span>
                        Estado:{' '}
                        <strong className="text-slate-300">
                          {formatAuditStatus(audit.status)}
                        </strong>
                      </span>

                      <span>
                        Hallazgos:{' '}
                        <strong className="text-slate-300">
                          {audit.findings}
                        </strong>
                      </span>

                      <span>
                        Críticos:{' '}
                        <strong className="text-red-400">
                          {audit.criticalFindings}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="min-w-[150px] self-center">
                    <div className="mb-2 flex justify-between text-[10px]">
                      <span className="text-slate-500">Progreso</span>
                      <span className="font-bold text-white">
                        {audit.progress}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-[#c9a227]"
                        style={{ width: `${audit.progress}%` }}
                      />
                    </div>
                  </div>
                </button>
              ))}

              {audits.length === 0 && (
                <div className="p-12 text-center text-sm text-slate-500">
                  No existen auditorías registradas.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showRisksCenter && (
        <div className="fixed inset-0 z-[166] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1928] shadow-2xl">

            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
                  Risk Intelligence
                </p>
                <h2 className="mt-1 text-2xl font-black text-white">
                  Centro de riesgos
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowRisksCenter(false);
                  setActiveSection('Dashboard');
                }}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[320px_1fr]">
              <div className="rounded-2xl border border-white/10 bg-[#07111f] p-6">
                <h3 className="font-bold text-white">
                  Distribución
                </h3>

                <div className="mt-6 space-y-5">
                  <RiskBar
                    label="Crítico"
                    count={riskCounts.critical}
                    total={totalFindings}
                    color="bg-red-500"
                  />
                  <RiskBar
                    label="Alto"
                    count={riskCounts.high}
                    total={totalFindings}
                    color="bg-orange-500"
                  />
                  <RiskBar
                    label="Medio"
                    count={riskCounts.medium}
                    total={totalFindings}
                    color="bg-[#c9a227]"
                  />
                  <RiskBar
                    label="Bajo"
                    count={riskCounts.low}
                    total={totalFindings}
                    color="bg-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {[...findings]
                  .sort((a, b) => b.score - a.score)
                  .map((finding) => (
                    <button
                      key={finding.id}
                      type="button"
                      onClick={() => {
                        setShowRisksCenter(false);
                        if (canWrite) {
                          openFindingDetail(finding);
                        }
                      }}
                      className="w-full rounded-2xl border border-white/10 bg-[#07111f] p-5 text-left transition hover:border-[#c9a227]/30"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] text-[#c9a227]">
                          {finding.findingCode}
                        </span>
                        <RiskBadge level={finding.riskLevel} />
                        <span className="text-xs font-black text-white">
                          Score {finding.score}
                        </span>
                      </div>

                      <h4 className="mt-3 font-bold text-white">
                        {finding.title}
                      </h4>

                      <p className="mt-1 text-xs text-slate-500">
                        {finding.category}
                      </p>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {decisionTransaction && decisionType && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0b1928] shadow-2xl">

            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <p
                  className={[
                    'text-[10px] font-bold uppercase tracking-[0.2em]',
                    decisionType === 'approved'
                      ? 'text-emerald-400'
                      : 'text-red-400',
                  ].join(' ')}
                >
                  Decisión de auditoría
                </p>

                <h2 className="mt-1 text-xl font-black text-white">
                  {decisionType === 'approved'
                    ? 'Aprobar transacción'
                    : 'Rechazar transacción'}
                </h2>

                <p className="mt-2 font-mono text-[10px] text-[#c9a227]">
                  {decisionTransaction.transactionCode}
                </p>
              </div>

              <button
                type="button"
                disabled={savingDecision}
                onClick={() => {
                  setDecisionTransaction(null);
                  setDecisionType(null);
                  setDecisionComment('');
                  setDecisionError(null);
                }}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="rounded-xl border border-white/10 bg-[#07111f] p-4">
                <div className="text-sm font-bold text-white">
                  {decisionTransaction.description}
                </div>

                <div className="mt-2 text-xs text-slate-500">
                  {decisionTransaction.amount.toLocaleString(
                    'es-DO',
                    {
                      minimumFractionDigits: 2,
                    }
                  )}{' '}
                  {decisionTransaction.currency}
                </div>

                {decisionTransaction.aiExplanation && (
                  <p className="mt-3 text-xs leading-5 text-slate-400">
                    {decisionTransaction.aiExplanation}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">
                  {decisionType === 'rejected'
                    ? 'Motivo del rechazo *'
                    : 'Comentario de aprobación'}
                </label>

                <textarea
                  rows={5}
                  value={decisionComment}
                  onChange={(event) =>
                    setDecisionComment(
                      event.target.value
                    )
                  }
                  placeholder={
                    decisionType === 'rejected'
                      ? 'Explica por qué la transacción es rechazada...'
                      : 'Comentario opcional sobre la aprobación...'
                  }
                  className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                />

                <p className="mt-2 text-[10px] text-slate-600">
                  {decisionType === 'rejected'
                    ? 'El motivo quedará registrado permanentemente en el Audit Trail.'
                    : 'El comentario es opcional y quedará registrado en el Audit Trail.'}
                </p>
              </div>

              {decisionError && (
                <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
                  {decisionError}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  disabled={savingDecision}
                  onClick={() => {
                    setDecisionTransaction(null);
                    setDecisionType(null);
                    setDecisionComment('');
                    setDecisionError(null);
                  }}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-slate-300 hover:bg-white/5 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  disabled={
                    savingDecision ||
                    (
                      decisionType === 'rejected' &&
                      !decisionComment.trim()
                    )
                  }
                  onClick={() =>
                    void handleFinalDecision()
                  }
                  className={[
                    'rounded-xl px-5 py-3 text-sm font-black disabled:opacity-40',
                    decisionType === 'approved'
                      ? 'bg-emerald-500 text-[#07111f] hover:bg-emerald-400'
                      : 'bg-red-500 text-white hover:bg-red-400',
                  ].join(' ')}
                >
                  {savingDecision
                    ? 'Guardando...'
                    : decisionType === 'approved'
                      ? 'Confirmar aprobación'
                      : 'Confirmar rechazo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTransactionAlerts && (
        <div className="fixed inset-0 z-[190] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1928] shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0b1928] p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
                  Transaction Alerts
                </p>

                <h2 className="mt-1 text-2xl font-black text-white">
                  Alertas transaccionales
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {pendingTransactionAlerts.length} alerta
                  {pendingTransactionAlerts.length === 1 ? '' : 's'} pendiente
                  {pendingTransactionAlerts.length === 1 ? '' : 's'}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowTransactionAlerts(false)
                }
                className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {transactionError && (
              <div className="mx-6 mt-6 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
                {transactionError}
              </div>
            )}

            <div className="space-y-4 p-6">
              {pendingTransactionAlerts.map(
                (transaction) => (
                  <div
                    key={transaction.id}
                    className="rounded-2xl border border-red-400/15 bg-red-400/[0.03] p-5"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-[#c9a227]">
                            {transaction.transactionCode}
                          </span>

                          <span className="rounded-full bg-red-400/10 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-red-300">
                            Score {transaction.anomalyScore ?? 0}
                          </span>

                          <span className="rounded-full border border-white/10 px-2 py-1 text-[9px] uppercase text-slate-500">
                            {transaction.status}
                          </span>
                        </div>

                        <h3 className="mt-3 font-bold text-white">
                          {transaction.description}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          {transaction.counterparty ||
                            'Sin contraparte'}
                          {' · '}
                          {transaction.amount.toLocaleString(
                            'es-DO',
                            {
                              minimumFractionDigits: 2,
                            }
                          )}{' '}
                          {transaction.currency}
                        </p>

                        {transaction.aiExplanation && (
                          <p className="mt-3 max-w-3xl text-xs leading-5 text-slate-400">
                            {transaction.aiExplanation}
                          </p>
                        )}

                        {transaction.reviewedAt && (
                          <p className="mt-3 text-[10px] text-slate-600">
                            Revisada el{' '}
                            {new Date(
                              transaction.reviewedAt
                            ).toLocaleString('es-DO')}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {canWrite &&
                          (transaction.status === 'flagged' ||
                            (
                              transaction.isAnomaly &&
                              transaction.status === 'pending'
                            )) && (
                            <button
                              type="button"
                              onClick={() => {
                                console.log(
                                  'CLICK REVISAR:',
                                  transaction.transactionCode,
                                  transaction.status
                                );

                                void handleReviewTransaction(
                                  transaction
                                );
                              }}
                              className="rounded-xl border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-xs font-black text-blue-300 hover:bg-blue-400/20"
                            >
                              Revisar alerta
                            </button>
                          )}

                        {canWrite &&
                          transaction.status === 'reviewed' && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  openDecisionModal(
                                    transaction,
                                    'approved'
                                  )
                                }
                                className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-black text-emerald-300 hover:bg-emerald-400/20"
                              >
                                Aprobar
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openDecisionModal(
                                    transaction,
                                    'rejected'
                                  )
                                }
                                className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2 text-xs font-black text-red-300 hover:bg-red-400/20"
                              >
                                Rechazar
                              </button>
                            </>
                          )}

                        <button
                          type="button"
                          onClick={() => {
                            setShowTransactionAlerts(false);
                            setShowTransactionsCenter(true);

                            if (canWrite) {
                              openTransactionDetail(
                                transaction
                              );
                            }
                          }}
                          className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/5"
                        >
                          Ver detalle
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}

              {pendingTransactionAlerts.length === 0 && (
                <div className="p-12 text-center">
                  <ShieldCheck className="mx-auto h-10 w-10 text-emerald-400" />

                  <h3 className="mt-4 font-black text-white">
                    Sin alertas pendientes
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    No existen anomalías pendientes de revisión.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showTransactionsCenter && (
        <div className="fixed inset-0 z-[167] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="max-h-[94vh] w-full max-w-7xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1928] shadow-2xl">

            <div className="sticky top-0 z-10 flex flex-col gap-4 border-b border-white/10 bg-[#0b1928] p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
                  Transaction Analytics
                </p>

                <h2 className="mt-1 text-2xl font-black text-white">
                  Centro de transacciones
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Análisis financiero y detección de anomalías
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {canWrite && (
                  <button
                    type="button"
                    onClick={openNewTransaction}
                    className="rounded-xl bg-[#c9a227] px-4 py-2 text-xs font-black text-[#07111f]"
                  >
                    Nueva transacción
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowTransactionsCenter(false);
                    setActiveSection('Dashboard');
                  }}
                  className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {transactionError && (
              <div className="mx-6 mt-6 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
                {transactionError}
              </div>
            )}

            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
              <ReportMetric
                label="Transacciones"
                value={String(transactions.length)}
              />

              <ReportMetric
                label="Anomalías"
                value={String(flaggedTransactions.length)}
              />

              <ReportMetric
                label="Importe filtrado"
                value={transactionTotal.toLocaleString(
                  'es-DO',
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              />

              <ReportMetric
                label="Revisadas"
                value={String(
                  transactions.filter(
                    (item) =>
                      item.status === 'reviewed'
                  ).length
                )}
              />
            </div>

            <div className="flex flex-wrap gap-3 px-6 pb-6">
              <select
                value={transactionStatusFilter}
                onChange={(e) =>
                  setTransactionStatusFilter(
                    e.target.value as
                      | 'all'
                      | TransactionStatus
                  )
                }
                className="rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-xs text-white"
              >
                <option value="all">
                  Todos los estados
                </option>
                <option value="pending">
                  Pendiente
                </option>
                <option value="approved">
                  Aprobada
                </option>
                <option value="rejected">
                  Rechazada
                </option>
                <option value="flagged">
                  Marcada
                </option>
                <option value="reviewed">
                  Revisada
                </option>
              </select>

              <select
                value={transactionAnomalyFilter}
                onChange={(e) =>
                  setTransactionAnomalyFilter(
                    e.target.value as
                      | 'all'
                      | 'anomaly'
                      | 'normal'
                  )
                }
                className="rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-xs text-white"
              >
                <option value="all">
                  Todas
                </option>
                <option value="anomaly">
                  Solo anomalías
                </option>
                <option value="normal">
                  Sin anomalías
                </option>
              </select>
            </div>

            {loadingTransactions ? (
              <div className="p-12 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#c9a227] border-t-transparent" />
                <p className="mt-4 text-sm text-slate-400">
                  Cargando transacciones...
                </p>
              </div>
            ) : (
              <div className="space-y-3 p-6 pt-0">
                {filteredTransactions.map(
                  (transaction) => {
                    const audit = audits.find(
                      (item) =>
                        item.id === transaction.auditId
                    );

                    return (
                      <div
                        key={transaction.id}
                        className="grid gap-5 rounded-2xl border border-white/10 bg-[#07111f] p-5 lg:grid-cols-[1fr_auto]"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (canWrite) {
                              openTransactionDetail(
                                transaction
                              );
                            }
                          }}
                          className="text-left"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-[#c9a227]">
                              {transaction.transactionCode}
                            </span>

                            {transaction.isAnomaly && (
                              <span className="rounded-full bg-red-400/10 px-2 py-1 text-[9px] font-bold uppercase text-red-300">
                                Anomalía
                              </span>
                            )}

                            <span className="rounded-full border border-white/10 px-2 py-1 text-[9px] uppercase text-slate-500">
                              {transaction.status}
                            </span>
                          </div>

                          <h3 className="mt-3 font-bold text-white">
                            {transaction.description}
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            {transaction.counterparty ||
                              'Sin contraparte'}
                            {' · '}
                            {audit?.auditCode ??
                              'Sin auditoría'}
                          </p>

                          {transaction.aiExplanation && (
                            <p className="mt-3 text-xs leading-5 text-slate-500">
                              {transaction.aiExplanation}
                            </p>
                          )}
                        </button>

                        <div className="flex flex-wrap items-center gap-5">
                          <div className="text-right">
                            <div className="text-lg font-black text-white">
                              {transaction.amount.toLocaleString(
                                'es-DO',
                                {
                                  minimumFractionDigits: 2,
                                }
                              )}
                            </div>

                            <div className="text-[10px] text-slate-500">
                              {transaction.currency}
                            </div>
                          </div>

                          {transaction.anomalyScore !== null && (
                            <div className="text-center">
                              <div className="text-[9px] uppercase text-slate-600">
                                Score
                              </div>

                              <div className="mt-1 font-black text-white">
                                {transaction.anomalyScore}
                              </div>
                            </div>
                          )}

                          {canWrite &&
                            transaction.status !==
                              'reviewed' && (
                              <button
                                type="button"
                                onClick={() =>
                                  void handleReviewTransaction(
                                    transaction
                                  )
                                }
                                className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-xs font-bold text-emerald-300"
                              >
                                Revisar
                              </button>
                            )}

                          {role === 'admin' && (
                            <button
                              type="button"
                              onClick={() =>
                                void handleDeleteTransaction(
                                  transaction
                                )
                              }
                              className="rounded-xl border border-red-400/20 bg-red-400/5 px-3 py-2 text-xs font-bold text-red-300"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}

                {filteredTransactions.length === 0 && (
                  <div className="rounded-2xl border border-white/10 p-12 text-center text-sm text-slate-500">
                    No hay transacciones para los filtros seleccionados.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showTransactionForm && (
        <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1928] shadow-2xl">

            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
                  Transacción
                </p>

                <h2 className="mt-1 text-xl font-black text-white">
                  {selectedTransaction
                    ? selectedTransaction.transactionCode
                    : 'Nueva transacción'}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowTransactionForm(false)
                }
                className="rounded-xl p-2 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveTransaction}
              className="space-y-5 p-6"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-300">
                    Auditoría
                  </label>

                  <select
                    value={transactionForm.auditId}
                    onChange={(e) => {
                      const audit = audits.find(
                        (item) =>
                          item.id === e.target.value
                      );

                      setTransactionForm({
                        ...transactionForm,
                        auditId: e.target.value,
                        organizationId:
                          audit?.organizationId ?? '',
                      });
                    }}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white"
                  >
                    <option value="">
                      Sin auditoría
                    </option>

                    {audits.map((audit) => (
                      <option
                        key={audit.id}
                        value={audit.id}
                      >
                        {audit.auditCode} · {audit.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">
                    Fecha
                  </label>

                  <input
                    type="datetime-local"
                    value={
                      transactionForm.transactionDate
                    }
                    onChange={(e) =>
                      setTransactionForm({
                        ...transactionForm,
                        transactionDate:
                          e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">
                  Descripción
                </label>

                <input
                  value={transactionForm.description}
                  onChange={(e) =>
                    setTransactionForm({
                      ...transactionForm,
                      description: e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <input
                  placeholder="Referencia"
                  value={transactionForm.reference}
                  onChange={(e) =>
                    setTransactionForm({
                      ...transactionForm,
                      reference: e.target.value,
                    })
                  }
                  className="rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white"
                />

                <input
                  placeholder="Cuenta"
                  value={transactionForm.accountCode}
                  onChange={(e) =>
                    setTransactionForm({
                      ...transactionForm,
                      accountCode: e.target.value,
                    })
                  }
                  className="rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white"
                />

                <input
                  placeholder="Contraparte"
                  value={transactionForm.counterparty}
                  onChange={(e) =>
                    setTransactionForm({
                      ...transactionForm,
                      counterparty: e.target.value,
                    })
                  }
                  className="rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <input
                  type="number"
                  step="0.01"
                  value={transactionForm.amount}
                  onChange={(e) =>
                    setTransactionForm({
                      ...transactionForm,
                      amount: Number(e.target.value),
                    })
                  }
                  className="rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white"
                />

                <input
                  value={transactionForm.currency}
                  onChange={(e) =>
                    setTransactionForm({
                      ...transactionForm,
                      currency: e.target.value,
                    })
                  }
                  className="rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white"
                />

                <select
                  value={transactionForm.status}
                  onChange={(e) =>
                    setTransactionForm({
                      ...transactionForm,
                      status:
                        e.target.value as TransactionStatus,
                    })
                  }
                  className="rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white"
                >
                  <option value="pending">
                    Pendiente
                  </option>
                  <option value="approved">
                    Aprobada
                  </option>
                  <option value="rejected">
                    Rechazada
                  </option>
                  <option value="flagged">
                    Marcada
                  </option>
                  <option value="reviewed">
                    Revisada
                  </option>
                </select>
              </div>

              {selectedTransaction && (
                <>
                  <label className="flex items-center gap-3 rounded-xl border border-white/10 p-4">
                    <input
                      type="checkbox"
                      checked={
                        transactionForm.isAnomaly
                      }
                      onChange={(e) =>
                        setTransactionForm({
                          ...transactionForm,
                          isAnomaly:
                            e.target.checked,
                        })
                      }
                    />

                    <span className="text-sm font-bold text-slate-300">
                      Marcar como anomalía
                    </span>
                  </label>

                  <div>
                    <label className="text-xs font-bold text-slate-300">
                      Anomaly score
                    </label>

                    <input
                      type="number"
                      step="0.01"
                      value={
                        transactionForm.anomalyScore
                      }
                      onChange={(e) =>
                        setTransactionForm({
                          ...transactionForm,
                          anomalyScore:
                            e.target.value,
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300">
                      Explicación
                    </label>

                    <textarea
                      rows={3}
                      value={
                        transactionForm.aiExplanation
                      }
                      onChange={(e) =>
                        setTransactionForm({
                          ...transactionForm,
                          aiExplanation:
                            e.target.value,
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white"
                    />
                  </div>
                </>
              )}

              {selectedTransaction && (
                <div className="rounded-2xl border border-white/10 bg-[#07111f] p-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
                      Audit Trail
                    </p>

                    <h3 className="mt-1 font-black text-white">
                      Historial de decisiones
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Registro cronológico de cambios de estado
                    </p>
                  </div>

                  {transactionReviewsError && (
                    <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-300">
                      {transactionReviewsError}
                    </div>
                  )}

                  {loadingTransactionReviews ? (
                    <div className="py-8 text-center">
                      <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#c9a227] border-t-transparent" />

                      <p className="mt-3 text-xs text-slate-500">
                        Cargando historial...
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 space-y-0">
                      {transactionReviews.map(
                        (review, index) => {
                          const statusLabels: Record<
                            TransactionStatus,
                            string
                          > = {
                            pending: 'Pendiente',
                            approved: 'Aprobada',
                            rejected: 'Rechazada',
                            flagged: 'Marcada',
                            reviewed: 'Revisada',
                          };

                          return (
                            <div
                              key={review.id}
                              className="relative flex gap-4 pb-6"
                            >
                              <div className="relative flex flex-col items-center">
                                <div
                                  className={[
                                    'relative z-10 h-3 w-3 rounded-full',
                                    review.toStatus === 'approved'
                                      ? 'bg-emerald-400'
                                      : review.toStatus === 'rejected'
                                        ? 'bg-red-400'
                                        : review.toStatus === 'reviewed'
                                          ? 'bg-blue-400'
                                          : review.toStatus === 'flagged'
                                            ? 'bg-orange-400'
                                            : 'bg-[#c9a227]',
                                  ].join(' ')}
                                />

                                {index <
                                  transactionReviews.length -
                                    1 && (
                                  <div className="absolute top-3 h-full w-px bg-white/10" />
                                )}
                              </div>

                              <div className="-mt-1 min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-black text-white">
                                    {review.fromStatus
                                      ? statusLabels[
                                          review.fromStatus
                                        ]
                                      : 'Sin estado'}
                                  </span>

                                  <span className="text-xs text-slate-600">
                                    →
                                  </span>

                                  <span
                                    className={[
                                      'text-xs font-black',
                                      review.toStatus ===
                                      'approved'
                                        ? 'text-emerald-300'
                                        : review.toStatus ===
                                          'rejected'
                                          ? 'text-red-300'
                                          : review.toStatus ===
                                            'reviewed'
                                            ? 'text-blue-300'
                                            : review.toStatus ===
                                              'flagged'
                                              ? 'text-orange-300'
                                              : 'text-[#c9a227]',
                                    ].join(' ')}
                                  >
                                    {
                                      statusLabels[
                                        review.toStatus
                                      ]
                                    }
                                  </span>
                                </div>

                                <p className="mt-1 text-[10px] text-slate-500">
                                  {new Date(
                                    review.createdAt
                                  ).toLocaleString(
                                    'es-DO'
                                  )}
                                </p>

                              {(() => {
                                const reviewer =
                                  getReviewerIdentity(
                                    review.reviewedBy
                                  );

                                return (
                                  <div className="mt-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                                    <p className="break-all text-[10px] font-bold text-slate-400">
                                      {reviewer.email}
                                    </p>

                                    <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                                      {reviewer.roleLabel}
                                    </p>
                                  </div>
                                );
                              })()}

                                {review.comment && (
                                  <p className="mt-2 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs leading-5 text-slate-400">
                                    {review.comment}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        }
                      )}

                      {transactionReviews.length === 0 && (
                        <div className="py-8 text-center text-sm text-slate-500">
                          Esta transacción todavía no tiene
                          decisiones registradas.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={() =>
                    setShowTransactionForm(false)
                  }
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-slate-300"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={savingTransaction}
                  className="rounded-xl bg-[#c9a227] px-5 py-3 text-sm font-black text-[#07111f] disabled:opacity-50"
                >
                  {savingTransaction
                    ? 'Guardando...'
                    : selectedTransaction
                      ? 'Guardar cambios'
                      : 'Crear transacción'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUsersCenter && role === 'admin' && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1928] shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0b1928] p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
                  Administración
                </p>

                <h2 className="mt-1 text-2xl font-black text-white">
                  Usuarios y permisos
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Gestión centralizada de roles de acceso
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowUsersCenter(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {usersError && (
              <div className="mx-6 mt-6 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
                {usersError}
              </div>
            )}

            {loadingUsers ? (
              <div className="p-12 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#c9a227] border-t-transparent" />
                <p className="mt-4 text-sm text-slate-400">
                  Cargando usuarios...
                </p>
              </div>
            ) : (
              <div className="p-6">
                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-[#07111f]">
                      <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="px-5 py-4">Usuario</th>
                        <th className="px-5 py-4">Rol</th>
                        <th className="px-5 py-4">Alta</th>
                        <th className="px-5 py-4">Último acceso</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/5">
                      {adminUsers.map((adminUser) => (
                        <tr
                          key={adminUser.id}
                          className="transition hover:bg-white/[0.025]"
                        >
                          <td className="px-5 py-4">
                            <div className="font-bold text-white">
                              {adminUser.email || 'Sin email'}
                            </div>

                            {adminUser.id === user?.id && (
                              <div className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#c9a227]">
                                Sesión actual
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <select
                              value={adminUser.role}
                              disabled={
                                changingUserId === adminUser.id
                              }
                              onChange={(e) =>
                                void handleChangeUserRole(
                                  adminUser.id,
                                  e.target.value as AppUserRole
                                )
                              }
                              className="rounded-xl border border-white/10 bg-[#07111f] px-3 py-2 text-xs font-bold text-white outline-none focus:border-[#c9a227] disabled:opacity-50"
                            >
                              <option value="admin">
                                Administrador
                              </option>

                              <option value="auditor">
                                Auditor
                              </option>

                              <option value="viewer">
                                Consulta
                              </option>
                            </select>

                            {changingUserId === adminUser.id && (
                              <div className="mt-1 text-[9px] text-slate-500">
                                Guardando...
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-4 text-xs text-slate-400">
                            {adminUser.createdAt
                              ? new Date(
                                  adminUser.createdAt
                                ).toLocaleString('es-DO')
                              : '—'}
                          </td>

                          <td className="px-5 py-4 text-xs text-slate-400">
                            {adminUser.lastSignInAt
                              ? new Date(
                                  adminUser.lastSignInAt
                                ).toLocaleString('es-DO')
                              : 'Nunca'}
                          </td>
                        </tr>
                      ))}

                      {adminUsers.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-5 py-12 text-center text-sm text-slate-500"
                          >
                            No hay usuarios disponibles.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-5 rounded-xl border border-[#c9a227]/10 bg-[#c9a227]/5 p-4">
                  <p className="text-xs leading-5 text-slate-400">
                    Los permisos efectivos continúan siendo
                    controlados por las políticas RLS y las
                    funciones seguras de Supabase. Este panel solo
                    administra la asignación de roles.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showReportsCenter && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="max-h-[94vh] w-full max-w-7xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1928] shadow-2xl">

            <div className="sticky top-0 z-10 flex flex-col gap-4 border-b border-white/10 bg-[#0b1928] p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
                  Executive Reporting
                </p>

                <h2 className="mt-1 text-2xl font-black text-white">
                  Centro de reportes
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Vista previa de informes de auditoría
                </p>
              </div>

              <div className="flex items-center gap-3">
                {reportAuditId && (
                  <div className="flex flex-wrap items-center gap-2">
                    {(!storedReport ||
                      storedReport.status === 'draft') && (
                      <>
                        <button
                          type="button"
                          onClick={() => void handleSaveReportDraft()}
                          disabled={savingReport}
                          className="rounded-xl border border-[#c9a227]/30 px-4 py-3 text-xs font-bold text-[#c9a227] disabled:opacity-50"
                        >
                          Guardar borrador
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void handleGenerateReportDirectly()
                          }
                          disabled={savingReport}
                          className="rounded-xl border border-blue-400/20 bg-blue-400/5 px-4 py-3 text-xs font-bold text-blue-300 disabled:opacity-50"
                        >
                          {savingReport
                            ? 'Generando...'
                            : 'Generar informe'}
                        </button>
                      </>
                    )}

                    {canApproveReports &&
                      storedReport?.status === 'generated' && (
                      <button
                        type="button"
                        onClick={() => void handleApproveStoredReport()}
                        disabled={savingReport}
                        className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-xs font-bold text-emerald-300 disabled:opacity-50"
                      >
                        Aprobar informe
                      </button>
                    )}
                  </div>
                )}

                {reportAuditId && (
                  <button
                    type="button"
                    onClick={() => void handleExportPdf()}
                    disabled={generatingPdf}
                    className="rounded-xl bg-[#c9a227] px-4 py-3 text-xs font-black text-[#07111f] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {generatingPdf
                      ? 'Generando PDF...'
                      : 'Descargar PDF'}
                  </button>
                )}

                <select
                  value={reportAuditId}
                  onChange={(e) => setReportAuditId(e.target.value)}
                  className="min-w-[280px] rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                >
                  <option value="">
                    Seleccionar auditoría
                  </option>

                  {audits.map((audit) => (
                    <option key={audit.id} value={audit.id}>
                      {audit.auditCode} · {audit.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setShowReportsCenter(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {!reportAuditId ? (
              <div className="p-12 text-center">
                <Target className="mx-auto h-9 w-9 text-slate-600" />

                <p className="mt-4 font-bold text-white">
                  Selecciona una auditoría
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  El reporte se generará con los datos almacenados
                  actualmente en Supabase.
                </p>
              </div>
            ) : (() => {
              const audit = audits.find(
                (item) => item.id === reportAuditId
              );

              if (!audit) {
                return (
                  <div className="p-12 text-center text-slate-500">
                    Auditoría no disponible.
                  </div>
                );
              }

              const report = buildExecutiveAuditReport(
                audit,
                findings
              );

              return (
                <div
                  id="audit-report-print"
                  className="p-6 sm:p-8"
                >

                  {reportWorkflowError && (
                    <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
                      {reportWorkflowError}
                    </div>
                  )}

                  <div className="mb-6 grid gap-4 rounded-2xl border border-white/10 bg-[#07111f] p-5 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-slate-300">
                        Auditor responsable
                      </label>

                      <input
                        value={auditorName}
                        onChange={(e) => setAuditorName(e.target.value)}
                        placeholder="Nombre del auditor"
                        className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1928] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300">
                        Aprobador
                      </label>

                      <input
                        value={approverName}
                        onChange={(e) => setApproverName(e.target.value)}
                        placeholder="Nombre del aprobador"
                        className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1928] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                      />
                    </div>

                    {storedReport && (
                      <div className="sm:col-span-2 flex flex-wrap gap-4 text-xs text-slate-400">
                        <span>
                          Código:
                          <strong className="ml-2 text-white">
                            {storedReport.reportCode}
                          </strong>
                        </span>

                        <span>
                          Estado:
                          <strong className="ml-2 text-white">
                            {{
                              draft: 'Borrador',
                              generated: 'Generado',
                              approved: 'Aprobado',
                            }[storedReport.status]}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Report header */}
                  <div className="rounded-2xl border border-white/10 bg-[#07111f] p-6 sm:p-8">
                    <div className="flex flex-col justify-between gap-6 lg:flex-row">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#c9a227]">
                          SUAREZ AI AUDIT
                        </div>

                        <h1 className="mt-3 text-3xl font-black text-white">
                          Informe Ejecutivo de Auditoría
                        </h1>

                        <div className="mt-3 font-mono text-xs text-slate-500">
                          {audit.auditCode}
                        </div>
                      </div>

                      <div className="lg:text-right">
                        <RiskBadge level={audit.riskLevel} />

                        <div className="mt-3 text-sm font-bold text-white">
                          {formatAuditStatus(audit.status)}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          Progreso: {audit.progress}%
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 grid gap-5 border-t border-white/10 pt-6 md:grid-cols-3">
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                          Organización
                        </div>

                        <div className="mt-2 font-bold text-white">
                          {audit.organization}
                        </div>
                      </div>

                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                          Auditoría
                        </div>

                        <div className="mt-2 font-bold text-white">
                          {audit.name}
                        </div>
                      </div>

                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                          Tipo
                        </div>

                        <div className="mt-2 font-bold text-white">
                          {audit.type}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* KPI */}
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <ReportMetric
                      label="Hallazgos"
                      value={String(report.summary.total)}
                    />

                    <ReportMetric
                      label="Críticos"
                      value={String(report.summary.critical)}
                    />

                    <ReportMetric
                      label="Altos"
                      value={String(report.summary.high)}
                    />

                    <ReportMetric
                      label="Resueltos"
                      value={String(report.summary.resolved)}
                    />

                    <ReportMetric
                      label="Score promedio"
                      value={String(report.summary.averageScore)}
                    />
                  </div>

                  {/* Audit content */}
                  <div className="mt-6 grid gap-6 xl:grid-cols-3">
                    <ReportTextSection
                      title="Alcance"
                      text={
                        audit.scope ||
                        'No se ha definido el alcance.'
                      }
                    />

                    <ReportTextSection
                      title="Objetivos"
                      text={
                        audit.objectives ||
                        'No se han definido objetivos.'
                      }
                    />

                    <ReportTextSection
                      title="Metodología"
                      text={
                        audit.methodology ||
                        'No se ha definido metodología.'
                      }
                    />
                  </div>

                  <div className="mt-6 grid gap-6 xl:grid-cols-2">
                    <ReportTextSection
                      title="Resumen ejecutivo"
                      text={report.executiveSummary}
                    />

                    <ReportTextSection
                      title="Conclusión"
                      text={report.conclusion}
                    />
                  </div>

                  {report.actionPlan.length > 0 && (
                    <div className="mt-6 rounded-2xl border border-white/10 bg-[#07111f] p-6">
                      <h3 className="font-black text-white">
                        Plan de acción prioritario
                      </h3>

                      <div className="mt-5 space-y-4">
                        {report.actionPlan.map((finding, index) => (
                          <div
                            key={finding.id}
                            className="rounded-xl border border-white/10 p-4"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-black text-[#c9a227]">
                                {index + 1}.
                              </span>

                              <span className="font-mono text-[10px] text-slate-500">
                                {finding.findingCode}
                              </span>

                              <RiskBadge level={finding.riskLevel} />
                            </div>

                            <p className="mt-3 text-sm font-bold text-white">
                              {finding.title}
                            </p>

                            <p className="mt-2 text-xs leading-5 text-slate-500">
                              {finding.recommendation || 'Sin recomendación registrada.'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risk summary */}
                  <div className="mt-6 rounded-2xl border border-white/10 bg-[#07111f] p-6">
                    <h3 className="font-black text-white">
                      Resumen de riesgo
                    </h3>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <RiskBar
                        label="Crítico"
                        count={report.summary.critical}
                        total={report.summary.total}
                        color="bg-red-500"
                      />

                      <RiskBar
                        label="Alto"
                        count={report.summary.high}
                        total={report.summary.total}
                        color="bg-orange-500"
                      />

                      <RiskBar
                        label="Medio"
                        count={report.summary.medium}
                        total={report.summary.total}
                        color="bg-[#c9a227]"
                      />

                      <RiskBar
                        label="Bajo"
                        count={report.summary.low}
                        total={report.summary.total}
                        color="bg-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Findings */}
                  <div className="mt-6 rounded-2xl border border-white/10 bg-[#07111f]">
                    <div className="border-b border-white/10 p-6">
                      <h3 className="font-black text-white">
                        Hallazgos de auditoría
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Detalle de observaciones y recomendaciones
                      </p>
                    </div>

                    {report.findings.length === 0 ? (
                      <div className="p-10 text-center text-sm text-slate-500">
                        Esta auditoría no tiene hallazgos registrados.
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {report.findings.map((finding) => (
                          <div
                            key={finding.id}
                            className="grid gap-5 p-6 lg:grid-cols-[1fr_220px]"
                          >
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-[10px] font-bold text-[#c9a227]">
                                  {finding.findingCode}
                                </span>

                                <RiskBadge
                                  level={finding.riskLevel}
                                />

                                <span className="rounded-full border border-white/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                  {finding.category}
                                </span>
                              </div>

                              <h4 className="mt-3 font-bold text-white">
                                {finding.title}
                              </h4>

                              <p className="mt-2 text-xs leading-5 text-slate-500">
                                {finding.description}
                              </p>

                              {finding.recommendation && (
                                <div className="mt-4 rounded-xl border border-[#c9a227]/10 bg-[#c9a227]/5 p-4">
                                  <div className="text-[9px] font-bold uppercase tracking-wider text-[#c9a227]">
                                    Recomendación
                                  </div>

                                  <p className="mt-2 text-xs leading-5 text-slate-400">
                                    {finding.recommendation}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
                              <div>
                                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                                  Score
                                </div>

                                <div className="mt-1 text-2xl font-black text-white">
                                  {finding.score}
                                </div>
                              </div>

                              <div>
                                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                                  Estado
                                </div>

                                <div className="mt-1 text-xs font-bold text-slate-300">
                                  {{
                                    open: 'Abierto',
                                    investigating: 'Investigando',
                                    resolved: 'Resuelto',
                                    accepted: 'Aceptado',
                                  }[finding.status]}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {(showNewOrganization || selectedOrganization) && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1928] shadow-2xl">

            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
                  Organización
                </p>

                <h2 className="mt-1 text-xl font-black text-white">
                  {selectedOrganization
                    ? 'Editar organización'
                    : 'Nueva organización'}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowNewOrganization(false);
                  setSelectedOrganization(null);
                }}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveOrganization}
              className="space-y-5 p-6"
            >
              {organizationError && (
                <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
                  {organizationError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-300">
                  Nombre
                </label>

                <input
                  value={organizationForm.name}
                  onChange={(e) =>
                    setOrganizationForm({
                      ...organizationForm,
                      name: e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">
                  Razón social
                </label>

                <input
                  value={organizationForm.legalName}
                  onChange={(e) =>
                    setOrganizationForm({
                      ...organizationForm,
                      legalName: e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-300">
                    Industria
                  </label>

                  <input
                    value={organizationForm.industry}
                    onChange={(e) =>
                      setOrganizationForm({
                        ...organizationForm,
                        industry: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">
                    RNC / Identificación fiscal
                  </label>

                  <input
                    value={organizationForm.taxId}
                    onChange={(e) =>
                      setOrganizationForm({
                        ...organizationForm,
                        taxId: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">
                  Persona de contacto
                </label>

                <input
                  value={organizationForm.contactName}
                  onChange={(e) =>
                    setOrganizationForm({
                      ...organizationForm,
                      contactName: e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-300">
                    Email
                  </label>

                  <input
                    type="email"
                    value={organizationForm.contactEmail}
                    onChange={(e) =>
                      setOrganizationForm({
                        ...organizationForm,
                        contactEmail: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">
                    Teléfono
                  </label>

                  <input
                    value={organizationForm.contactPhone}
                    onChange={(e) =>
                      setOrganizationForm({
                        ...organizationForm,
                        contactPhone: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                  />
                </div>
              </div>

              {selectedOrganization && (
                <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#07111f] p-4">
                  <input
                    type="checkbox"
                    checked={organizationForm.active}
                    onChange={(e) =>
                      setOrganizationForm({
                        ...organizationForm,
                        active: e.target.checked,
                      })
                    }
                  />

                  <span className="text-sm font-bold text-slate-300">
                    Organización activa
                  </span>
                </label>
              )}

              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewOrganization(false);
                    setSelectedOrganization(null);
                  }}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-slate-300 hover:bg-white/5"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={savingOrganization}
                  className="rounded-xl bg-[#c9a227] px-5 py-3 text-sm font-black text-[#07111f] disabled:opacity-50"
                >
                  {savingOrganization
                    ? 'Guardando...'
                    : selectedOrganization
                      ? 'Guardar cambios'
                      : 'Crear organización'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showOrganizationsCenter && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1928] shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0b1928] p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
                  Gestión empresarial
                </p>

                <h2 className="mt-1 text-2xl font-black text-white">
                  Organizaciones
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {allOrganizations.length} organización{allOrganizations.length === 1 ? '' : 'es'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={openNewOrganization}
                  className="rounded-xl bg-[#c9a227] px-4 py-2 text-xs font-black text-[#07111f]"
                >
                  Nueva organización
                </button>

                <button
                  type="button"
                  onClick={() => setShowOrganizationsCenter(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {organizationError && (
              <div className="mx-6 mt-6 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
                {organizationError}
              </div>
            )}

            <div className="grid gap-4 p-6">
              {allOrganizations.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-[#07111f] p-10 text-center">
                  <p className="font-bold text-white">
                    No hay organizaciones registradas
                  </p>

                  <button
                    type="button"
                    onClick={openNewOrganization}
                    className="mt-4 rounded-xl bg-[#c9a227] px-5 py-3 text-sm font-black text-[#07111f]"
                  >
                    Crear primera organización
                  </button>
                </div>
              ) : (
                allOrganizations.map((organization) => {
                  const relatedAudits = audits.filter(
                    (audit) =>
                      audit.organizationId === organization.id
                  );

                  return (
                    <div
                      key={organization.id}
                      className="grid gap-4 rounded-2xl border border-white/10 bg-[#07111f] p-5 md:grid-cols-[1fr_auto]"
                    >
                      <button
                        type="button"
                        onClick={() => openOrganizationDetail(organization)}
                        className="text-left"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-white">
                            {organization.name}
                          </h3>

                          <span
                            className={[
                              'rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wider',
                              organization.active
                                ? 'bg-emerald-400/10 text-emerald-300'
                                : 'bg-slate-400/10 text-slate-400',
                            ].join(' ')}
                          >
                            {organization.active ? 'Activa' : 'Inactiva'}
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-slate-500">
                          {organization.legalName || 'Sin razón social'}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-4 text-[10px] text-slate-600">
                          <span>
                            Industria:{' '}
                            <strong className="text-slate-300">
                              {organization.industry || 'No especificada'}
                            </strong>
                          </span>

                          <span>
                            Auditorías:{' '}
                            <strong className="text-slate-300">
                              {relatedAudits.length}
                            </strong>
                          </span>

                          <span>
                            Contacto:{' '}
                            <strong className="text-slate-300">
                              {organization.contactName || 'No registrado'}
                            </strong>
                          </span>
                        </div>
                      </button>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openOrganizationDetail(organization)}
                          className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/5"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void handleOrganizationActive(organization)
                          }
                          className={[
                            'rounded-xl px-4 py-2 text-xs font-bold',
                            organization.active
                              ? 'border border-red-400/20 bg-red-400/5 text-red-300'
                              : 'border border-emerald-400/20 bg-emerald-400/5 text-emerald-300',
                          ].join(' ')}
                        >
                          {organization.active ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {showFindingsCenter && (
        <div className="fixed inset-0 z-[125] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1928] shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0b1928] p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
                  Control Center
                </p>

                <h2 className="mt-1 text-2xl font-black text-white">
                  Centro de hallazgos
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {findings.length} hallazgo{findings.length === 1 ? '' : 's'} registrados
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowFindingsCenter(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 p-6">
              {findings.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-[#07111f] p-10 text-center">
                  <FileSearch className="mx-auto h-8 w-8 text-slate-600" />

                  <p className="mt-4 font-bold text-white">
                    No hay hallazgos registrados
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Crea el primer hallazgo desde el dashboard.
                  </p>
                </div>
              ) : (
                findings.map((finding) => {
                  const audit = audits.find(
                    (item) => item.id === finding.auditId
                  );

                  const statusLabels = {
                    open: 'Abierto',
                    investigating: 'Investigando',
                    resolved: 'Resuelto',
                    accepted: 'Aceptado',
                  };

                  return (
                    <button
                      type="button"
                      key={finding.id}
                      onClick={() => {
                        setShowFindingsCenter(false);
                        openFindingDetail(finding);
                      }}
                      className="grid gap-4 rounded-2xl border border-white/10 bg-[#07111f] p-5 text-left transition hover:border-[#c9a227]/30 hover:bg-white/[0.025] md:grid-cols-[1fr_auto]"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-[#c9a227]">
                            {finding.findingCode}
                          </span>

                          <RiskBadge level={finding.riskLevel} />

                          <span className="rounded-full border border-white/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            {finding.category}
                          </span>
                        </div>

                        <h3 className="mt-3 font-bold text-white">
                          {finding.title}
                        </h3>

                        <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500">
                          {finding.description}
                        </p>

                        <div className="mt-3 text-[10px] text-slate-600">
                          {audit
                            ? `${audit.auditCode} · ${audit.name}`
                            : 'Auditoría no disponible'}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 md:text-right">
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                            Score
                          </div>

                          <div className="mt-1 text-xl font-black text-white">
                            {finding.score}
                          </div>
                        </div>

                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                            Estado
                          </div>

                          <div className="mt-1 text-xs font-bold text-slate-300">
                            {statusLabels[finding.status]}
                          </div>
                        </div>

                        <ChevronRight className="h-4 w-4 text-slate-700" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {selectedFinding && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1928] shadow-2xl">

            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
                  {selectedFinding.findingCode}
                </p>

                <h2 className="mt-1 text-xl font-black text-white">
                  Detalle del hallazgo
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFinding(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleUpdateFinding}
              className="space-y-5 p-6"
            >
              {editFindingError && (
                <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
                  {editFindingError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-300">
                  Auditoría
                </label>

                <select
                  value={editFindingForm.auditId}
                  onChange={(e) =>
                    setEditFindingForm({
                      ...editFindingForm,
                      auditId: e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                  required
                >
                  {audits.map((audit) => (
                    <option key={audit.id} value={audit.id}>
                      {audit.auditCode} · {audit.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">
                  Título
                </label>

                <input
                  value={editFindingForm.title}
                  onChange={(e) =>
                    setEditFindingForm({
                      ...editFindingForm,
                      title: e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">
                  Descripción
                </label>

                <textarea
                  rows={3}
                  value={editFindingForm.description}
                  onChange={(e) =>
                    setEditFindingForm({
                      ...editFindingForm,
                      description: e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-300">
                    Categoría
                  </label>

                  <input
                    value={editFindingForm.category}
                    onChange={(e) =>
                      setEditFindingForm({
                        ...editFindingForm,
                        category: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">
                    Score
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={editFindingForm.score}
                    onChange={(e) =>
                      setEditFindingForm({
                        ...editFindingForm,
                        score: Number(e.target.value),
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-300">
                    Riesgo
                  </label>

                  <select
                    value={editFindingForm.riskLevel}
                    onChange={(e) =>
                      setEditFindingForm({
                        ...editFindingForm,
                        riskLevel: e.target.value as
                          | 'low'
                          | 'medium'
                          | 'high'
                          | 'critical',
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                  >
                    <option value="low">Bajo</option>
                    <option value="medium">Medio</option>
                    <option value="high">Alto</option>
                    <option value="critical">Crítico</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">
                    Estado
                  </label>

                  <select
                    value={editFindingForm.status}
                    onChange={(e) =>
                      setEditFindingForm({
                        ...editFindingForm,
                        status: e.target.value as
                          | 'open'
                          | 'investigating'
                          | 'resolved'
                          | 'accepted',
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                  >
                    <option value="open">Abierto</option>
                    <option value="investigating">Investigando</option>
                    <option value="resolved">Resuelto</option>
                    <option value="accepted">Aceptado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">
                  Recomendación
                </label>

                <textarea
                  rows={3}
                  value={editFindingForm.recommendation}
                  onChange={(e) =>
                    setEditFindingForm({
                      ...editFindingForm,
                      recommendation: e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-between">

                <button
                  type="button"
                  onClick={() =>
                    setEditFindingForm({
                      ...editFindingForm,
                      status: 'resolved',
                    })
                  }
                  className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-5 py-3 text-sm font-bold text-emerald-300"
                >
                  Marcar como resuelto
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedFinding(null)}
                    className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-slate-300 hover:bg-white/5"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={savingFinding}
                    className="rounded-xl bg-[#c9a227] px-5 py-3 text-sm font-black text-[#07111f] disabled:opacity-50"
                  >
                    {savingFinding
                      ? 'Guardando...'
                      : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNewFinding && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1928] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
                  Gestión de hallazgos
                </p>

                <h2 className="mt-1 text-xl font-black text-white">
                  Nuevo hallazgo
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowNewFinding(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFinding} className="space-y-5 p-6">
              {findingFormError && (
                <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
                  {findingFormError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-300">
                  Auditoría
                </label>

                <select
                  value={findingForm.auditId}
                  onChange={(e) =>
                    setFindingForm({
                      ...findingForm,
                      auditId: e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                  required
                >
                  <option value="">Seleccionar auditoría</option>

                  {audits.map((audit) => (
                    <option key={audit.id} value={audit.id}>
                      {audit.auditCode} · {audit.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">
                  Título
                </label>

                <input
                  value={findingForm.title}
                  onChange={(e) =>
                    setFindingForm({
                      ...findingForm,
                      title: e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                  placeholder="Ej. Cuentas administrativas sin MFA"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">
                  Descripción
                </label>

                <textarea
                  rows={3}
                  value={findingForm.description}
                  onChange={(e) =>
                    setFindingForm({
                      ...findingForm,
                      description: e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-300">
                    Categoría
                  </label>

                  <input
                    value={findingForm.category}
                    onChange={(e) =>
                      setFindingForm({
                        ...findingForm,
                        category: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">
                    Score
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={findingForm.score}
                    onChange={(e) =>
                      setFindingForm({
                        ...findingForm,
                        score: Number(e.target.value),
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-300">
                    Riesgo
                  </label>

                  <select
                    value={findingForm.riskLevel}
                    onChange={(e) =>
                      setFindingForm({
                        ...findingForm,
                        riskLevel: e.target.value as
                          | 'low'
                          | 'medium'
                          | 'high'
                          | 'critical',
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                  >
                    <option value="low">Bajo</option>
                    <option value="medium">Medio</option>
                    <option value="high">Alto</option>
                    <option value="critical">Crítico</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">
                    Estado
                  </label>

                  <select
                    value={findingForm.status}
                    onChange={(e) =>
                      setFindingForm({
                        ...findingForm,
                        status: e.target.value as
                          | 'open'
                          | 'investigating'
                          | 'resolved'
                          | 'accepted',
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                  >
                    <option value="open">Abierto</option>
                    <option value="investigating">Investigando</option>
                    <option value="resolved">Resuelto</option>
                    <option value="accepted">Aceptado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">
                  Recomendación
                </label>

                <textarea
                  rows={3}
                  value={findingForm.recommendation}
                  onChange={(e) =>
                    setFindingForm({
                      ...findingForm,
                      recommendation: e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowNewFinding(false)}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-slate-300 hover:bg-white/5"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={creatingFinding}
                  className="rounded-xl bg-[#c9a227] px-5 py-3 text-sm font-black text-[#07111f] disabled:opacity-50"
                >
                  {creatingFinding ? 'Creando...' : 'Crear hallazgo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNewAudit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1928] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
                  Gestión de auditoría
                </p>
                <h2 className="mt-1 text-xl font-black text-white">
                  Nueva auditoría
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowNewAudit(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAudit} className="space-y-5 p-6">
              {auditFormError && (
                <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
                  {auditFormError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-300">
                  Organización
                </label>
                <select
                  value={form.organizationId}
                  onChange={(e) =>
                    setForm({ ...form, organizationId: e.target.value })
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                  required
                >
                  <option value="">Seleccionar organización</option>
                  {organizations.map((organization) => (
                    <option key={organization.id} value={organization.id}>
                      {organization.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">
                  Nombre de la auditoría
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="Ej. Auditoría de Seguridad de la Información"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#c9a227]"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-300">
                    Tipo
                  </label>
                  <input
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value })
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">
                    Estado
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as
                          | 'draft'
                          | 'in_progress'
                          | 'completed',
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                  >
                    <option value="draft">Borrador</option>
                    <option value="in_progress">En progreso</option>
                    <option value="completed">Completada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">
                  Nivel de riesgo
                </label>
                <select
                  value={form.riskLevel}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      riskLevel: e.target.value as
                        | 'low'
                        | 'medium'
                        | 'high'
                        | 'critical',
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                >
                  <option value="low">Bajo</option>
                  <option value="medium">Medio</option>
                  <option value="high">Alto</option>
                  <option value="critical">Crítico</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">
                  Alcance
                </label>
                <textarea
                  value={form.scope}
                  onChange={(e) =>
                    setForm({ ...form, scope: e.target.value })
                  }
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#c9a227]"
                  placeholder="Defina el alcance de la auditoría..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">
                  Objetivos
                </label>
                <textarea
                  value={form.objectives}
                  onChange={(e) =>
                    setForm({ ...form, objectives: e.target.value })
                  }
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#c9a227]"
                  placeholder="Defina los objetivos..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">
                  Metodología
                </label>
                <textarea
                  value={form.methodology}
                  onChange={(e) =>
                    setForm({ ...form, methodology: e.target.value })
                  }
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#c9a227]"
                  placeholder="Defina la metodología..."
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowNewAudit(false)}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-slate-300 hover:bg-white/5"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={creatingAudit}
                  className="rounded-xl bg-[#c9a227] px-5 py-3 text-sm font-black text-[#07111f] transition hover:bg-[#d8b43c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creatingAudit ? 'Creando...' : 'Crear auditoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}

function ReportMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#07111f] p-5">
      <div className="text-2xl font-black text-white">
        {value}
      </div>

      <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </div>
    </div>
  );
}

function ReportTextSection({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#07111f] p-6">
      <h3 className="font-bold text-white">
        {title}
      </h3>

      <p className="mt-3 whitespace-pre-wrap text-xs leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}

function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  positive,
  danger,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof ClipboardCheck;
  trend: string;
  positive?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-[#0b1928] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/15">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
          <Icon
            className={[
              'h-5 w-5',
              danger
                ? 'text-red-400'
                : positive
                  ? 'text-emerald-400'
                  : 'text-[#c9a227]',
            ].join(' ')}
          />
        </div>

        <span
          className={[
            'rounded-full px-2 py-1 text-[9px] font-bold',
            danger
              ? 'bg-red-400/10 text-red-300'
              : positive
                ? 'bg-emerald-400/10 text-emerald-300'
                : 'bg-white/5 text-slate-400',
          ].join(' ')}
        >
          {trend}
        </span>
      </div>

      <div className="mt-5">
        <div className="text-3xl font-black tracking-tight text-white">
          {value}
        </div>

        <div className="mt-1 text-sm font-semibold text-slate-300">
          {title}
        </div>

        <div className="mt-1 text-[10px] text-slate-600">
          {description}
        </div>
      </div>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    critical: 'border-red-400/20 bg-red-400/10 text-red-300',
    high: 'border-orange-400/20 bg-orange-400/10 text-orange-300',
    medium: 'border-[#c9a227]/20 bg-[#c9a227]/10 text-[#d8b43c]',
    low: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  };

  return (
    <span
      className={`rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${styles[level]}`}
    >
      {formatRiskLevel(level)}
    </span>
  );
}

function RiskBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300">
          {label}
        </span>

        <span className="text-xs font-bold text-slate-500">
          {count} · {percentage}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default App;
