# BuilderBus Platform - Complete System Overview

## Platform Architecture

BuilderBus is a trust-focused property consulting platform with three main user roles:

1. **Buyers/Homebuyers** - Use the main platform to find properties
2. **Builders** - Submit properties via the builder dashboard
3. **Admins** - Review and approve properties via admin panel

---

## User Journeys

### 👥 Buyer Journey
```
Visit Homepage
    ↓
Learn about expert-guided buying
    ↓
Fill lead capture form (phone, budget, location, intent)
    ↓
Get matched with personal consultant
    ↓
View recommended properties
    ↓
Schedule site visits
    ↓
Make informed decision with consultant guidance
```

### 🏗️ Builder Journey
```
Access: /dashboard/builder
    ↓
Click "Add Property"
    ↓
Fill property details form
    ↓
Upload images (required)
    ↓
Upload brochure (optional)
    ↓
Save as draft
    ↓
Edit and refine
    ↓
Submit for approval
    ↓
Wait for admin review
    ↓
Either get approved or feedback
    ↓
Property goes live on platform
```

### 🔍 Admin Journey
```
Access: /dashboard/admin
    ↓
View pending submissions
    ↓
Review full property details
    ↓
Check images, description, pricing
    ↓
Add internal notes if needed
    ↓
Approve or reject
    ↓
If approved: Publish to platform
    ↓
If rejected: Builder receives feedback
```

---

## File Structure & Components

### Main Application Files
```
app/
├── page.tsx                              # Homepage with all sections
├── layout.tsx                            # Root layout
├── globals.css                           # Global styles
│
├── dashboard/
│   ├── layout.tsx                        # Dashboard wrapper layout
│   ├── page.tsx                          # Dashboard index/portal selector
│   │
│   ├── builder/
│   │   └── page.tsx                      # Builder dashboard
│   │
│   └── admin/
│       └── page.tsx                      # Admin dashboard
│
└── components/
    ├── LeadCaptureForm.tsx               # Homepage lead form
    ├── ConsultantProfile.tsx             # Consultant showcase section
    ├── RecommendedProperties.tsx         # Properties recommendations
    ├── PropertyCard.tsx                  # Guidance-focused property card
    │
    ├── PropertyDraftForm.tsx             # Builder property creation form
    ├── PropertyDraftsList.tsx            # Builder properties list
    │
    ├── PropertyReviewCard.tsx            # Admin review card
    └── PropertyDetailModal.tsx           # Admin detailed review modal
```

---

## Key Features by User Type

### 🏠 Homepage Features
✅ **Hero Section** - Compelling value proposition  
✅ **Trust Badges** - Statistics (5000+ homes, 250+ consultants)  
✅ **How It Works** - 3-step process explanation  
✅ **Why Trust Us** - 4 trust factors  
✅ **Featured Properties** - Example listings  
✅ **Consultant Profiles** - 3 sample consultants with specialties  
✅ **Recommended Properties** - Personalized matches  
✅ **Testimonials** - Customer success stories  
✅ **Lead Capture Form** - Phone, budget, location, intent  
✅ **Final CTA** - Consultation booking  
✅ **Footer** - Links and contact info  

### 🏗️ Builder Dashboard Features
✅ **Property Management** - Create, edit, delete properties  
✅ **Status Tracking** - Drafts, submitted, approved, history  
✅ **Form Validation** - All fields properly validated  
✅ **File Uploads** - Multiple images (5MB max each), brochure (10MB max)  
✅ **Amenities** - Add/remove multiple amenities  
✅ **Real-time Stats** - Count of properties by status  
✅ **Submission Tracking** - See approval status and feedback  
✅ **Edit on Feedback** - Resubmit after rejection with changes  

### 🔍 Admin Panel Features
✅ **Property Queue** - Organized by status (pending, approved, live, rejected)  
✅ **Quick Stats** - Dashboard metrics  
✅ **Detailed Review** - Full property information in modal  
✅ **Internal Notes** - Document review findings (permanent record)  
✅ **Approve/Reject** - Two approval options (draft or live)  
✅ **Rejection Feedback** - Builders see detailed reasons  
✅ **Publish Control** - Decide when properties go live  
✅ **Builder Info** - View builder contact details  

---

## Property Status Workflow

### Complete Workflow
```
DRAFT (Builder)
  ↓
SUBMITTED (Pending Admin Review)
  ↓
  ├─→ APPROVED (Ready, not yet live)
  │     ↓
  │   LIVE (Published to platform)
  │
  └─→ REJECTED (Return to builder for changes)
        ↓
      RESUBMITTED (Back to review)
```

### Status Definitions
- **Draft** - Incomplete, not submitted
- **Submitted** - Awaiting admin review
- **Approved** - Quality confirmed, ready to publish
- **Live** - Published and visible to buyers
- **Rejected** - Needs corrections, builder must fix and resubmit

---

## Form Data Structures

### Property Submission Data
```typescript
interface PropertySubmission {
  // Identification
  id: string                              // Unique identifier
  title: string                           // Project name
  
  // Basic Details
  config: string                          // 1-4+ BHK
  location: string                        // Area, city
  price: string                           // Asking price (e.g., ₹45L)
  area: string                            // Square feet
  age: string                             // Property age
  
  // Description & Amenities
  description: string                     // Full description
  amenities: string[]                     // List of amenities
  
  // Media
  images: File[]                          // Property photos
  brochure?: File                         // PDF document
  
  // Builder Info
  builderName: string                     // Submitted by
  builderEmail: string                    // Builder contact
  
  // Metadata
  submittedAt: Date                       // Submission timestamp
  status: 'submitted'|'approved'|         // Current status
          'rejected'|'live'
  
  // Admin Actions
  internalNotes: Note[]                   // Admin documentation
  rejectionReason?: string                // Why it was rejected
  approvalDate?: Date                     // When approved
  liveDate?: Date                         // When published
}

interface InternalNote {
  id: string                              // Note ID
  text: string                            // Note content
  author: string                          // Who wrote it
  timestamp: Date                         // When written
}
```

