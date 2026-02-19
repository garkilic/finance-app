# Roadmap — App Plan

**Version:** 2.0
**Date:** 2026-02-19
**Platform:** Web (React + Vite, deployed on Vercel)
**Design Direction:** Minimalist editorial, fun interactions

---

## 1. Concept

### The Idea

Roadmap is a Financial Wellness workbook rebuilt as a web app. It follows the same three-phase structure exactly — **Understand, Create, Compare** — covering every worksheet in the original document. No features are cut. But instead of a spreadsheet, every step is a clean, well-designed screen that's fast to fill out and satisfying to use.

The app is opinionated and guided. It takes you through the phases in order on first setup, then lets you maintain and update your data freely afterward. Think of it as a living financial document — more structured than Notion, more personal than YNAB, more honest than a spreadsheet you stopped opening.

### What "Fun + Minimalist" Means Here

**Minimalist:** Lots of whitespace, crisp typography, no dashboards cluttered with widgets. Data is presented as clean tables and simple charts — like a well-designed magazine, not a Bloomberg terminal. One accent color throughout. No gradients, no shadows heavier than a 1px border.

**Fun:** Smooth transitions. Satisfying micro-animations (row slide-in when you add an account, number roll when net worth updates). Keyboard shortcuts for power users. Copy with personality in empty states and helper text. The feeling of *flow* — each screen has one job and it does it cleanly.

### Name: **Roadmap**

Tagline: *Your finances, step by step.*

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 |
| Build tool | Vite |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| State | Zustand (with localStorage persist) |
| Forms | React Hook Form + Zod |
| Routing | React Router v6 |
| Deploy | Vercel |

No backend. No auth. Data lives in the browser (localStorage). JSON export/import for backup.

---

## 3. Design System

### Color Palette

Light mode as default. Clean, editorial, warm.

```
Background:   #F9F7F4   warm off-white
Surface:      #FFFFFF   cards, panels
Border:       #E8E5E0   subtle dividers
Text:         #111111   primary
Text Muted:   #777777   labels, captions
Accent:       #1A1A1A   links, active states, buttons
Green:        #2E7D52   positive values, success
Red:          #C0392B   negative values, over-budget
Amber:        #B7791F   warnings, approaching limits
Blue:         #2563EB   information, links
```

The palette is intentionally quiet. Color is used for meaning (green = good, red = bad), not decoration. The one exception is data visualization, which uses a 6-color categorical palette.

### Typography

```
Headings:   "Geist" — clean, geometric, modern
Body:       "Geist" — same family, lighter weight
Numbers:    "Geist Mono" — dollar amounts, account numbers, percentages
```

All dollar amounts are monospaced so columns align visually. Financial data always respects this convention.

### Layout

Fixed **left sidebar** (220px) containing phase-grouped navigation. Content area fills the rest. Max content width: 860px, centered. This is a focused app — no wasted horizontal space.

On screens narrower than 768px, sidebar collapses into a top navigation strip.

### Component Principles

- **Tables over cards for lists.** Accounts, transactions, income entries — these are rows of data. Use real table layouts with sticky headers, not card grids. Scannable, sortable, familiar.
- **Bottom sheets for data entry.** Adding an account, logging a transaction, creating a goal — all open as a slide-up panel over the current page. No page navigations for simple forms.
- **Inline editing where natural.** Click a number to edit it in place (account balances, budget limits). Don't force a modal for a single field update.
- **One action per screen.** Every page has a single primary action button. No competing CTAs.

### Micro-Animations

| Trigger | Animation |
|---|---|
| Add a row | Slide in from bottom, fade opacity 0→1, 200ms |
| Delete a row | Slide out + fade, 150ms |
| Number changes | Roll/count up or down, 400ms spring |
| Page transition | Fade + 8px vertical shift, 180ms |
| Form submit | Button collapses to checkmark, then returns, 300ms |
| Net worth update | Number briefly highlights green or red, then settles |

Animations are purposeful and brief. Never looping, never blocking. Users who prefer reduced motion get instant transitions (respects `prefers-reduced-motion`).

---

## 4. Information Architecture

### Navigation Structure

