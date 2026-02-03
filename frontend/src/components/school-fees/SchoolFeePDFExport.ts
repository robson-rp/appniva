import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SchoolFee, EDUCATION_LEVELS, FEE_TYPES, TERMS } from '@/hooks/useSchoolFees';
import { formatCurrency, formatDate } from '@/lib/constants';

export function generateSchoolFeesPDF(
  fees: SchoolFee[], 
  studentName?: string,
  title: string = 'Comprovativo de Propinas'
) {
  const doc = new jsPDF();
  const filteredFees = studentName ? fees.filter(f => f.student_name === studentName) : fees;
  
  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${formatDate(new Date().toISOString())}`, 14, 30);
  
  if (studentName) {
    doc.text(`Estudante: ${studentName}`, 14, 36);
  }

  // Summary
  const totalAmount = filteredFees.reduce((sum, f) => sum + f.amount, 0);
  const paidAmount = filteredFees.filter(f => f.paid).reduce((sum, f) => sum + f.amount, 0);
  const pendingAmount = filteredFees.filter(f => !f.paid).reduce((sum, f) => sum + f.amount, 0);

  const summaryY = studentName ? 44 : 38;
  doc.setFontSize(11);
  doc.text(`Total: ${formatCurrency(totalAmount, 'AOA')}`, 14, summaryY);
  doc.text(`Pago: ${formatCurrency(paidAmount, 'AOA')}`, 80, summaryY);
  doc.text(`Pendente: ${formatCurrency(pendingAmount, 'AOA')}`, 140, summaryY);

  // Table
  const tableData = filteredFees.map(fee => [
    fee.student_name,
    fee.school_name,
    EDUCATION_LEVELS.find(l => l.value === fee.education_level)?.label || fee.education_level,
    FEE_TYPES.find(t => t.value === fee.fee_type)?.label || fee.fee_type,
    `${fee.academic_year} - ${TERMS.find(t => t.value === fee.term)?.label || fee.term || 'N/A'}`,
    formatCurrency(fee.amount, fee.currency),
    formatDate(fee.due_date),
    fee.paid ? `Sim (${fee.paid_date ? formatDate(fee.paid_date) : ''})` : 'Não',
  ]);

  autoTable(doc, {
    startY: summaryY + 8,
    head: [['Estudante', 'Escola', 'Nível', 'Tipo', 'Período', 'Valor', 'Vencimento', 'Pago']],
    body: tableData,
    theme: 'striped',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`propinas${studentName ? `-${studentName.replace(/\s+/g, '-')}` : ''}.pdf`);
}

export function generatePaymentReceipt(fee: SchoolFee) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('RECIBO DE PAGAMENTO', 105, 30, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Propina Escolar', 105, 40, { align: 'center' });

  // Receipt number and date
  doc.setFontSize(10);
  doc.text(`Nº: ${fee.id.slice(0, 8).toUpperCase()}`, 14, 55);
  doc.text(`Data: ${formatDate(fee.paid_date || new Date().toISOString())}`, 150, 55);

  // Student info box
  doc.setDrawColor(200, 200, 200);
  doc.rect(14, 65, 182, 45);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados do Estudante', 20, 75);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${fee.student_name}`, 20, 85);
  doc.text(`Escola: ${fee.school_name}`, 20, 93);
  doc.text(`Nível: ${EDUCATION_LEVELS.find(l => l.value === fee.education_level)?.label}`, 20, 101);

  // Payment details box
  doc.rect(14, 120, 182, 50);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Detalhes do Pagamento', 20, 130);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Tipo: ${FEE_TYPES.find(t => t.value === fee.fee_type)?.label}`, 20, 140);
  doc.text(`Período: ${fee.academic_year} - ${TERMS.find(t => t.value === fee.term)?.label || 'N/A'}`, 20, 148);
  doc.text(`Data de Vencimento: ${formatDate(fee.due_date)}`, 20, 156);
  
  // Amount
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Valor Pago: ${formatCurrency(fee.amount, fee.currency)}`, 20, 164);

  // Status
  doc.setFillColor(34, 197, 94);
  doc.roundedRect(14, 180, 182, 20, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('PAGAMENTO CONFIRMADO', 105, 193, { align: 'center' });

  // Notes
  if (fee.notes) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Notas: ${fee.notes}`, 14, 215);
  }

  // Footer
  doc.setTextColor(128, 128, 128);
  doc.setFontSize(8);
  doc.text('Este documento serve como comprovativo de pagamento.', 105, 280, { align: 'center' });
  doc.text(`Gerado em: ${formatDate(new Date().toISOString())}`, 105, 286, { align: 'center' });

  doc.save(`recibo-${fee.student_name.replace(/\s+/g, '-')}-${fee.id.slice(0, 8)}.pdf`);
}
