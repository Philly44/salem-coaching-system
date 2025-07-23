# Compliance Documentation Appendix
**Salem University Coaching System**  
**Date:** July 23, 2025  
**Purpose:** Reference guide for FERPA, PII, and compliance documentation

---

## Table of Contents
1. [FERPA Regulations](#ferpa-regulations)
2. [Title IV Requirements](#title-iv-requirements)
3. [PII Protection Guidelines](#pii-protection-guidelines)
4. [Technical Standards](#technical-standards)
5. [State Privacy Laws](#state-privacy-laws)
6. [Implementation Checklists](#implementation-checklists)

---

## 1. FERPA Regulations

### Primary Source Documents

#### **34 CFR Part 99 - Family Educational Rights and Privacy Act**
- **URL:** https://www.ecfr.gov/current/title-34/subtitle-A/part-99
- **Key Sections for This System:**
  - §99.3 - Definitions (education records, PII)
  - §99.30 - Consent requirements
  - §99.31 - Disclosure without consent (legitimate educational interest)
  - §99.32 - Recordkeeping requirements
  - §99.33 - Redisclosure limitations
  - §99.35 - Notification requirements
  - §99.37 - Directory information

#### **FERPA General Guidance for Students**
- **URL:** https://www2.ed.gov/policy/gen/guid/fpco/ferpa/index.html
- **Relevant Topics:**
  - What constitutes an education record
  - When consent is required
  - Security requirements for electronic records

#### **PTAC FERPA Exceptions Summary**
- **URL:** https://studentprivacy.ed.gov/resources/ferpa-exceptions-summary
- **Use For:** Understanding when data can be shared without consent

### Implementation References

#### **Model Notification of Rights under FERPA**
- **URL:** https://www2.ed.gov/policy/gen/guid/fpco/ferpa/ps-officials.html
- **Purpose:** Template for required annual notification

#### **FERPA and Virtual Learning**
- **URL:** https://studentprivacy.ed.gov/resources/ferpa-and-virtual-learning
- **Relevance:** Guidelines for electronic educational records

---

## 2. Title IV Requirements

### Primary Regulations

#### **34 CFR Part 668 - Student Assistance General Provisions**
- **URL:** https://www.ecfr.gov/current/title-34/subtitle-B/chapter-VI/part-668
- **Key Sections:**
  - §668.14 - Program participation agreement
  - §668.16 - Standards of administrative capability
  - §668.25 - Contracts between institution and third-party servicer
  - §668.43 - Institutional information

#### **FSA Handbook - Institutional Eligibility**
- **URL:** https://fsapartners.ed.gov/knowledge-center/fsa-handbook
- **Relevant Chapters:**
  - Chapter 2: Institutional Eligibility
  - Chapter 8: Program Integrity

### Data Security Requirements

#### **Gramm-Leach-Bliley Act (GLBA) Safeguards Rule**
- **URL:** https://www.ftc.gov/business-guidance/resources/ftc-safeguards-rule-what-your-business-needs-know
- **Application:** Required for institutions handling federal student aid
- **Key Requirements:**
  - Risk assessment
  - Access controls
  - Encryption
  - Incident response plan

---

## 3. PII Protection Guidelines

### Federal Guidelines

#### **NIST SP 800-122: Guide to Protecting PII**
- **URL:** https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-122.pdf
- **Key Concepts:**
  - PII definition and identification
  - PII confidentiality impact levels
  - Safeguarding techniques
  - Incident response

#### **Privacy Technical Assistance Center (PTAC) Best Practices**
- **URL:** https://studentprivacy.ed.gov/resources/data-de-identification-overview-basic-terms-and-approaches
- **Topics:**
  - De-identification techniques
  - Disclosure avoidance
  - Statistical disclosure control

### Education-Specific PII Guidance

#### **PTAC Data Security Checklist**
- **URL:** https://studentprivacy.ed.gov/resources/data-security-checklist
- **Checklist Items:**
  - Access controls
  - Audit controls
  - Integrity controls
  - Transmission security

#### **IES Data Security Plan Template**
- **URL:** https://ies.ed.gov/ncee/projects/pdf/data_security_plan_template.pdf
- **Use:** Template for documenting security measures

---

## 4. Technical Standards

### Encryption Standards

#### **FIPS 140-2: Security Requirements for Cryptographic Modules**
- **URL:** https://csrc.nist.gov/publications/detail/fips/140/2/final
- **Requirements:**
  - AES-256 for data at rest
  - TLS 1.2+ for data in transit
  - Secure key management

#### **NIST SP 800-52: Guidelines for TLS Implementations**
- **URL:** https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-52r2.pdf
- **Application:** Secure communication channels

### Authentication Standards

#### **NIST SP 800-63B: Digital Identity Guidelines - Authentication**
- **URL:** https://pages.nist.gov/800-63-3/sp800-63b.html
- **Key Requirements:**
  - Multi-factor authentication
  - Session management
  - Authenticator requirements

#### **OWASP Authentication Cheat Sheet**
- **URL:** https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- **Topics:**
  - Password requirements
  - Session management
  - Account lockout

### Web Security Standards

#### **OWASP Top 10 Web Application Security Risks**
- **URL:** https://owasp.org/www-project-top-ten/
- **Critical for This System:**
  - A01: Broken Access Control
  - A02: Cryptographic Failures
  - A03: Injection
  - A07: Identification and Authentication Failures

#### **Content Security Policy (CSP) Guidelines**
- **URL:** https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- **Implementation:** Required security headers

---

## 5. State Privacy Laws

### State-Specific Student Privacy Laws

#### **California - SOPIPA (Student Online Personal Information Protection Act)**
- **URL:** https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=201320140SB1177
- **Requirements:**
  - Prohibits targeted advertising
  - Limits data use
  - Requires security measures

#### **New York - Education Law §2-d**
- **URL:** https://www.nysenate.gov/legislation/laws/EDN/2-D
- **Requirements:**
  - Parent access rights
  - Data security requirements
  - Breach notification

#### **Connecticut - Student Data Privacy Act**
- **URL:** https://www.cga.ct.gov/current/pub/chap_170.htm#sec_10-234aa
- **Requirements:**
  - Written agreements
  - Security requirements
  - Transparency obligations

---

## 6. Implementation Checklists

### FERPA Compliance Checklist

Based on **34 CFR Part 99**, verify:

- [ ] **§99.3** - Education records properly defined
- [ ] **§99.30** - Consent mechanisms implemented
- [ ] **§99.31(a)(1)** - Legitimate educational interest defined
- [ ] **§99.32** - Disclosure logs maintained
- [ ] **§99.33** - Redisclosure restrictions enforced
- [ ] **§99.35** - Annual notification provided
- [ ] **§99.37** - Directory information policy established
- [ ] **§99.64** - Record retention policy implemented

### PII Protection Checklist

Based on **NIST SP 800-122**, implement:

- [ ] PII inventory completed
- [ ] Impact levels assessed
- [ ] Access controls implemented
- [ ] Encryption at rest and in transit
- [ ] Audit logging enabled
- [ ] Incident response plan created
- [ ] Data minimization practiced
- [ ] Retention limits enforced

### Security Controls Checklist

Based on **NIST SP 800-53**, implement:

- [ ] **AC-2**: Account Management
- [ ] **AC-3**: Access Enforcement
- [ ] **AC-7**: Unsuccessful Login Attempts
- [ ] **AU-2**: Audit Events
- [ ] **IA-2**: Identification and Authentication
- [ ] **SC-8**: Transmission Confidentiality
- [ ] **SC-13**: Cryptographic Protection
- [ ] **SI-4**: Information System Monitoring

### Title IV Compliance Checklist

Based on **34 CFR 668**, ensure:

- [ ] **§668.14(b)(18)** - Code of conduct requirements
- [ ] **§668.16(d)** - Adequate technical standards
- [ ] **§668.24** - Record retention (3 years)
- [ ] **§668.25** - Third-party servicer requirements
- [ ] **GLBA** - Safeguards Rule compliance

---

## Quick Reference URLs

### Federal Resources
- **FERPA Main Page:** https://www2.ed.gov/policy/gen/guid/fpco/ferpa/index.html
- **PTAC (Privacy Technical Assistance Center):** https://studentprivacy.ed.gov/
- **FSA Partner Connect:** https://fsapartners.ed.gov/
- **NIST Cybersecurity Framework:** https://www.nist.gov/cyberframework

### Compliance Tools
- **FERPA Sherpa:** https://ferpasherpa.org/
- **CoSN Privacy Toolkit:** https://www.cosn.org/tools-and-resources/privacy-toolkit/
- **Future of Privacy Forum:** https://studentprivacy.info/

### Incident Response
- **US-CERT:** https://www.cisa.gov/uscert/
- **ED Privacy Breach Response:** https://studentprivacy.ed.gov/resources/data-breach-response-checklist
- **State Breach Notification Laws:** https://www.ncsl.org/technology-and-communication/security-breach-notification-laws

---

## Document Control

**Version:** 1.0  
**Last Updated:** July 23, 2025  
**Next Review:** October 23, 2025  
**Owner:** Compliance Officer  

### Revision History
| Date | Version | Changes | Author |
|------|---------|---------|---------|
| July 23, 2025 | 1.0 | Initial creation | Compliance Team |

---

## Notes for Implementation

1. **Always verify current versions** - Regulations change; confirm URLs are current
2. **State law variations** - Check specific state requirements for your institution
3. **Legal counsel** - This appendix is for reference only; consult legal counsel for interpretation
4. **Regular updates** - Review quarterly for regulatory changes
5. **Training materials** - Use these references to develop staff training

---

*This appendix provides reference documentation for FERPA and PII compliance. It should be used in conjunction with the main compliance report and does not constitute legal advice.*