```
Roadmap
├── Overview                    ← always-visible summary
│
├── Phase 1: Understand
│   ├── Goals
│   ├── Accounts
│   └── Expenses
│
├── Phase 2: Create
│   ├── Net Worth
│   ├── Income
│   └── Schedule
│
└── Phase 3: Compare
    ├── Institutions
    └── Emergency Fund
```

On first visit, a setup wizard walks the user through Phase 1 → Phase 2 in order. After setup, all sections are freely accessible.

### First-Time Flow

A progress bar at the top of the app shows setup completion: "3 of 8 sections complete." It disappears once all sections have been touched at least once.

---

## 5. Onboarding

A lightweight guided setup on first load. Not a full wizard — more like a nudge. The user sees the app immediately but a friendly banner reads:

> *"Start with Phase 1: Understand. It takes about 15 minutes and covers everything you need."*

Each phase section shows a gentle lock state with "Complete Phase 1 first" until the prior phase has at least one entry. This can be overridden — it's a suggestion, not enforcement.

---

## 6. Screen Specifications

---

### 6.1 Overview (Dashboard)

**Purpose:** A single-page snapshot of the user's entire financial picture. Read-only. Auto-calculated.

**Layout:** Three stacked sections.

**Section 1 — Net Worth**
- Large typography: current net worth (green if positive, red if negative)
- Two smaller figures below: Total Assets | Total Liabilities
- Thin sparkline showing net worth across all months logged in the Net Worth tracker

**Section 2 — Phase Progress**
- Three cards side by side: Understand / Create / Compare
- Each card shows a progress ring (X of Y sections complete) and the names of incomplete sections
- Tapping a card navigates to the relevant section

**Section 3 — What's Next**
- The three most time-sensitive items surfaced automatically:
  - Nearest upcoming Schedule task (e.g., "Credit card payment due in 4 days")
  - Goal closest to completion
  - Monthly spending status (e.g., "On track this month — $1,240 of $2,500 spent")

**No edit actions here.** This screen is purely observational. Every number links to its source screen.

---

### 6.2 Goals

**Source:** Worksheet "1 - Understand (Goals)"

**Purpose:** Set and track three financial goals using the SMART framework — one short-term, one mid-term, one long-term.

**Layout:**

Three side-by-side columns (or stacked on mobile):
- Short-Term (under 6 months)
- Mid-Term (6 months – 5 years)
- Long-Term (5+ years)

Each column contains one goal card. If no goal exists for that timeframe, the card shows an empty state: *"No short-term goal yet."* with a "+ Set Goal" button.

**Goal Card contents:**
- Goal title (one line, bold)
- Target amount + current progress amount
- Target date
- A clean horizontal progress bar (% toward target)
- Days remaining label
- Expand arrow → reveals the SMART breakdown

**SMART Breakdown (expanded):**

Five rows, one per criterion:

| Letter | Label | Question shown | User's answer |
|---|---|---|---|
| S | Specific | What exactly do you want to achieve? | [text] |
| M | Measurable | How will you measure success? | [text] |
| A | Attainable | What's your plan to get there? | [text] |
| R | Relevant | Why does this matter to you? | [text] |
| T | Time-bound | When will you achieve it? | [date] |

Empty SMART rows show a light placeholder text. Filled rows show the user's answer inline. Click any row to edit in-place.

**Add / Edit Goal form (bottom sheet):**
- Goal title
- Target amount
- Current amount
- Target date
- Then each of the 5 SMART questions with text inputs
- Link to account (optional — pulls from Accounts section)

---

### 6.3 Accounts

**Source:** Worksheet "1 - Understand (Accounts)"

**Purpose:** Complete inventory of every financial account — cash, investments, loans, and credit cards.

**Layout:**

Four tabbed tables on one screen:
1. Cash Accounts
2. Investment Accounts & Assets
3. Loans & Other Debt
4. Credit Cards

A sticky summary bar at the top always shows:
```
Assets: $14,310    Liabilities: $19,540    Net Worth: -$5,230
```

These numbers update instantly when any account is edited.

---

**Tab 1: Cash Accounts**

Table columns:
| Institution | Nickname | Last 4 | Account Type | APY % | Balance | Notes |

Footer row: Total balance (auto-calculated, bold).

Table row actions (hover reveals): Edit | Delete

