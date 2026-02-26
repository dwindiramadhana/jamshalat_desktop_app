# Masjid Display System: Comprehensive Research & Design Recommendations

**Date:** February 22, 2026  
**Purpose:** Research findings on how digital display systems work in mosques/masjids worldwide, with recommendations for implementation in Jam Shalat App

---

## Executive Summary

Based on research of leading masjid display solutions (Masjidal, Masjidbox, MOHID, TheMasjidApp, ConnectMazjid), modern mosque display systems are **not just prayer time clocks** — they are comprehensive **community communication platforms** that rotate between:
- **Primary content:** Prayer times, iqamah countdowns, Islamic calendar
- **Secondary content:** Event announcements, fundraising campaigns, class schedules, sponsor recognition, community news, event posters

The key pattern is **scheduled rotation** that keeps the main prayer schedule visible while injecting dynamic community content to prevent screen fatigue and maximize engagement.

---

## 1. Core Functions of Masjid Display Systems

### 1.1 Prayer Time Display (Primary Function)
- **Automatic prayer time updates** based on location and calculation method
- **Iqamah countdown timers** showing "X minutes to Iqamah"
- **Next prayer countdown** (e.g., "Maghrib in 2 hours 15 minutes")
- **Adhan/Iqamah visual notifications** (full-screen takeover during prayer times)
- **Jumuah special scheduling** (Friday prayer times differ from daily Dhuhr)
- **Islamic date display** (Hijri calendar)

### 1.2 Community Communication (Secondary Function)
Based on research, masjids use displays for:

#### **Event Announcements (Top Priority)**
- Community iftars, Eid programs, fundraising dinners
- Lectures, halaqas, Islamic classes
- Volunteer drives, charity events
- Special guests/speakers

#### **Fundraising & Donations**
- Campaign goals and progress meters
- QR codes for instant donations
- Sponsor recognition (thanking major donors)
- Project updates (e.g., renovation progress)

#### **Educational Content**
- Quran verses with translation
- Hadith of the day
- Islamic quotes and reminders
- Class schedules and room assignments

#### **Community News**
- Mosque announcements
- Local Muslim business promotions
- Volunteer recognition
- Birthday/anniversary shoutouts (if culturally appropriate)

#### **Practical Information**
- "Please silence your phones" reminders
- Parking instructions
- Lost and found notices
- Weather alerts

---

## 2. Content Rotation Strategy

### 2.1 Industry Best Practices

Research reveals these **proven rotation patterns**:

#### **Slide Duration**
- **Standard: 10-15 seconds per slide**
- Test: "If you can read the text backward in the display time, viewers can read it forward"
- Exception: Video content may run 20-30 seconds
- Exception: Prayer time main screen may stay longer (20-30 seconds)

#### **Loop Duration**
- **Optimal: 50-72 seconds total playlist loop**
- Based on typical mosque "dwell time" (30-120 seconds in prayer halls or lobbies)
- Ensures most viewers see the full cycle while waiting

#### **Refresh Frequency**
- **Daily updates:** Prayer times (automatic)
- **Weekly updates:** Announcements, events
- **Monthly updates:** Long-term campaigns, educational content
- **Seasonal updates:** Ramadan, Eid, Hajj-related content

### 2.2 The "Main Screen Return" Pattern

**Your intuition is correct.** Leading systems use this rotation:

```
Main Prayer Screen (20s)
  ↓
Event Poster 1 (10s)
  ↓
Main Prayer Screen (20s)
  ↓
Fundraising Campaign (10s)
  ↓
Main Prayer Screen (20s)
  ↓
Class Schedule (10s)
  ↓
[LOOP REPEATS]
```

**Why this works:**
1. **Prayer times always accessible** — people can glance at the screen anytime and see the schedule within 30 seconds max
2. **Prevents message fatigue** — rotating content keeps attention
3. **Information hierarchy** — primary (prayer) content gets more screen time than secondary content
4. **Balances function with engagement** — 70% informational (prayer times), 30% engaging (events, videos)

### 2.3 Recommended Rotation Ratios

Based on research findings:

| Content Type | Screen Time % | Frequency in Loop | Notes |
|--------------|---------------|-------------------|-------|
| **Main Prayer Schedule** | 60-70% | Returns every 2-3 slides | Always includes: current time, all prayer times, next prayer countdown, iqamah offset |
| **Event Announcements** | 15-20% | 1-3 slides per loop | High-priority community events |
| **Fundraising/Campaigns** | 5-10% | 1 slide per loop | QR codes, progress bars |
| **Educational Content** | 5-10% | 1 slide per loop | Verses, hadiths, quotes |
| **Sponsor Recognition** | 3-5% | 1 slide per 2 loops | Thank donors, local businesses |

