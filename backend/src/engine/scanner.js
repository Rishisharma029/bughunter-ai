const fs = require('fs');
const path = require('path');
const { analyzeCode } = require('./multiAgent');
const { scanDependencies, getSimulationForIssue } = require('./cveIntel');
const { scanDockerfile, scanTerraform, scanKubernetesOrWorkflows, scanPackageJson } = require('./eliteScanners');
const { v4: uuidv4 } = require('uuid');

const SUPPORTED_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.py', '.go', '.java', '.c', '.cpp', '.cs', '.tf', '.yaml', '.yml'];
const IGNORED_DIRECTORIES = ['node_modules', '.git', 'dist', 'build', '.next', 'bin', 'obj', '.idea', 'venv'];

const crawlDirectory = (dir, fileList = []) => {
  let files;
  try {
    files = fs.readdirSync(dir);
  } catch (err) {
    return fileList; // Access denied or invalid path
  }

  files.forEach(file => {
    const filePath = path.join(dir, file);
    let stat;
    try {
      stat = fs.statSync(filePath);
    } catch (err) {
      return; // Skip broken symlinks or locked files
    }

    if (stat.isDirectory()) {
      if (!IGNORED_DIRECTORIES.includes(file)) {
        crawlDirectory(filePath, fileList);
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (SUPPORTED_EXTENSIONS.includes(ext) || file === 'package.json' || file === 'requirements.txt' || file.toLowerCase() === 'dockerfile') {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
};

const runScanner = async (targetPath) => {
  const filePaths = crawlDirectory(targetPath);
  let allIssues = [];
  let totalFilesScanned = 0;
  
  // Aggregate scores across files
  let totalSecurity = 0;
  let totalQuality = 0;
  let totalPerformance = 0;
  let totalArchitecture = 0;
  let totalCompliance = 0;
  let fileCountForScore = 0;

  for (const filePath of filePaths) {
    if (totalFilesScanned >= 50) break;

    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      totalFilesScanned++;

      const relativePath = path.relative(targetPath, filePath).replace(/\\/g, '/');
      const ext = path.extname(filePath).toLowerCase();
      const fileName = path.basename(filePath);

      let fileIssues = [];

      // Check CVE dependencies
      if (fileName === 'package.json' || fileName === 'requirements.txt') {
        const cveIssues = scanDependencies(fileContent, filePath);
        cveIssues.forEach(cve => {
          fileIssues.push({
            id: uuidv4(),
            file_path: relativePath,
            line_number: 1,
            type: 'security',
            severity: cve.severity,
            confidence: 90,
            title: `Known CVE in Dependency: ${cve.dependency} (${cve.cveId})`,
            description: cve.description,
            explanation: `Vulnerability identified in dependencies. ${cve.recommendation}`,
            impact: `Vulnerable dependency: ${cve.dependency} @ ${cve.version}. CVSS rating estimated at 7.5.`,
            fix_suggestion: cve.recommendation,
            improved_code: `"dependencies": {\n  "${cve.dependency}": "^${cve.recommendation.match(/[\d.]+/)?.[0] || 'latest'}"\n}`,
            cwe_id: 'CWE-1104',
            cvss_score: 7.5,
            agent_verdict: 'Security Agent flagged known CVE in project manifest.'
          });
        });

        // Run typosquatting and dependency confusion scanner for package.json
        if (fileName === 'package.json') {
          const supplyChainIssues = scanPackageJson(fileContent, relativePath);
          fileIssues.push(...supplyChainIssues);
        }
      } 
      // Cloud - Dockerfile scanning
      else if (fileName.toLowerCase() === 'dockerfile') {
        const dockerIssues = scanDockerfile(fileContent, relativePath);
        fileIssues.push(...dockerIssues);
      }
      // Cloud - Terraform scanning
      else if (ext === '.tf') {
        const tfIssues = scanTerraform(fileContent, relativePath);
        fileIssues.push(...tfIssues);
      }
      // Cloud/Pipeline - YAML configuration checking (K8s and GitHub workflows)
      else if (ext === '.yaml' || ext === '.yml') {
        const yamlIssues = scanKubernetesOrWorkflows(fileContent, relativePath);
        fileIssues.push(...yamlIssues);
      }
      // Standard application source code files
      else {
        const analysis = analyzeCode(fileContent, filePath);
        const codeIssues = analysis.issues.map(issue => {
          const sim = getSimulationForIssue(issue.title, issue.description);
          return {
            id: uuidv4(),
            file_path: relativePath,
            line_number: issue.line_number,
            type: issue.type,
            severity: issue.severity,
            confidence: issue.confidence,
            title: issue.title,
            description: issue.description,
            explanation: issue.explanation,
            impact: issue.impact,
            fix_suggestion: issue.fix_suggestion,
            improved_code: issue.improved_code,
            cwe_id: issue.cwe_id,
            cvss_score: issue.cvss_score,
            attack_simulation: sim,
            agent_verdict: issue.agent_verdict
          };
        });
        
        fileIssues.push(...codeIssues);

        // Accumulate scores from standard source code files
        totalSecurity += analysis.scores.security;
        totalQuality += analysis.scores.quality;
        totalPerformance += analysis.scores.performance;
        totalArchitecture += analysis.scores.architecture;
        totalCompliance += analysis.scores.compliance;
        fileCountForScore++;
        
        allIssues.push(...codeIssues);
        continue;
      }

      // For config / supply chain files, calculate score deductions manually
      let fSec = 100, fQual = 100, fPerf = 100, fArch = 100, fComp = 100;
      fileIssues.forEach(f => {
        let penalty = f.severity === 'Critical' ? 20 : f.severity === 'High' ? 12 : f.severity === 'Medium' ? 6 : 2;
        if (f.type === 'security') fSec -= penalty;
        else if (f.type === 'performance') fPerf -= penalty;
        else if (f.type === 'architecture') fArch -= penalty;
        else if (f.type === 'compliance') fComp -= penalty;
        else fQual -= penalty;
      });

      totalSecurity += Math.max(30, fSec);
      totalQuality += Math.max(30, fQual);
      totalPerformance += Math.max(30, fPerf);
      totalArchitecture += Math.max(30, fArch);
      totalCompliance += Math.max(30, fComp);
      fileCountForScore++;

      // Map simulations for these configuration security events
      const finalConfigIssues = fileIssues.map(issue => {
        const sim = getSimulationForIssue(issue.title, issue.description);
        return {
          ...issue,
          attack_simulation: sim
        };
      });

      allIssues.push(...finalConfigIssues);

    } catch (e) {
      console.error(`Error scanning file ${filePath}:`, e);
    }
  }

  // Calculate final aggregated scores
  let finalSec = 100;
  let finalQual = 100;
  let finalPerf = 100;
  let finalArch = 100;
  let finalComp = 100;

  if (fileCountForScore > 0) {
    finalSec = Math.round(totalSecurity / fileCountForScore);
    finalQual = Math.round(totalQuality / fileCountForScore);
    finalPerf = Math.round(totalPerformance / fileCountForScore);
    finalArch = Math.round(totalArchitecture / fileCountForScore);
    finalComp = Math.round(totalCompliance / fileCountForScore);
  }

  finalSec = Math.max(30, Math.min(100, finalSec));
  finalQual = Math.max(30, Math.min(100, finalQual));
  finalPerf = Math.max(30, Math.min(100, finalPerf));
  finalArch = Math.max(30, Math.min(100, finalArch));
  finalComp = Math.max(30, Math.min(100, finalComp));

  const averageScore = (finalSec + finalQual + finalPerf + finalArch + finalComp) / 5;
  let overallGrade = 'A';
  if (averageScore >= 95) overallGrade = 'A+';
  else if (averageScore >= 88) overallGrade = 'A';
  else if (averageScore >= 80) overallGrade = 'B+';
  else if (averageScore >= 70) overallGrade = 'B';
  else if (averageScore >= 60) overallGrade = 'C';
  else overallGrade = 'D';

  return {
    issues: allIssues,
    security_score: finalSec,
    quality_score: finalQual,
    performance_score: finalPerf,
    architecture_score: finalArch,
    compliance_score: finalComp,
    overall_grade: overallGrade,
    total_files: totalFilesScanned
  };
};

module.exports = {
  runScanner
};