---

**Tab 2: Investment Accounts & Assets**

Table columns:
| Institution | Nickname | Last 4 | Account Type | Allocation Mix | Balance | Notes |

Footer row: Total investment balance.

Account Type options: Roth IRA, Traditional IRA, 401(k), 403(b), DCP, Brokerage, Other.

---

**Tab 3: Loans & Other Debt**

Table columns:
| Institution | Nickname | Last 4 | Type | APR % | Balance | Min. Payment | Due Date | Notes |

APR column has a subtle color scale: ≤5% = green, 5–15% = amber, >15% = red. Same as the Excel conditional formatting — but tasteful.

Footer row: Total debt balance.

---

**Tab 4: Credit Cards**

Table columns:
| Institution | Nickname | Last 4 | Type | APR % | Credit Limit | Min. Payment | Due Date | Closing Date | Annual Fee | FX Fee | Notes/Rewards |

Type options: Standard, Store, Co-Branded, Authorized User.

A utilization figure appears on each row: `$540 / $5,000 — 11%` (pulls balance from the transaction log if linked, otherwise user enters manually).

Footer row: Total credit limit across all cards.

---

**Add Account (bottom sheet):**
Step 1: Choose type (Cash / Investment / Loan / Credit Card)
Step 2: Type-specific form (all fields from the relevant table above)
Step 3: Confirm + save

---

**Credit Score Links section** (below tables):
Three linked rows:
- annualcreditreport.com — Check your full report
- creditkarma.com — Free credit monitoring
- (User can add custom links)

---

### 6.4 Expenses

**Source:** Worksheet "1 - Understand (Expenses)"

**Purpose:** Log spending over a date range, auto-calculate average monthly spend by category, compare to a monthly goal.

**Layout:**

Two-column layout:
- **Left (60%):** Transaction log — the raw input
- **Right (40%):** Category summary — auto-calculated

**Header bar (full width):**
```
Date range: [Oct 1, 2023] to [Dec 31, 2023]    Goal: $3,150/mo    Avg actual: $3,347/mo  ↑ Over by $197
```
All four fields are editable inline.

---

**Left: Transaction Log**

A clean table:
| Date | Description | Category | Amount |

Rows sorted by date descending (newest first). Dates are grouped with a sticky date header.

Category is a dropdown with the full category list from the workbook:
- Housing: Rent/Mortgage, Utilities, Housing Fees, Renter's Insurance, Moving
- Daily Life: Groceries, Health/Medical, Transport/Parking, Gas, Car Fees/Registration, Car Maintenance
- Purchases: Clothing, Life Insurance, Legal, Home Goods, Technology, Tech Subscriptions
- Personal: Personal Care, Education/Office, Pets
- Social: Dining Out, Party Hosting, Travel, Fun Money, Entertainment Subscriptions
- Giving: Charity, Gifts, Family Support
- Savings: IRA, Medical Procedure, New Computer, Wedding, Car Down Payment, Home Down Payment, Emergency Fund
- Debt: Credit Card Balance

FAB at bottom: "+ Add Transaction" opens an inline row at the top of the table with autofocus on Amount.

**Keyboard shortcut:** Press `N` anywhere on this page to add a new transaction.

---

**Right: Category Summary**

A live summary table that recalculates as transactions are added:

| Category | Total | Monthly Avg |
|---|---|---|
| Rent/Mortgage | $4,529.49 | $1,509.83 |
| Gas | $193.44 | $64.48 |
| … | | |
| **Total** | **$10,041** | **$3,347** |

Monthly Avg is calculated as `Total ÷ number of months in the date range` (mirrors the Excel DATEDIF formula).

Categories with no transactions are hidden by default (toggle to show all).

---

### 6.5 Net Worth

**Source:** Worksheet "2 - Create (System - Net Worth)"

**Purpose:** Track net worth month by month as a running log, with a personal growth goal line.

**Layout:**

Header row:
```
Monthly Growth Goal: $[  200  ] / month
```

**Chart (top half):**
A line chart showing:
- Actual net worth (solid line)
- Goal trajectory (dashed line, starts at first logged month + grows by monthly goal)

Clean, minimal Recharts line chart. Two lines only. No area fill. Dots on each data point. Tooltip on hover shows: date, actual net worth, goal net worth, delta.

