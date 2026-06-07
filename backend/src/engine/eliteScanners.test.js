const test = require('node:test');
const assert = require('node:assert');
const { scanDockerfile, scanTerraform, scanPackageJson } = require('./eliteScanners');

test('Elite Scanners: Dockerfile audits', () => {
  const dockerContent = `
    FROM node:latest
    ENV DB_PASSWORD=my_database_plain_pass_123
    USER root
    COPY . .
  `;

  const issues = scanDockerfile(dockerContent, 'Dockerfile');

  // Should detect unpinned tag, exposed secret, and root user instruction
  const unpinned = issues.find(i => i.title.includes('Not Pinned'));
  const secret = issues.find(i => i.title.includes('Hardcoded Secret'));
  const rootUser = issues.find(i => i.title.includes('Root User'));

  assert.ok(unpinned, 'Should flag unpinned tag');
  assert.ok(secret, 'Should flag exposed secret');
  assert.ok(rootUser, 'Should flag explicit root user');
  assert.strictEqual(secret.severity, 'Critical', 'Plaintext credentials should be Critical');
});

test('Elite Scanners: Terraform open ports', () => {
  const tfContent = `
    resource "aws_security_group" "open" {
      ingress {
        from_port   = 22
        to_port     = 22
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
      }
    }
  `;

  const issues = scanTerraform(tfContent, 'main.tf');
  const openIngress = issues.find(i => i.title.includes('Open Ingress'));

  assert.ok(openIngress, 'Should flag open ingress network security groups');
  assert.strictEqual(openIngress.severity, 'High', 'Open ingress should have High severity');
});

test('Elite Scanners: package.json typosquatting and confusion', () => {
  const packageContent = JSON.stringify({
    dependencies: {
      "ldash": "^4.17.20", // typosquatting lodash
      "acme-internal-utils": "^1.0.0" // dependency confusion risk
    }
  });

  const issues = scanPackageJson(packageContent, 'package.json');
  const typosquat = issues.find(i => i.title.includes('Typosquatting'));
  const confusion = issues.find(i => i.title.includes('Dependency Confusion'));

  assert.ok(typosquat, 'Should flag typosquatting packages');
  assert.ok(confusion, 'Should flag dependency confusion risks');
  assert.strictEqual(typosquat.severity, 'Critical', 'Typosquatting must be Critical');
});