**Example 60-second Loop:**
1. Main Prayer Screen — 20s
2. Ramadan Iftar Event Poster — 10s
3. Main Prayer Screen — 20s
4. Masjid Renovation Fundraiser (with QR code) — 10s
5. [REPEAT]

---

## 3. Screen Mode Classification

### 3.1 **Main Screen (Prayer Schedule View)**

**Purpose:** Display comprehensive prayer information  
**Display Duration:** 20-30 seconds (longer than secondary slides)  
**Visual Hierarchy:** Information-dense but organized

**Must Include:**
- Large, prominent **current time**
- **All 5 daily prayer times** (Subuh, Dzuhur, Ashar, Maghrib, Isya)
- **Next prayer countdown** (e.g., "Dzuhur in 1 jam 23 menit")
- **Iqamah offsets** ("+10 min" or exact iqamah time)
- Optional: Terbit (sunrise), Dhuha times
- Islamic date (Hijri)
- Masjid name/logo
- Location name

**Visual Style:**
- Clean, organized layout
- Background image with overlay for readability
- Large fonts for prayer times
- Color coding for next prayer (highlight)

**When to Show:**
- Default screen when no countdown/adhan is active
- Returns frequently in rotation (every 2-3 slides)
- Extended display during low-activity periods

### 3.2 **Secondary Screen (Announcement/Content View)**

**Purpose:** Display custom community content with visual impact  
**Display Duration:** 10-15 seconds per slide  
**Visual Hierarchy:** Image-dominant, minimal text overlay

**Types of Secondary Content:**

#### **A. Event Posters**
- Full-screen custom poster/flyer
- Minimal overlay: just time/date/location
- User uploads custom background image or uses solid colors
- Examples: Ramadan program, fundraising dinner, guest lecture

#### **B. Minimalist Info Slides**
- Large background image (landscape, Islamic art, nature)
- Small info overlay in corner:
  - Current time
  - Next prayer time only
  - Masjid logo
- Feels like a "screensaver with info"

#### **C. Video Content**
- Short promotional videos (20-30s max)
- Fundraising campaign videos
- Masjid tour/introduction videos
- Educational content from Islamic scholars

#### **D. Interactive Content**
- QR code slides for donations
- "Scan to join WhatsApp group" slides
- "Download our app" promotions

**Visual Style:**
- **Image dominance** (70-80% of screen is visual)
- Minimal text overlay (only essential info)
- High-quality imagery
- Consistent branding (masjid colors/logo)

**When to Show:**
- Between main prayer screen rotations
- During low-priority viewing times
- Can be scheduled for specific times (e.g., show Jumuah announcement only on Fridays)

---

## 4. Advanced Features Required

### 4.1 Content Management System (CMS)

**Users need to:**
- Upload custom images/posters
- Create slides with background colors
- Schedule content (start/end dates)
- Set display duration per slide
- Reorder slides via drag-and-drop
- Preview before publishing
- Remote update from phone/web

### 4.2 Smart Scheduling

**Time-based rules:**
- "Show Jumuah announcement only on Fridays 9AM-2PM"
- "Hide fundraising slide after campaign ends"
- "Show Ramadan content only during Ramadan month"
- "Display 'Please silence phones' 5 minutes before each prayer"

**Event-triggered rules:**
- "Show countdown overlay 60 seconds before adhan"
- "Full-screen takeover during adhan/iqamah"
- "Return to main screen after iqamah ends"

### 4.3 Multi-Screen Support

- **Prayer Hall Screen:** Full rotation (main + secondary content)
- **Entrance Lobby Screen:** Focus on welcome message + next prayer time
- **Women's Section Screen:** Same as main hall, customizable if needed
- **Kids Area Screen:** More educational/fun content, less text

### 4.4 Offline Capability

- Must work without internet (prayer times pre-downloaded)
- Background images cached locally
- Sync when internet available
- Critical for reliability during Jumuah/Ramadan

---

## 5. Design Patterns from Leading Solutions

### 5.1 Masjidal (Al-Iqamah)
- Cloud-based signage platform
- Remote management from web portal
- Automatic prayer time sync
- Custom content upload
- Multi-screen support
- Scheduled publishing

**Key Insight:** "Cloud-based means control from anywhere" — admins don't need to be at masjid to update content

### 5.2 Masjidbox Screens
- Offline-capable
- Customizable colors/layouts
- Portrait and landscape orientation
- Scheduled content display
- Team collaboration (multiple admins)
- Mobile app for quick updates