**Log table (bottom half):**

One row per month logged.

Columns auto-populate from the Accounts section on first use (matching the Excel formula behavior):

| Date | Net Worth | Goal | Cash/CDs | Credit Cards | [Each investment account] | [Each loan] | Note |

- The first row pre-fills from current account balances
- "Net Worth" column = sum of all account columns (formula-like behavior in-app)
- "Goal" column = starts at first net worth, grows by monthly goal each row
- All account columns are editable so user can update each month

**Add Month button:** Appends a new row pre-filled with current balances. User adjusts individual figures as needed.

Inline editing: click any cell to edit. Tab to move to next cell.

---

### 6.6 Income

**Source:** Worksheet "2 - Create (System - Income)"

**Purpose:** Track all income streams paycheck by paycheck: salary, hourly work, fellowships, scholarships, and estimated tax payments.

**Layout:** Two stacked sections.

---

**Section 1: Income Streams**

A card per income stream. Each card shows the stream type and a log table of all pay periods.

**Card: W-2 / Salaried Job**

Pay period log table:
| Pay Period Start | Pay Period End | Paycheck Date | Gross | Federal WH | FICA | Medicare | State WH | Retirement | Other Pre-Tax | Expected Net | Received | Discrepancy |

- "Expected Net" = Gross − sum of all withholding columns (auto-calculated)
- "Discrepancy" = Received − Expected Net (auto-calculated)
- Discrepancy > $0 shows green, < $0 shows red

**Card: Hourly Job**

| Pay Period Start | Pay Period End | Hours | Hourly Rate | Gross | [Same withholding columns] | Expected Net | Received | Discrepancy |

Gross auto-calculates from Hours × Hourly Rate.

**Card: Fellowship / Non-Withheld Income**

| Date | Amount | Notes |

(No withholding columns — but a flag note appears: "⚠ No tax withheld — track estimated payments below.")

**Card: Scholarship / Non-Withheld**

Same structure as Fellowship card.

**Add Income Stream button:** Choose type → fills in appropriate column set.

---

**Section 2: Tax Tracking**

Two side-by-side tables: Federal and State.

**Estimated Tax Payments table:**
| Date | Amount | Confirmation # | Quarter |

Payment due date reminders shown inline: "Q1 due Apr 15" etc.

**Tax Summary (auto-calculated, read-only):**

| | Federal | State |
|---|---|---|
| Withheld (W-2) | $2,300 | $540 |
| Estimated Payments | $1,621 | $300 |
| **Total Paid** | **$3,921** | **$840** |

---

**Income Summary bar (bottom of page):**
```
Total Gross: $42,690    After Withholding: $39,454    Take-Home: $37,929    Avg/Month: $3,161
```
All auto-calculated from all stream entries.

---

### 6.7 Schedule

**Source:** Worksheet "2 - Create (System - Schedule)"

**Purpose:** A financial hygiene task calendar — recurring tasks at every frequency from weekly to annually.

**Layout:**

A single-page checklist grouped by frequency. No calendar view needed — the list *is* the interface.

Each frequency group is a section with a header:
- Weekly / Biweekly
- Monthly
- Quarterly
- Annually

Each task row:
```
[ ]  Pay off credit card balance         →  My date(s): [Every Sunday]
```

The checkbox marks completion for the current period (resets based on frequency). Completed tasks fade slightly but stay visible.

The task list mirrors the Excel exactly:

**Weekly / Biweekly:**
- Review budget + update transactions
- Pay off credit card balance *(helper text: "Paying before the closing date keeps utilization low — CFPB recommends staying under 30%.")*
- Review and track hours worked

**Monthly:**
- Pay minimum monthly payments on all debts
- Pay monthly bills (rent, utilities, etc.)
- Review, download, and save paycheck
- Track net worth (links to Net Worth section)
- Submit employee timesheet

**Quarterly:**
- Pay estimated quarterly taxes (links to Income section)
- Download and save BruinBill Activity PDF
- Check credit card rewards and maximize
- Check credit report at annualcreditreport.com

