# St. Anthony Catholic Church Website - Product Requirements Document

## Original Problem Statement
Build a complete, production-ready traditional Catholic church website with a fully functional custom admin panel (CMS) for St. Anthony Catholic Church AIT Alagbado Lagos State, Nigeria.

## User Choices
- Authentication: JWT-based custom authentication
- Donations: Stripe payment integration
- Sermons: External URL links (YouTube, Vimeo embeds)
- Maps: OpenStreetMap (free, no API key needed)
- Church Name: St. Anthony Catholic Church AIT Alagbado Lagos State

## Architecture
### Tech Stack
- **Backend**: FastAPI (Python) with MongoDB
- **Frontend**: React with Tailwind CSS + Shadcn/UI
- **Authentication**: JWT with bcrypt password hashing
- **Payments**: Stripe Checkout via emergentintegrations
- **Database**: MongoDB collections for settings, users, pages, sections, sermons, events, gallery, messages, announcements, clergy, payment_transactions

### Database Collections
1. `settings` - Church info, contact details, mass times, SEO settings
2. `users` - Admin users with hashed passwords
3. `pages` - CMS page content (about, sacraments, etc.)
4. `sections` - Page section blocks
5. `sermons` - Sermon entries with video URLs
6. `events` - Parish events with calendar
7. `gallery` - Image gallery with categories
8. `messages` - Contact form submissions
9. `announcements` - Parish announcements
10. `clergy` - Clergy profiles
11. `payment_transactions` - Donation records

## User Personas
1. **Parishioners** - Access mass times, events, sermons, donate
2. **Visitors** - Learn about the church, view gallery, contact
3. **Church Administrator** - Manage all content via CMS

## Core Requirements (Implemented)

### Public Website
- [x] Home page with hero, mass times, announcements, events
- [x] About page with church history, mission, clergy profiles
- [x] Mass & Sacraments page with schedules
- [x] Sermons page with YouTube/Vimeo embeds
- [x] Events page with list/calendar views
- [x] Gallery page with categorized images
- [x] Contact page with form and OpenStreetMap
- [x] Donate page with Stripe integration

### Admin CMS
- [x] Secure login/registration
- [x] Dashboard with statistics
- [x] Pages manager with HTML editor
- [x] Sections manager
- [x] Sermons manager
- [x] Events manager
- [x] Gallery manager with categories
- [x] Messages viewer
- [x] Announcements manager
- [x] Clergy profiles manager
- [x] Donations tracker
- [x] Settings editor (church info, SEO)

## What's Been Implemented (January 2026)
- Complete FastAPI backend with 25+ API endpoints
- JWT authentication with secure password hashing
- Full React frontend with 8 public pages + 12 admin pages
- Stripe payment integration for donations
- MongoDB database with all required collections
- Traditional Catholic design with gold, red, white color scheme
- Elegant Cinzel and Playfair Display typography
- Responsive design for all screen sizes
- OpenStreetMap integration
- YouTube/Vimeo sermon embeds
- Sample data seeding

## Prioritized Backlog

### P0 (Critical) - Completed
- All core features implemented

### P1 (High Priority) - Future
- Email notifications for contact form submissions
- Rich text editor (TinyMCE) for page content
- Image upload to cloud storage (currently URL-based)
- Password reset functionality

### P2 (Medium Priority) - Future
- Dark mode toggle
- Multi-language support
- Newsletter subscription
- Event registration system

### P3 (Nice to Have)
- Live Mass streaming integration
- Prayer request form
- Parish directory
- Ministry sign-up

## Next Tasks
1. Add email notifications using SendGrid/Resend
2. Implement rich text editor for content
3. Add image upload functionality
4. Implement password reset flow
5. Add newsletter subscription