### Lead Capture Data
```typescript
interface LeadCaptureData {
  phone: string                           // 10-digit number
  budget: string                          // Budget range (20L-2Cr+)
  location: string                        // Area preference
  intent: 'end-use' | 'investment'       // Buying reason
}
```

---

## Design System

### Color Palette
- **Blue (Primary)**: #2563EB - CTAs, highlights, trusted actions
- **Green (Success)**: #16A34A - Approval, positive states
- **Red (Alert)**: #DC2626 - Rejection, warnings
- **Yellow (Pending)**: #EAB308 - Under review states
- **Gray (Neutral)**: Grayscale for text, backgrounds
- **Purple (Admin)**: #A855F7 - Admin-specific elements

### Typography
- **Headings**: Bold, sized for hierarchy (h1-h3)
- **Body Text**: Regular weight for readability
- **Labels**: Semibold, small caps for form fields

### Components
- **Buttons**: Rounded corners, consistent padding, clear CTAs
- **Cards**: Shadow, border, rounded corners for depth
- **Forms**: Clear labels, validation feedback, helpful placeholders
- **Modals**: Full-screen on mobile, centered on desktop, scrollable content

---

## Key User Actions & Flows

### Action: Submit Property (Builder)
1. Open builder dashboard
2. Click "Add Property"
3. Fill in all property details
4. Upload required images
5. (Optional) Upload brochure
6. Add amenities
7. Click "Save as Draft"
8. Review and finalize
9. Click "Submit for Approval"
10. Property moves to admin queue

### Action: Review & Approve (Admin)
1. Open admin dashboard
2. Click "Pending Review" tab
3. Click "Review Details" on a property
4. Examine all information
5. Read internal notes from previous reviews
6. Add your assessment as internal note
7. Click "Approve Property"
8. Choose: Keep as draft OR Go live immediately
9. Property moves to appropriate status

### Action: Reject & Request Changes (Admin)
1. Open property review modal
2. Click "Reject Property"
3. Enter detailed reason for rejection
4. Click "Confirm Rejection"
5. Property returns to builder
6. Builder sees rejection + reason
7. Builder edits property
8. Builder resubmits
9. Admin reviews again

### Action: Publish to Platform (Admin)
1. Find approved (but not live) property
2. Open detail modal
3. Review one final time
4. Click "Publish to Platform"
5. Property becomes visible to buyers
6. Consultants can recommend it
7. Property appears in search results

---

## Business Logic

### Property Submission Workflow
1. **Builder creates draft** - Can save/edit anytime
2. **Builder submits** - Status changes to "submitted", goes to admin queue
3. **Admin reviews** - Checks quality, completeness, authenticity
4. **Admin decision:**
   - ✅ Approve → Goes to "approved" status
   - ❌ Reject → Goes to "rejected" with feedback
5. **If approved:**
   - Admin can publish immediately
   - Or keep in approved queue for later review
6. **If published:**
   - Property is "live"
   - Visible to all buyers and consultants
   - Cannot be unpublished (by design)

### Quality Assurance Checkpoints
- **Image Quality** - Clear, professional, multiple angles
- **Description Accuracy** - Complete, realistic, no false claims
- **Pricing Validity** - Market-appropriate for location
- **Amenities Listed** - Accurate representation
- **Builder Credibility** - Verified builder information
- **Documentation** - Brochure and all details included

---

## Integration Points (Future)

### Recommended MCP Integrations
1. **Supabase** - Database for persistent property storage
2. **Netlify** - Hosting and deployment
3. **Builder.io CMS** - Content management
4. **Sentry** - Error monitoring and debugging
5. **Linear** - Issue tracking for property problems

### Future Features
- Authentication & user accounts
- Real database storage (Supabase/Neon)
- Email notifications
- Property search & filtering
- Map integration
- Image verification/anti-fraud
- Payment processing
- Admin roles & permissions
- Analytics dashboard

---

## Performance & UX Considerations

### Accessibility
- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance

### Responsiveness
- Mobile-first design approach
- Grid/flex layouts for adaptation
- Touch-friendly buttons and inputs
- Readable text sizes on all devices

### User Experience
- Clear form validation
- Helpful error messages
- Success feedback on actions
- Progressive disclosure (modals, tabs)
- Logical workflow progression

---

## Security & Privacy

### Data Protection
- Form validation prevents invalid data
- File uploads validated by type and size
- Internal notes are permanent record
- Audit trail of all admin actions
- Builder info protected (only shown to admins)

### Access Control
- Builder dashboard: Builders only
- Admin dashboard: Admins only
- Homepage: Public access

### Future Enhancements
- JWT authentication
- Role-based access control
- Encryption for sensitive data
- Rate limiting on forms
- GDPR compliance

---

## Testing & QA

### Manual Testing Checklist
- [ ] All forms submit and validate correctly
- [ ] File uploads work for images and PDFs
- [ ] Status transitions work properly
- [ ] Admin approvals update all fields
- [ ] Internal notes persist and display
- [ ] Rejection feedback visible to builders
- [ ] Properties go live when published
- [ ] Responsive design on mobile/tablet/desktop

### Edge Cases to Test
- Form submission with missing fields
- File size violations (too large images)
- Same property submitted multiple times
- Admin rejecting then reapproving
- Builder resubmitting after rejection
- Mass publish scenario

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintainer**: BuilderBus Development Team