**Annually:**
- FAFSA application
- Download and check 1098T
- File taxes
- Invest in retirement accounts
- Rebalance investment portfolio
- Review long-term financial goals
- Review all insurance plans
- Review employee benefits / employer financial planning services
- Verify and download employment contracts
- Review lease and other contracts

**My Date(s) column:** User fills in their personal schedule date/note (e.g., "Every Sunday", "15th of each month", "April 15"). This is freeform text — not a date picker. Mirrors the Excel's column C exactly.

**Add custom task:** A small "+ Add task" row at the bottom of each frequency group lets users append their own items.

---

### 6.8 Institutions

**Source:** Worksheet "3 - Compare (Institutions)"

**Purpose:** Side-by-side comparison of banks, credit unions, and brokerages. Also includes a securities reference table and credit card comparison.

**Layout:** Three subsections on one page.

---

**Subsection 1: Banks & Credit Unions**

A wide, horizontally-scrollable comparison table.

Columns:
| Institution | Fees / Minimums | Checking APY | Savings APY | CD 6mo | CD 12mo | CD 24mo | Brokerage | Pros | Cons |

Pre-populated with the same institutions from the Excel as starting examples (clearly labeled "Example data — update with your own research"):
Ally, Marcus, AmEx, Discover, Capital One, Synchrony, Wescom, UCU, Chase, Wells Fargo, etc.

Each cell is editable inline. Empty cells show a dash (–). APY cells have a subtle color scale (higher = greener).

"Currently using" toggle on each row — highlights with a left border accent.

---

**Subsection 2: Brokerages**

A simpler table:
| Brokerage | Min. Investment | Expense Ratios | Pros | Cons |

Pre-populated: Vanguard, Fidelity, Charles Schwab, TIAA.

---

**Subsection 3: Securities Reference**

A small reference table for tracking specific tickers/funds:
| Ticker | Fund Name | Expense Ratio | Notes |

Pre-populated examples: VOO, VTSAX, FZILX, etc. Fully editable.

---

**Subsection 4: Balance Transfer / Credit Cards**

A comparison table for evaluating credit card options:
| Card | Likelihood of Qualifying | Annual Fee | Reward Type | APR | Promo / Reward Details |

---

### 6.9 Emergency Fund Calculator

**Source:** Worksheet "EF Calculator"

**Purpose:** Help the user calculate a personalized emergency fund target by selecting which risk scenarios apply to them.

**Layout:**

Two-column layout:

**Left: Scenario Checklist**

Each row is a toggle with:
- Scenario name
- Example calculation hint (faded text)
- Dollar amount input (what that scenario would cost)

The full scenario list from the workbook:
1. Job Loss / Loss of Income — *Example: 6 months of living expenses*
2. Unexpected Car Repairs
3. Unexpected Home Repairs / Accommodations
4. Medical Costs (Deductible)
5. Medical Costs (Out-of-Pocket Maximum)
6. Unexpected Travel Costs (e.g., funeral)
7. Family Member Emergency — *Example: 1 month of family member's living expenses*
8. Rent / Utility Increases or Overlap — *Example: 2 weeks of current rent*
9. Insurance Policy Increases
10. Moving Expenses
11. "Leaving the Country #2025"

Each row has a Y/N toggle and an amount field. Disabled rows show $0.

**Right: Live Summary**

```
Total Emergency Fund Target:    $12,000
Currently Have (from Accounts): $1,543
Gap:                            $10,457

Monthly savings needed
to keep up with 5% inflation:   $50 / month
```

The total auto-sums all toggled-on rows (mirrors the Excel `=SUM(Table1[Amount])` formula).

"Currently Have" pulls from the total cash accounts balance in the Accounts section.

**CTA:** "Add to Goals" → pre-fills a Goal in the Goals section with the gap amount and a suggested target date based on a monthly savings slider.

---

## 7. Data Model