**Key Insight:** "Automate and forget" — set schedule once, it runs automatically

### 5.3 MOHID Signage Player
- Smart adhan display with auto-countdown
- QR code integration for donations
- Real-time content updates
- Professional templates
- Analytics and engagement tracking

**Key Insight:** "QR codes boost donations" — make giving instant and easy

### 5.4 TheMasjidApp Slides
- Multi-screen distribution
- Drag-and-drop content builder
- Support for JPG, PNG, PDF
- Flyer/poster upload system
- Integrated with prayer times

**Key Insight:** "Upload any content" — flexibility is key

---

## 6. Implementation Recommendations for Jam Shalat App

### 6.1 Core Architecture

```
┌─────────────────────────────────────────┐
│         DISPLAY CONTROLLER              │
│                                         │
│  ┌──────────────┐   ┌──────────────┐  │
│  │ Main Screen  │   │  Secondary   │  │
│  │   (Prayer    │   │   Slides     │  │
│  │  Schedule)   │   │  (Carousel)  │  │
│  └──────────────┘   └──────────────┘  │
│           ▲               ▲            │
│           │               │            │
│           └───┬───────────┘            │
│               │                        │
│    ┌──────────▼──────────┐            │
│    │  ROTATION MANAGER   │            │
│    │  - Loop scheduling  │            │
│    │  - Duration control │            │
│    │  - Priority queue   │            │
│    └─────────────────────┘            │
│               ▲                        │
│               │                        │
│    ┌──────────▼──────────┐            │
│    │ COUNTDOWN OVERLAY   │            │
│    │  (Highest Priority) │            │
│    └─────────────────────┘            │
└─────────────────────────────────────────┘
```

### 6.2 Data Model Extension

**Add to Settings:**
```typescript
interface SlideSettings {
  enabled: boolean;
  slides: CustomSlide[];
  rotationInterval: number; // seconds between main screen returns
  slideDefaultDuration: number; // default 10 seconds
  mainScreenDuration: number; // default 20 seconds
  shuffleSlides: boolean;
}

interface CustomSlide {
  id: string;
  type: 'image' | 'poster' | 'video' | 'text';
  title: string;
  
  // Visual content
  backgroundType: 'image' | 'color' | 'gradient';
  backgroundImage?: string; // base64 or URL
  backgroundColor?: string;
  backgroundGradient?: { from: string; to: string; };
  
  // Overlay content (optional for minimalist slides)
  showOverlay: boolean;
  overlayPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  overlayContent: {
    showTime?: boolean;
    showNextPrayer?: boolean;
    customText?: string;
    showLogo?: boolean;
  };
  
  // Display settings
  duration: number; // seconds
  enabled: boolean;
  
  // Scheduling
  schedule?: {
    startDate?: Date;
    endDate?: Date;
    daysOfWeek?: number[]; // 0=Sunday, 5=Friday
    timeRange?: { start: string; end: string; }; // "09:00-14:00"
  };
  
  // Priority
  priority: 'low' | 'normal' | 'high'; // High priority shows more frequently
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

### 6.3 Rotation Logic

**Algorithm: Weighted Round-Robin with Main Screen Return**

```typescript
class SlideRotationManager {
  private mainScreenCounter = 0;
  private readonly MAIN_SCREEN_FREQUENCY = 2; // Show main every 2 slides
  
  getNextSlide(): 'main' | CustomSlide {
    // 1. PRIORITY: Countdown/Adhan overlay (handled separately, highest z-index)
    if (isCountdownActive) {
      return 'countdown-overlay'; // This takes over entire screen
    }
    
    // 2. Check if it's time to show main screen
    if (this.mainScreenCounter >= this.MAIN_SCREEN_FREQUENCY) {
      this.mainScreenCounter = 0;
      return 'main';
    }
    
    // 3. Get next scheduled secondary slide
    const activeSlides = this.getActiveSlides(); // Filter by schedule/enabled
    if (activeSlides.length === 0) {
      return 'main'; // Fallback to main if no secondary content
    }
    
    const nextSlide = this.selectSlideByPriority(activeSlides);
    this.mainScreenCounter++;
    return nextSlide;
  }
  
  private getActiveSlides(): CustomSlide[] {
    return slides.filter(slide => {
      if (!slide.enabled) return false;
      if (!this.isScheduledNow(slide.schedule)) return false;
      return true;
    });
  }
  
