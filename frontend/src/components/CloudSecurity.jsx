import React, { useState } from 'react';
import { Cloud, ShieldAlert, Cpu, CheckCircle, Database, HelpCircle, Server } from 'lucide-react';

export default function CloudSecurity({ backendUrl }) {
  const [activeCloud, setActiveCloud] = useState('aws');

  const mockAudits = {
    aws: [
      { id: '1', title: 'Open Ingress Network Security Group (0.0.0.0/0)', severity: 'High', resource: 'aws_security_group.web_sg', status: 'Failed', desc: 'Allows ports 22 and 3306 public inbound access.' },
      { id: '2', title: 'Unencrypted S3 Bucket Storage', severity: 'Medium', resource: 'aws_s3_bucket.user_avatars', status: 'Failed', desc: 'S3 bucket is created without KMS server-side encryption.' },
      { id: '3', title: 'MFA Not Enforced for IAM Administative Users', severity: 'High', resource: 'IAM System', status: 'Failed', desc: 'Root and administrative logins bypass Multi-Factor Authentication.' },
      { id: '4', title: 'EC2 Instance Metadata IMDSv2 Enforced', severity: 'Low', resource: 'aws_instance.app_vm', status: 'Passed', desc: 'Metadata token enforcement is configured.' }
    ],
    azure: [
      { id: '1', title: 'Azure Key Vault Public Endpoint Open', severity: 'Critical', resource: 'azurerm_key_vault.keys', status: 'Failed', desc: 'Secrets vault allows network connections from all IP ranges.' },
      { id: '2', title: 'Blob Container Public Access Level Enabled', severity: 'Medium', resource: 'azurerm_storage_container.images', status: 'Failed', desc: 'Container permits unauthenticated anonymous read access.' },
      { id: '3', title: 'App Service TLS Version Enforced to 1.2', severity: 'Low', resource: 'azurerm_app_service.api', status: 'Passed', desc: 'Default TLS is set to version 1.2.' }
    ],
    gcp: [
      { id: '1', title: 'Compute Engine External IP Configured', severity: 'Medium', resource: 'google_compute_instance.database', status: 'Failed', desc: 'Private SQL database instance is exposed via public IP address.' },
      { id: '2', title: 'Legacy VPC Network Enabled', severity: 'Low', resource: 'google_compute_network.default', status: 'Failed', desc: 'The default network uses dynamic legacy routes instead of custom subnets.' },
      { id: '3', title: 'Cloud Storage Bucket IAM Public Access Blocked', severity: 'Low', resource: 'google_storage_bucket.reports', status: 'Passed', desc: 'Public IAM queries are disabled.' }
    ],
    containers: [
      { id: '1', title: 'Container Running explicitly as Root User', severity: 'High', resource: 'Dockerfile (USER root)', status: 'Failed', desc: 'Allows potential container breakout exploits to control host.' },
      { id: '2', title: 'Kubernetes Privileged Container Execution', severity: 'Critical', resource: 'K8s Pod Spec (privileged: true)', status: 'Failed', desc: 'Pod bypasses standard isolation boundaries.' },
      { id: '3', title: 'Missing Container Resource Request/Limits', severity: 'Medium', resource: 'K8s Deployment (limits)', status: 'Failed', desc: 'Pod is created without memory and CPU limits.' }
    ]
  };

  const currentAudits = mockAudits[activeCloud] || [];
  const failedCount = currentAudits.filter(a => a.status === 'Failed').length;
  const passedCount = currentAudits.filter(a => a.status === 'Passed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '1.8rem', margin: 0 }}>
          Cloud Security Configuration (CSPM)
        </h2>
        <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
          Evaluate Terraform scripts, Docker configurations, Kubernetes specifications, and simulate cloud environment configurations checks.
        </p>
      </div>

      {/* Cloud Provider Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button 
          onClick={() => setActiveCloud('aws')}
          style={{
            padding: '8px 16px', borderRadius: '4px', border: '1px solid var(--border-color)',
            background: activeCloud === 'aws' ? 'var(--primary-glow)' : 'transparent',
            color: activeCloud === 'aws' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem'
          }}
        >
          Amazon Web Services (AWS)
        </button>
        <button 
          onClick={() => setActiveCloud('azure')}
          style={{
            padding: '8px 16px', borderRadius: '4px', border: '1px solid var(--border-color)',
            background: activeCloud === 'azure' ? 'var(--primary-glow)' : 'transparent',
            color: activeCloud === 'azure' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem'
          }}
        >
          Microsoft Azure
        </button>
        <button 
          onClick={() => setActiveCloud('gcp')}
          style={{
            padding: '8px 16px', borderRadius: '4px', border: '1px solid var(--border-color)',
            background: activeCloud === 'gcp' ? 'var(--primary-glow)' : 'transparent',
            color: activeCloud === 'gcp' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem'
          }}
        >
          Google Cloud Platform (GCP)
        </button>
        <button 
          onClick={() => setActiveCloud('containers')}
          style={{
            padding: '8px 16px', borderRadius: '4px', border: '1px solid var(--border-color)',
            background: activeCloud === 'containers' ? 'var(--primary-glow)' : 'transparent',
            color: activeCloud === 'containers' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem'
          }}
        >
          Docker & Kubernetes
        </button>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card glass-panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Posture Rating</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '8px' }}>
            {activeCloud === 'aws' ? 'B' : activeCloud === 'azure' ? 'C' : activeCloud === 'gcp' ? 'B+' : 'C-'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Cloud compliance score</div>
        </div>

        <div className="card glass-panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Active Checks</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>
            {currentAudits.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Scanned configuration objects</div>
        </div>

        <div className="card glass-panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Failed Controls</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: failedCount > 0 ? '#ef4444' : 'var(--text-main)', marginTop: '8px' }}>
            {failedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Security remediations required</div>
        </div>

        <div className="card glass-panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Passed Controls</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '8px' }}>
            {passedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Successful policy validations</div>
        </div>
      </div>

      {/* Audit List Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Server size={18} color="var(--primary)" /> Misconfiguration Audit List
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {currentAudits.map((audit) => (
            <div key={audit.id} style={{ 
              border: '1px solid var(--border-color)', 
              borderRadius: '8px', 
              padding: '16px', 
              background: audit.status === 'Failed' ? 'rgba(239, 68, 68, 0.01)' : 'rgba(16, 185, 129, 0.01)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '20px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    fontWeight: 700, 
                    background: audit.severity === 'Critical' ? '#ef4444' : audit.severity === 'High' ? '#f59e0b' : '#3b82f6', 
                    color: '#fff' 
                  }}>
                    {audit.severity}
                  </span>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{audit.title}</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Resource: <span style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{audit.resource}</span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {audit.desc}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  padding: '4px 10px', 
                  borderRadius: '12px', 
                  fontWeight: 700, 
                  background: audit.status === 'Failed' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', 
                  color: audit.status === 'Failed' ? '#ef4444' : 'var(--primary)' 
                }}>
                  {audit.status}
                </span>
                {audit.status === 'Failed' && (
                  <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => alert(`Creating ticket for: ${audit.title}`)}>
                    Auto-Remediate
                  </button>
                )}
              </div>
            </div>
          ))}

          {currentAudits.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No audits registered.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