```typescript
// Goals
interface Goal {
  id: string;
  timeframe: 'short' | 'mid' | 'long';
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  linkedAccountId?: string;
  smart: {
    specific: string;
    measurable: string;
    achievable: string;
    relevant: string;
    timeBound: string;
  };
  createdAt: string;
  completedAt?: string;
}

// Accounts (union type per account type)
type AccountType = 'cash' | 'investment' | 'loan' | 'credit_card';

interface BaseAccount {
  id: string;
  type: AccountType;
  institution: string;
  nickname: string;
  lastFour?: string;
  balance: number;
  notes?: string;
  lastUpdated: string;
}

interface CashAccount extends BaseAccount {
  type: 'cash';
  accountSubtype: string; // checking, savings, CD, cash, etc.
  apy?: number;
}

interface InvestmentAccount extends BaseAccount {
  type: 'investment';
  accountSubtype: string; // Roth IRA, 401(k), brokerage, etc.
  allocationMix?: string;
}

interface LoanAccount extends BaseAccount {
  type: 'loan';
  loanSubtype: string;
  apr: number;
  minimumPayment: number;
  dueDate?: number; // day of month
}

interface CreditCard extends BaseAccount {
  type: 'credit_card';
  cardSubtype: 'standard' | 'store' | 'co-branded' | 'authorized_user';
  apr: number;
  creditLimit: number;
  minimumPayment: number;
  paymentDueDate?: number;
  closingDate?: number;
  annualFee?: number;
  foreignTransactionFee?: number;
  rewards?: string;
}

// Expenses
type ExpenseCategory =
  | 'rent_mortgage' | 'utilities' | 'housing_fees' | 'renters_insurance' | 'moving'
  | 'groceries' | 'health_medical' | 'transport_parking' | 'gas'
  | 'car_fees' | 'car_maintenance' | 'clothing' | 'life_insurance' | 'legal'
  | 'home_goods' | 'technology' | 'tech_subscriptions' | 'personal_care'
  | 'education_office' | 'pets' | 'dining_out' | 'party_hosting' | 'travel'
  | 'fun_money' | 'entertainment_subscriptions' | 'charity' | 'gifts'
  | 'family_support' | 'ira_contributions' | 'savings_other' | 'debt_repayment'
  | 'tax_payments' | 'other';

interface ExpenseSettings {
  startDate: string;
  endDate: string;
  monthlyGoal: number;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  accountId?: string;
}

// Net Worth
interface NetWorthSettings {
  monthlyGrowthGoal: number;
}

interface NetWorthEntry {
  id: string;
  date: string; // YYYY-MM
  values: Record<string, number>; // accountId → balance for that month
  note?: string;
}

// Income
type IncomeStreamType = 'w2' | 'hourly' | 'fellowship' | 'scholarship' | 'other';

interface IncomeStream {
  id: string;
  name: string;
  type: IncomeStreamType;
  isActive: boolean;
}

interface PaycheckEntry {
  id: string;
  streamId: string;
  periodStart: string;
  periodEnd: string;
  paycheckDate: string;
  gross: number;
  hoursWorked?: number; // hourly only
  hourlyRate?: number;  // hourly only
  federalWH: number;
  fica: number;
  medicarEE: number;
  stateWH: number;
  retirement: number;
  otherPreTax: number;
  receivedNet: number;
}

interface EstimatedTaxPayment {
  id: string;
  jurisdiction: 'federal' | 'state';
  date: string;
  amount: number;
  confirmationNumber?: string;
  quarter?: string;
}

// Schedule
type ScheduleFrequency = 'weekly_biweekly' | 'monthly' | 'quarterly' | 'annually';

interface ScheduleItem {
  id: string;
  frequency: ScheduleFrequency;
  task: string;
  myDates: string; // freeform text
  isCustom: boolean;
  completions: string[]; // ISO date strings
}

// Institutions
interface InstitutionComparison {
  id: string;
  name: string;
  type: 'bank' | 'credit_union' | 'brokerage' | 'neobank';
  feesMinimums?: string;
  checkingApy?: number;
  savingsApy?: number;
  cd6mo?: number;
  cd12mo?: number;
  cd24mo?: number;
  hasBrokerage?: boolean;
  pros: string[];
  cons: string[];
  isCurrentlyUsed: boolean;
}

interface SecurityReference {
  id: string;
  ticker: string;
  name: string;
  expenseRatio?: number;
  notes?: string;
}

interface CreditCardComparison {
  id: string;
  card: string;
  likelihood?: string;
  annualFee?: number;
  rewardType?: string;
  apr?: number;
  promoDetails?: string;
}

// Emergency Fund
interface EmergencyFundScenario {
  id: string;
  label: string;
  exampleHint: string;
  enabled: boolean;
  amount: number;
}
```

