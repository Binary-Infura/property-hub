# BuilderBus Admin Interface Guide

## Overview
The BuilderBus Admin Interface is a dedicated control panel for administrators to review, approve, reject, and manage builder-submitted properties. It provides complete oversight of all property submissions and publication workflow.

## Accessing the Admin Dashboard
- **URL**: `/dashboard/admin`
- **Access Level**: Admin-only (requires authentication)
- **From**: Dashboard navigation menu under "Admin Panel"

---

## Dashboard Overview

### Main Statistics Panel
The top of the admin dashboard displays real-time statistics:

- **Pending Review** - Properties awaiting admin decision
- **Approved** - Properties approved but not yet live
- **Live** - Properties currently published on the platform
- **Rejected** - Properties that need builder resubmission

Each stat card shows:
- Count of properties in that status
- Brief description of what it means
- Visual color coding for quick identification

---

## Property Review Workflow

### Tab Navigation
Four main tabs organize properties by status:

1. **Pending (Yellow)** - NEW SUBMISSIONS
   - Builder just submitted the property
   - Requires admin review and decision
   - Default view when opening the admin panel

2. **Approved (Green)** - QUALITY CONFIRMED
   - Properties have passed admin review
   - Ready to be published to the platform
   - Can be published immediately

3. **Live (Blue)** - PUBLISHED & ACTIVE
   - Properties currently visible to buyers/consultants
   - Can view but not edit
   - Shows publication date

4. **Rejected (Red)** - NEEDS CHANGES
   - Properties that didn't meet quality standards
   - Builders notified with reason
   - Can be resubmitted after changes

---

## Reviewing a Property

### Step 1: Select a Property
From any tab, click **"Review Details"** on a property card to open the detailed review modal.

### Step 2: View Full Details
The modal displays:
- **Property Information**: Config, location, price, area, age
- **Description**: Complete property description
- **Amenities**: All listed amenities
- **Images**: Gallery of uploaded photos
- **Brochure**: Link to uploaded PDF/document (if available)
- **Builder Info**: Contact details of submitting builder
- **Submission Date**: When property was submitted

### Step 3: Examine Internal Notes
View previous admin notes about this property:
- Notes from other admins
- Who added the note and when
- Helpful context for decision-making

---

## Making Admin Decisions

### APPROVING a Property

#### Approval Options:
When you click **"✓ Approve Property"**, you have two choices:

1. **Approve (Keep as Draft)**
   - Property passes quality checks
   - Marked as "Approved" but NOT live yet
   - Admin can review further before publishing
   - Builder cannot change or resubmit
   - Use this for: Final review before going live

2. **Approve & Go Live Immediately**
   - Property is approved AND published instantly
   - Becomes visible to all buyers and consultants
   - Builder cannot make changes after this
   - Use this for: High-quality submissions that need immediate visibility

#### Before Approving, Consider:
✓ Image quality and authenticity  
✓ Accurate pricing and specifications  
✓ Complete and professional description  
✓ All amenities correctly listed  
✓ Brochure quality (if provided)  
✓ No duplicate listings  
✓ Compliance with platform standards  

---

### REJECTING a Property

#### When to Reject:
- Poor quality images (blurry, dark, unprofessional)
- Incomplete information or missing details
- Suspicious pricing (too high/low for location)
- Inaccurate amenities listing
- Inappropriate content in description
- Duplicate of existing property
- Missing critical documents (brochure recommended)

#### Rejection Process:
1. Click **"✕ Reject Property"** button
2. Enter detailed **Rejection Reason**
3. Be specific about what needs to be fixed
4. Click **"Confirm Rejection"**

#### Builder Will See:
- "Rejected" status in their dashboard
- Your feedback explaining the rejection
- Option to edit and resubmit

#### Example Rejection Reasons:
- "Images are too dark and don't show the space clearly. Please upload bright, well-lit photos from multiple angles."
- "Price seems incorrect for this location. Please verify and resubmit with current market pricing."
- "Description is incomplete. Please add more details about amenities and property condition."

---

## Adding Internal Notes

### Purpose of Internal Notes:
- Document your review findings
- Communicate with other admins about properties
- Track concerns or issues with builders
- Mark items for follow-up

