# Security Specification & Threat Model (Firestore Security Policies)

## 1. Data Invariants
- **Public Read Access**: Any guest or client visiting the portfolio website can query and read services and projects in real-time.
- **Write Authorization (Owner Only)**: Modifying service layouts, adding folders, updating projects, or deleting photos is strictly restricted. Only the authenticated workspace user or administrator can make any write/delete mutations.
- **Project Folder Belonging**: Every `ProjectFolder` MUST be associated with a valid service ID (`serviceId` is string, length <= 16).
- **Size Limits & Anti-DoS Guarding**: Submissions of excessively large text strings (e.g., titles, descriptions > 2000 characters) are restricted.
- **Strict Keys**: Document creates must supply exact schema keys without shadow fields to prevent malicious payload parsing.

---

## 2. The "Dirty Dozen" Threat Vector Payloads

Below are the 12 malicious payloads and actions that are blocked by our Firestore Security rules constraints:

1. **Unsigned-In Project Creation**: Guest attempt to upload a project folder without authentication headers.
2. **Ghost-Field Injection / Privilege Escalation**: Owner trying to create a project with unexpected fields (e.g., `"adminOverride": true`).
3. **Large Payload Resource Exhaustion**: Owner trying to upload a title exceeding 200 characters or description exceeding 2000 characters.
4. **Service ID Manipulation**: Trying to create a project pointing to a non-existent or invalid service format (e.g. SQL injection pattern in `serviceId`).
5. **Direct User-Profile Mutation / Impersonation**: Forbidding standard users from writing fields mimicking administrator status.
6. **Immutable Timestamp Spoofing**: Supplying client-generated epoch value for `createdAt` instead of a locked server timestamp.
7. **Cross-Service Modification**: Modifying a project folder structure that bypasses standard schema structures.
8. **Malicious Empty Folder State**: Creating a folder document containing null/undefined title properties.
9. **Bulk Delete Attack**: Guest attempting to purge `/projects/` or `/services/` databases without an owner session.
10. **Arbitrary File Key Overwrite**: Malicious user trying to inject additional keys under `service` root.
11. **Spoofed Step Insertion**: Inserting a corrupt dictionary into the services `steps` array with missing required language fields.
12. **Folder Date Modification Abuse**: Modifying historical audit dates with empty or non-string inputs.

---

## 3. Threat Model Validation Outcomes
- All non-authenticated write/delete requests return `PERMISSION_DENIED` automatically.
- Validated server-timestamp values and validation blueprints enforce correct schema typing on actual collection updates.