---

## 8. Feature Completeness Checklist

Every worksheet from the Excel, mapped to an app screen:

| Excel Sheet | App Screen | Status |
|---|---|---|
| Welcome / Index | Overview (auto-calculated) | ✓ Planned |
| 1 - Understand (Goals) | Goals | ✓ Planned |
| 1 - Understand (Accounts) | Accounts | ✓ Planned |
| 1 - Understand (Expenses) | Expenses | ✓ Planned |
| 2 - Create (Net Worth) | Net Worth | ✓ Planned |
| 2 - Create (Income) | Income | ✓ Planned |
| 2 - Create (Schedule) | Schedule | ✓ Planned |
| 3 - Compare (Institutions) | Institutions | ✓ Planned |
| EF Calculator | Emergency Fund | ✓ Planned |

All features from the source document are included. Nothing is deferred to a later version.

---

## 9. Project Structure

```
finance-app/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Table.tsx          # Reusable sortable table
│   │   │   ├── InlineEdit.tsx     # Click-to-edit cell
│   │   │   ├── BottomSheet.tsx    # Slide-up form panel
│   │   │   ├── NumberDisplay.tsx  # Animated rolling number
│   │   │   └── Toggle.tsx         # Y/N toggle row
│   │   ├── charts/
│   │   │   ├── NetWorthLine.tsx   # Two-line net worth chart
│   │   │   ├── SpendingBar.tsx    # Category spending bars
│   │   │   └── MiniSparkline.tsx  # Dashboard sparkline
│   │   └── layout/
│   │       ├── Sidebar.tsx        # Fixed left nav
│   │       ├── PageHeader.tsx     # Page title + primary action
│   │       └── SummaryBar.tsx     # Sticky totals bar
│   ├── pages/
│   │   ├── Overview.tsx
│   │   ├── Goals.tsx
│   │   ├── Accounts.tsx
│   │   ├── Expenses.tsx
│   │   ├── NetWorth.tsx
│   │   ├── Income.tsx
│   │   ├── Schedule.tsx
│   │   ├── Institutions.tsx
│   │   └── EmergencyFund.tsx
│   ├── store/
│   │   ├── index.ts               # Root Zustand store with persist
│   │   ├── goalsSlice.ts
│   │   ├── accountsSlice.ts
│   │   ├── expensesSlice.ts
│   │   ├── netWorthSlice.ts
│   │   ├── incomeSlice.ts
│   │   ├── scheduleSlice.ts
│   │   ├── institutionsSlice.ts
│   │   └── emergencyFundSlice.ts
│   ├── lib/
│   │   ├── calculations.ts        # Net worth, avg monthly spend, tax totals
│   │   ├── formatters.ts          # Currency, date, % formatters
│   │   └── export.ts              # JSON export + import
│   ├── types/
│   │   └── index.ts               # All TypeScript interfaces (above)
│   ├── App.tsx
│   ├── router.tsx
│   └── main.tsx
├── public/
├── index.html
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 10. Build Sequence

The right order to build this, given dependencies:

1. **Types + Store skeleton** — Define all TypeScript interfaces and Zustand store shape first. Everything is downstream of this.
2. **Layout shell** — Sidebar, page router, PageHeader component. Get navigation working with empty pages.
3. **Accounts page** — The foundation. Net Worth, Overview, and EF Calculator all pull from account balances. Build this before any calculation-dependent screens.
4. **Expenses page** — Transaction log + category summary. Core daily-use screen.
5. **Goals page** — Standalone, no dependencies on other pages.
6. **Net Worth page** — Depends on Accounts for starting values.
7. **Income page** — Complex but self-contained. Build after simpler pages are solid.
8. **Schedule page** — Simple list UI, low complexity.
9. **Institutions page** — Mostly static comparison tables. Low complexity.
10. **Emergency Fund page** — Pulls from Accounts (cash total). Build after Accounts is solid.
11. **Overview page** — Last, because it pulls auto-calculated data from every other page.
12. **Polish pass** — Animations, transitions, empty states, keyboard shortcuts, export/import.

---

*Last updated: 2026-02-19*