### How to Add Notes:
1. Scroll to "Internal Notes" section
2. Type your note in the text area
3. Click **"Add Note"**
4. Note appears in the notes history (max 3 visible, scroll to see more)

### When to Add Notes:
- You're approving but have concerns
- Something looks unusual (price, images quality)
- Builder has reputation issues
- Property needs special attention
- Temporary hold before approval

---

## Publishing Approved Properties

### When Properties are Ready:
Once a property is "Approved" (but not yet live), it can be published to the platform.

### Publishing Process:
1. Open the property detail modal
2. Click **"🚀 Publish to Platform"**
3. Property status changes to "Live"
4. Now visible to all buyers and consultants
5. Cannot be unpublished (design limitation)

### What Happens When Published:
- ✓ Listed in BuilderBus marketplace
- ✓ Visible to all registered buyers
- ✓ Can be matched by consultants
- ✓ Appears in property recommendations
- ✓ Builder notified of live status

---

## Property Status Flowchart

```
Builder Submits Property
        ↓
    SUBMITTED (Pending Review)
        ↓
     [Admin Decision]
        ↓
    ┌───────────────────────────┐
    ↓                           ↓
APPROVED                    REJECTED
(Ready to Publish)        (Return to Builder)
    ↓
  LIVE
(Published to Platform)
```

---

## Best Practices for Admins

### Quality Control
✓ **Consistency** - Apply same standards to all builders  
✓ **Thoroughness** - Review all details, not just images  
✓ **Documentation** - Add notes explaining decisions  
✓ **Fairness** - Give builders chance to fix issues  

### Communication
✓ **Clarity** - Be specific in rejection reasons  
✓ **Professionalism** - Maintain professional tone  
✓ **Timeliness** - Review submissions promptly  
✓ **Feedback** - Help builders improve submissions  

### Workflow
✓ **Review First** - Check all properties before approval  
✓ **Document Notes** - Keep internal record of decisions  
✓ **Batch Publishing** - Review multiple properties, then publish approved ones  
✓ **Follow Up** - Monitor if builders resubmit after rejection  

---

## Dashboard Performance Tips

### Pending Review Tab
- This is your main work area
- Aim to review all pending properties within 24 hours
- Use internal notes to track what needs further review

### Managing Workload
- Sort by submission date (oldest first)
- Group similar rejections (e.g., all image quality issues)
- Document patterns in builder submissions

### Escalation
If you have concerns about a builder:
- Add detailed internal notes
- Contact your manager
- Mark for special review in notes

---

## Troubleshooting

### Property Won't Approve
**Reason**: Missing required information  
**Solution**: Reject with specific feedback, builder will fix

### Can't View Images
**Reason**: Might be low resolution uploads  
**Solution**: Ask builder to reupload in higher quality

### Duplicate Properties
**Reason**: Different builder submitted same property  
**Solution**: Reject second submission, ask for verification

### Indecisive about Approval?
**Solution**: Add internal note and come back later, or discuss with team

---

## Key Statistics to Track

The dashboard provides these key metrics:

| Metric | What It Means | Target |
|--------|---------------|--------|
| Pending | Properties needing decisions | Keep < 10 |
| Approval Rate | % of submitted properties approved | 60-70% |
| Rejection Rate | % rejected (need improvements) | 20-30% |
| Average Review Time | Days to approve/reject | < 2 days |
| Live Properties | Total published listings | Growing |

---

## Access Control & Security

### Admin-Only Features:
- Approve/reject properties
- Add internal notes
- Publish to platform
- View builder contact info
- See all property submissions

### Cannot Do:
- Edit property details (only builders can)
- Delete approved/live properties
- Access builder passwords
- Modify builder accounts
- See payment information

### Data Privacy:
- All decisions are logged
- Internal notes are permanent record
- Builder communication is tracked
- Audit trail maintained for compliance

---

## Support & Escalation

### Questions About a Property:
- Add internal note documenting the question
- Contact property's builder for clarification
- Discuss with team if unsure

### Systemic Issues:
- Document in internal notes
- Report to admin manager
- Suggest platform improvements

### Contact Information:
- Admin Manager: [Contact info]
- Technical Support: [Support info]
- Quality Lead: [Contact info]

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Document Owner**: BuilderBus Admin Team