  private selectSlideByPriority(slides: CustomSlide[]): CustomSlide {
    // Weight by priority: high=3, normal=2, low=1
    const weighted = slides.flatMap(slide => {
      const weight = slide.priority === 'high' ? 3 : slide.priority === 'normal' ? 2 : 1;
      return Array(weight).fill(slide);
    });
    
    // Rotate through weighted array
    const index = this.rotationIndex++ % weighted.length;
    return weighted[index];
  }
}
```

### 6.4 UI/UX Hierarchy (Updated)

**Priority Levels (Z-index from highest to lowest):**

1. **Countdown Overlay** (z-index: 100) — Full-screen takeover
   - Adzan countdown (60s before)
   - Adzan announcement (at prayer time)
   - Iqamah countdown (gap time)
   - Iqamah announcement

2. **Rotation Manager** (z-index: 10) — Switches between:
   - **Main Prayer Screen** (60-70% of rotation time)
   - **Secondary Slides** (30-40% of rotation time)

3. **Background Layer** (z-index: 0) — Image/gradient

**Visual Transition:**
- Fade transition between slides (300-500ms)
- Slide-in animation for secondary content (optional)
- No transition during countdown overlay (instant takeover)

### 6.5 Settings Modal: New "Slides" Tab

Add after Audio tab, before About tab:

**Sections:**
1. **Enable Slide Rotation** (toggle)
2. **Rotation Settings**
   - Main screen duration (10-60s, default 20s)
   - Secondary slide default duration (5-30s, default 10s)
   - Return to main screen every X slides (1-5, default 2)

3. **Slide Library**
   - List of all slides with preview thumbnails
   - Add/Edit/Delete/Reorder (drag-and-drop)
   - Enable/disable per slide
   - Duplicate slide feature

4. **Create/Edit Slide Modal**
   - Type selector (Image Poster, Minimalist Info, Text Only)
   - Background chooser (upload image, color picker, gradient)
   - Overlay settings (show time, next prayer, custom text)
   - Duration slider
   - Schedule settings (optional)
   - Priority selector
   - Preview pane

---

## 7. Example Use Cases

### Use Case 1: Friday Jumuah Announcement

**Scenario:** Masjid wants to show Jumuah khutbah topic every Friday

**Setup:**
- Create slide: "Jumuah Khutbah - Topic: Patience in Trials"
- Background: Custom uploaded poster with masjid branding
- Schedule: Fridays only, 9:00 AM - 2:00 PM
- Duration: 15 seconds
- Priority: High

**Result:** This slide appears every Friday morning, automatically hides on Saturday

### Use Case 2: Ramadan Fundraising Campaign

**Scenario:** 30-day renovation fundraising during Ramadan

**Setup:**
- Create slide: "Masjid Renovation - $50K Goal"
- Background: Progress bar graphic (updated weekly)
- Overlay: QR code for donations
- Schedule: Ramadan 1-30 (set start/end dates)
- Duration: 12 seconds
- Priority: High

**Result:** Shows multiple times per hour during Ramadan, auto-expires after Eid

### Use Case 3: Generic Islamic Reminder

**Scenario:** Show beautiful Quran verse as screensaver-style content

**Setup:**
- Create slide: Surah Ar-Rahman verse with calligraphy
- Background: Nature image (mountains, sunset)
- Overlay: Minimal (just next prayer time in corner)
- Schedule: Always active, all days
- Duration: 15 seconds
- Priority: Low

**Result:** Fills rotation during idle times, adds spiritual atmosphere

---

## 8. Technical Considerations

### 8.1 Performance
- **Preload slides:** Load next 2-3 slides in memory
- **Image optimization:** Compress backgrounds, max 1920x1080
- **Smooth transitions:** Use CSS transitions, GPU acceleration
- **Memory management:** Cleanup old slides from memory

### 8.2 Storage
- **Base64 encoding** for small images (< 500KB)
- **LocalStorage** for slide metadata (< 5MB limit awareness)
- **IndexedDB** for larger media files
- **Cloud sync** (optional): Backup slides to server

### 8.3 Accessibility
- **High contrast mode:** Ensure text readable on all backgrounds
- **Font size minimums:** 24px for body text, 48px+ for headings
- **Color blindness:** Don't rely solely on color for meaning
- **Preview mode:** Let users test readability before publishing

---

## 9. Competitive Analysis Summary

| Feature | Masjidal | Masjidbox | MOHID | TheMasjidApp | **Jam Shalat** (Proposed) |
|---------|----------|-----------|-------|--------------|---------------------------|
| Cloud-based CMS | ✅ | ✅ | ✅ | ✅ | ✅ (future) |
| Offline mode | ✅ | ✅ | ⚠️ | ⚠️ | ✅ |
| Custom slide upload | ✅ | ✅ | ✅ | ✅ | ✅ |
| Slide scheduling | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| Multi-screen | ✅ | ✅ | ✅ | ✅ | 🔮 (Phase 2) |
| Prayer countdown | ✅ | ✅ | ✅ | ✅ | ✅ (already done) |
| Audio adhan | ⚠️ | ⚠️ | ✅ | ⚠️ | ✅ (already done) |
| QR code support | ✅ | ⚠️ | ✅ | ⚠️ | ✅ (easy to add) |
| Free tier | ✅ | ✅ | ❌ | ⚠️ | ✅ (fully free) |
| **Desktop app** | ❌ | ❌ | ❌ | ❌ | ✅ (our advantage) |
| **Mobile app** | ❌ | ❌ | ❌ | ❌ | ✅ (our advantage) |

**Our Competitive Edge:**
- Free, open-source, no subscription
- Works offline completely (no cloud dependency)
- Cross-platform (Desktop + Mobile + Android)
- Already has audio system built-in
- Indonesian-focused (MyQuran API integration)

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Current)
- ✅ Audio system (adzan, countdown, beep)
- ✅ Countdown overlay (adzan/iqamah)
- ✅ Main prayer schedule screen
- ✅ Secondary screen (minimal mode)
- ✅ Settings management

### Phase 2: Slide Rotation System (Next)
**Priority: HIGH**

**Week 1-2:**
- [ ] Add `SlideSettings` to types
- [ ] Create `SlideRotationManager` service
- [ ] Build rotation algorithm (weighted round-robin)
- [ ] Implement slide switching with transitions

**Week 3-4:**
- [ ] Create "Slides" tab in SettingsModal
- [ ] Build slide creation/edit form
- [ ] Add image upload + compression
- [ ] Implement drag-and-drop reordering

**Week 5-6:**
- [ ] Add scheduling logic (date ranges, days of week)
- [ ] Build preview mode
- [ ] Add slide templates (quick start)
- [ ] Test rotation patterns

### Phase 3: Advanced Features (Future)
- [ ] Video slide support
- [ ] QR code generator integration
- [ ] Analytics (view counts, engagement)
- [ ] Multi-screen support (different playlists per screen)
- [ ] Cloud sync (optional)
- [ ] Template marketplace

---

## 11. Key Takeaways & Recommendations

### ✅ **DO:**
1. **Return to main screen frequently** (every 2-3 slides) — prayer times are #1 priority
2. **Keep slides short** (10-15 seconds) — attention spans are brief
3. **Use high-quality images** — blurry posters look unprofessional
4. **Schedule smartly** — Friday content on Fridays only, Ramadan content expires after Eid
5. **Make it easy to update** — admin should update from phone in under 2 minutes
6. **Preload and cache** — smooth transitions, no loading spinners
7. **Support both modes:**
   - Dense info mode (main prayer screen)
   - Minimalist mode (image-dominant slides)

### ❌ **DON'T:**
1. **Don't overload slides** — one message per slide maximum
2. **Don't make loops too long** — 60-90 seconds max total
3. **Don't hide prayer times** — always accessible within 30 seconds
4. **Don't ignore scheduling** — expired content looks neglected
5. **Don't use tiny fonts** — minimum 24px body, 48px headings
6. **Don't autoplay videos with sound** — visual only (unless adhan time)
7. **Don't break offline mode** — masjid WiFi is unreliable

### 🎯 **Success Metrics:**
- **Community engagement:** More attendance at announced events
- **Donation increase:** QR codes make giving instant
- **Admin satisfaction:** Updates take < 2 minutes
- **Reliability:** 99.9% uptime, works during Jumuah rush
- **Visual appeal:** Professional, modern, pride in masjid tech

---

## 12. Conclusion

Modern masjid display systems are **dynamic communication hubs**, not static prayer clocks. The key pattern is:

**Main Prayer Screen (20s) → Secondary Content (10s) → Main Screen (20s) → [REPEAT]**

This keeps prayer times always accessible while preventing screen fatigue and maximizing community engagement.

**Next Steps for Jam Shalat App:**
1. Implement slide rotation manager
2. Add slide creation UI in Settings
3. Build scheduling logic
4. Test with real masjid use cases (Jumuah announcement, Ramadan campaign)
5. Gather user feedback and iterate

By implementing these features, Jam Shalat will become a **complete masjid communication solution**, not just a prayer time display. This positions us as a serious competitor to commercial solutions while remaining free and open-source.

---

**References:**
- Masjidal: https://mymasjidal.com/
- Masjidbox: https://masjidbox.com/
- MOHID: https://mohid.net/
- TheMasjidApp: https://themasjidapp.org/
- Look Digital Signage (Best Practices): https://www.lookdigitalsignage.com/
