const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { dbGet, dbAll } = require('../db');

const generatePdfReport = async (req, res) => {
  const { scanId } = req.params;

  try {
    const scan = await dbGet(`
      SELECT scans.*, repositories.name as repo_name, repositories.url as repo_url 
      FROM scans 
      JOIN repositories ON scans.repository_id = repositories.id
      WHERE scans.id = ?
    `, [scanId]);

    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    const issues = await dbAll('SELECT * FROM issues WHERE scan_id = ?', [scanId]);

    // Create a PDF Document
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers to trigger download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=BugHunter_AI_Report_${scan.repo_name}_${scanId.slice(0, 8)}.pdf`);
    
    doc.pipe(res);

    // Styling configuration
    const primaryColor = '#10b981'; // Green
    const darkBg = '#0f172a'; // Dark blue-gray
    const textColor = '#1e293b'; // Slate gray
    const lightBg = '#f8fafc'; // Off white

    // --- PAGE 1: TITLE PAGE ---
    // Background card design style
    doc.rect(0, 0, 595.28, 841.89).fill(darkBg);
    
    doc.fillColor('#ffffff').fontSize(32).font('Helvetica-Bold').text('BUGHUNTER AI', 60, 200);
    doc.fontSize(16).fillColor('#94a3b8').text('AI-Powered Vulnerability & Code Quality Report', 60, 245);
    
    doc.rect(60, 280, 80, 4).fill(primaryColor);

    // Repository Details Box
    doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold').text('REPOSITORY ANALYSIS DETAILS', 60, 340);
    doc.font('Helvetica').fontSize(11).fillColor('#cbd5e1');
    doc.text(`Repository Name: ${scan.repo_name}`, 60, 370);
    doc.text(`Repository URL: ${scan.repo_url}`, 60, 390);
    doc.text(`Branch: ${scan.branch || 'main'}`, 60, 410);
    doc.text(`Scan Date: ${new Date(scan.created_at).toLocaleString()}`, 60, 430);
    doc.text(`Scan ID: ${scan.id}`, 60, 450);

    // Overall Grade Indicator
    doc.rect(60, 500, 470, 150).fill('#1e293b');
    doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold').text('PLATFORM RATING & HEALTH GRADE', 80, 520);
    
    doc.fillColor(primaryColor).fontSize(64).font('Helvetica-Bold').text(scan.overall_grade || 'A', 80, 550);
    
    doc.fillColor('#94a3b8').fontSize(11).font('Helvetica');
    doc.text(`Security Score: ${scan.security_score || 100}%`, 220, 560);
    doc.text(`Code Quality Score: ${scan.quality_score || 100}%`, 220, 580);
    doc.text(`Performance Score: ${scan.performance_score || 100}%`, 220, 600);
    doc.text(`Total Issues Flagged: ${issues.length}`, 220, 620);

    doc.addPage();

    // Reset layout for inner pages
    doc.fillColor(textColor);

    // --- PAGE 2: EXECUTIVE SUMMARY ---
    doc.fontSize(22).font('Helvetica-Bold').fillColor(darkBg).text('Executive Summary', 50, 50);
    doc.rect(50, 80, 495, 1).fill('#e2e8f0');

    doc.fontSize(11).font('Helvetica').fillColor('#334155').text(
      `BugHunter AI completed a comprehensive multi-agent code analysis scan of the repository. Five unique intelligence nodes (Hunter, Security, Performance, Skeptic, and Judge Agents) processed files to audit logic flaws, security vulnerabilities, OWASP patterns, and resource bottlenecks.`,
      50,
      100,
      { width: 495, align: 'justify', lineGap: 4 }
    );

    // Issue Statistics Table
    doc.fontSize(14).font('Helvetica-Bold').fillColor(darkBg).text('Vulnerability Breakdowns By Severity', 50, 190);
    
    // Severity metrics count
    const criticalCount = issues.filter(i => i.severity === 'Critical').length;
    const highCount = issues.filter(i => i.severity === 'High').length;
    const mediumCount = issues.filter(i => i.severity === 'Medium').length;
    const lowCount = issues.filter(i => i.severity === 'Low').length;

    const tableTop = 220;
    doc.rect(50, tableTop, 495, 25).fill(darkBg);
    doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold');
    doc.text('Severity Level', 70, tableTop + 8);
    doc.text('Count', 280, tableTop + 8);
    doc.text('Risk Profile', 400, tableTop + 8);

    let rowY = tableTop + 25;
    const drawRow = (label, val, risk, color) => {
      doc.rect(50, rowY, 495, 25).fill(lightBg);
      doc.fillColor(color).font('Helvetica-Bold').fontSize(10).text(label, 70, rowY + 8);
      doc.fillColor(textColor).font('Helvetica').text(val.toString(), 280, rowY + 8);
      doc.fillColor('#64748b').text(risk, 400, rowY + 8);
      doc.rect(50, rowY + 24, 495, 1).fill('#e2e8f0');
      rowY += 25;
    };

    drawRow('Critical', criticalCount, 'Immediate exploitation threat', '#ef4444');
    drawRow('High', highCount, 'High breach likelihood', '#f97316');
    drawRow('Medium', mediumCount, 'Degrades application hygiene', '#eab308');
    drawRow('Low', lowCount, 'Minor smell or low severity issue', '#3b82f6');

    // Recommendations Box
    doc.rect(50, 360, 495, 120).fill('#eff6ff');
    doc.fillColor('#1e3a8a').fontSize(12).font('Helvetica-Bold').text('Recommendations', 70, 380);
    doc.fillColor('#1e40af').fontSize(10).font('Helvetica');
    
    let recText = 'Review code patches and apply security parameterized queries where Dynamic SQL is flagged. Ensure plaintext credentials are immediately migrated out of version control and into environment secrets.';
    if (criticalCount > 0) {
      recText = `CRITICAL ACTION REQUIRED: ${criticalCount} Critical vulnerabilities must be patched immediately. Attack paths are actively present in database execution blocks or exposed cloud secrets.`;
    }
    doc.text(recText, 70, 405, { width: 450, lineGap: 3 });

    doc.addPage();

    // --- PAGE 3+: ISSUE DETAIL PANEL ---
    doc.fontSize(18).font('Helvetica-Bold').fillColor(darkBg).text('Detailed Findings Log', 50, 50);
    doc.rect(50, 75, 495, 1).fill('#e2e8f0');

    let currentY = 95;

    issues.forEach((issue, index) => {
      // Check space availability to prevent split headers
      if (currentY > 650) {
        doc.addPage();
        currentY = 50;
      }

      // Title Card
      doc.rect(50, currentY, 495, 30).fill(issue.severity === 'Critical' || issue.severity === 'High' ? '#fee2e2' : '#f1f5f9');
      
      const titleColor = issue.severity === 'Critical' || issue.severity === 'High' ? '#991b1b' : '#334155';
      doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(11).text(
        `#${index + 1}: ${issue.title} [${issue.severity} Severity]`,
        65,
        currentY + 10
      );

      currentY += 40;

      // File Details
      doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(9).text('LOCATION:', 50, currentY);
      doc.fillColor(textColor).font('Helvetica').text(`${issue.file_path} : Line ${issue.line_number}`, 120, currentY);
      currentY += 15;

      // Description
      doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(9).text('DESCRIPTION:', 50, currentY);
      doc.fillColor(textColor).font('Helvetica').text(issue.description, 120, currentY, { width: 425, lineGap: 2 });
      
      // Calculate wrapped height dynamically
      const descHeight = doc.heightOfString(issue.description, { width: 425 });
      currentY += descHeight + 10;

      // Explanation / Remedy
      if (issue.explanation) {
        doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(9).text('EXPLANATION:', 50, currentY);
        doc.fillColor(textColor).font('Helvetica').text(issue.explanation, 120, currentY, { width: 425, lineGap: 2 });
        const expHeight = doc.heightOfString(issue.explanation, { width: 425 });
        currentY += expHeight + 10;
      }

      // Divider between issues
      doc.rect(50, currentY, 495, 1).fill('#f1f5f9');
      currentY += 15;
    });

    // Finalize report
    doc.end();

  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'Internal server error generating PDF' });
  }
};

module.exports = {
  generatePdfReport
};
